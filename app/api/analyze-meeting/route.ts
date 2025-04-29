import { NextResponse } from "next/server"
import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import type { Task } from "@/lib/types"

// Schema for extracted action items
const ActionItemSchema = z.object({
  description: z.string(),
  owner: z.string().optional(),
  dueDate: z.string().optional(),
  project: z.string().optional(),
  isStatusUpdate: z.boolean(),
  relatedTaskId: z.string().optional(),
  status: z.string().optional(),
})

const MeetingAnalysisSchema = z.object({
  actionItems: z.array(ActionItemSchema),
  mentionedTaskIds: z.array(z.string()).optional(),
  summary: z.string(),
})

export async function POST(request: Request) {
  try {
    const { meetingNotes, existingTasks } = await request.json()

    if (!meetingNotes) {
      return NextResponse.json({ error: "Meeting notes are required" }, { status: 400 })
    }

    // Create a simplified list of existing tasks for the LLM to reference
    const existingTasksFormatted = existingTasks.map((task: Task) => ({
      id: task.id,
      description: task.description,
      owner: task.owner,
      project: task.project,
    }))

    // Use AI SDK to analyze the meeting notes
    try {
      const { object } = await generateObject({
        model: openai("gpt-4o"),
        schema: MeetingAnalysisSchema,
        prompt: `
          You are an AI assistant specialized in analyzing meeting notes to extract action items and status updates.
          
          EXISTING TASKS:
          ${JSON.stringify(existingTasksFormatted)}
          
          MEETING NOTES:
          ${meetingNotes}
          
          Please analyze these meeting notes and:
          1. Extract all action items (tasks, decisions needed, follow-ups required)
          2. For each action item, determine if it's a new task or a status update for an existing task
          3. If it's a status update, identify which existing task it relates to
          4. Extract any mentioned due dates, owners, and project context
          5. Provide a brief summary of the meeting
          
          For each action item, include:
          - description: The full description of the action item
          - owner: Who is responsible (if mentioned)
          - dueDate: When it's due (if mentioned, in YYYY-MM-DD format)
          - project: Which project it belongs to (if mentioned)
          - isStatusUpdate: true if this is an update to an existing task, false if it's a new task
          - relatedTaskId: If it's a status update, the ID of the existing task it relates to
          - status: Any status information mentioned (e.g., "in progress", "completed", "delayed")
          
          Also include an array of task IDs that were mentioned in the meeting but didn't have specific updates.
          
          IMPORTANT: Be thorough and extract ALL action items from the meeting notes. Don't miss any tasks or follow-ups.
        `,
      })

      return NextResponse.json(object)
    } catch (error) {
      console.error("Error calling OpenAI:", error)

      // Fallback to a simpler implementation if OpenAI fails
      const fallbackAnalysis = {
        actionItems: extractActionItemsFallback(meetingNotes, existingTasks),
        mentionedTaskIds: [],
        summary: "Meeting notes analyzed with fallback method. Some action items may have been extracted.",
      }

      return NextResponse.json(fallbackAnalysis)
    }
  } catch (error) {
    console.error("Error analyzing meeting notes:", error)
    return NextResponse.json({ error: "Failed to analyze meeting notes" }, { status: 500 })
  }
}

// Fallback function to extract action items if OpenAI fails
function extractActionItemsFallback(meetingNotes: string, existingTasks: Task[]) {
  const actionItems = []
  const lines = meetingNotes.split("\n")

  for (const line of lines) {
    const trimmedLine = line.trim()

    // Skip empty lines or very short lines
    if (!trimmedLine || trimmedLine.length < 10) continue

    // Check for action item indicators
    const isActionItem =
      trimmedLine.includes("will ") ||
      trimmedLine.includes("needs to ") ||
      trimmedLine.includes("should ") ||
      trimmedLine.includes("to do:") ||
      trimmedLine.includes("action item") ||
      trimmedLine.includes("follow up") ||
      (trimmedLine.startsWith("-") &&
        (trimmedLine.includes("will") ||
          trimmedLine.includes("need") ||
          trimmedLine.includes("should") ||
          trimmedLine.includes("must")))

    if (isActionItem) {
      actionItems.push({
        description: trimmedLine.replace(/^-\s*/, ""),
        isStatusUpdate: false,
      })
    }
  }

  return actionItems
}
