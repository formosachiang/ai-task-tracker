"use client"

import { z } from "zod"
import { type Task, TaskType, MentionedStatus, FollowUpStatus } from "./types"

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

type ActionItem = z.infer<typeof ActionItemSchema>
type MeetingAnalysis = z.infer<typeof MeetingAnalysisSchema>

export async function analyzeMeetingNotes(meetingNotes: string, existingTasks: Task[]): Promise<MeetingAnalysis> {
  try {
    // Call the server-side API endpoint instead of using OpenAI directly
    const response = await fetch("/api/analyze-meeting", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meetingNotes,
        existingTasks,
      }),
    })

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error analyzing meeting notes:", error)
    // Fallback to mock implementation if there's an error
    return mockAnalyzeMeetingNotes(meetingNotes, existingTasks)
  }
}

// Mock implementation that simulates AI analysis when the API call fails
function mockAnalyzeMeetingNotes(meetingNotes: string, existingTasks: Task[]): Promise<MeetingAnalysis> {
  return new Promise((resolve) => {
    // Simulate processing time
    setTimeout(() => {
      const lowerNotes = meetingNotes.toLowerCase()
      const actionItems: any[] = []
      const mentionedTaskIds: string[] = []

      // Extract potential action items based on keywords
      const lines = meetingNotes.split("\n")

      // Look for lines that might contain action items
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
          // Try to extract owner
          let owner = "Unassigned"
          const nameMatch = trimmedLine.match(/([A-Z][a-z]+)(?:\s+will|\s+needs|\s+should|\s+to)/)
          if (nameMatch) {
            owner = nameMatch[1]
          }

          // Try to extract project context
          let project = "Extracted from Meeting"
          const projectKeywords = ["project", "campaign", "initiative", "website", "app", "product"]
          for (const keyword of projectKeywords) {
            if (trimmedLine.toLowerCase().includes(keyword)) {
              const projectMatch = trimmedLine.match(new RegExp(`(\\w+\\s+${keyword})`, "i"))
              if (projectMatch) {
                project = projectMatch[1]
                break
              }
            }
          }

          // Check if this might be an update to an existing task
          let isStatusUpdate = false
          let relatedTaskId = undefined
          let status = undefined

          // Check if this line mentions any existing tasks
          for (const task of existingTasks) {
            const taskWords = task.description.toLowerCase().split(" ")
            const significantWords = taskWords.filter((word) => word.length > 4)

            // Check if multiple significant words from the task appear in this line
            let matchCount = 0
            for (const word of significantWords) {
              if (trimmedLine.toLowerCase().includes(word)) {
                matchCount++
              }
            }

            if (matchCount >= 2 || trimmedLine.toLowerCase().includes(task.description.toLowerCase())) {
              isStatusUpdate = true
              relatedTaskId = task.id

              // Try to determine status
              if (
                trimmedLine.toLowerCase().includes("complet") ||
                trimmedLine.toLowerCase().includes("done") ||
                trimmedLine.toLowerCase().includes("finished")
              ) {
                status = "completed"
              } else if (
                trimmedLine.toLowerCase().includes("in progress") ||
                trimmedLine.toLowerCase().includes("working on") ||
                trimmedLine.toLowerCase().includes("started")
              ) {
                status = "in-progress"
              } else if (
                trimmedLine.toLowerCase().includes("delay") ||
                trimmedLine.toLowerCase().includes("behind") ||
                trimmedLine.toLowerCase().includes("issue")
              ) {
                status = "delayed"
              }

              break
            }
          }

          // Add as action item
          actionItems.push({
            description: trimmedLine.replace(/^-\s*/, ""),
            owner,
            project,
            isStatusUpdate,
            relatedTaskId,
            status,
          })
        }

        // Check if this line mentions any existing tasks without being an action item
        if (!isActionItem) {
          for (const task of existingTasks) {
            if (
              trimmedLine.toLowerCase().includes(task.description.toLowerCase()) &&
              !mentionedTaskIds.includes(task.id)
            ) {
              mentionedTaskIds.push(task.id)
            }
          }
        }
      }

      // Generate a simple summary
      let summary = "Meeting notes analyzed. "
      if (actionItems.length > 0) {
        summary += `Found ${actionItems.length} action items. `
      }
      if (mentionedTaskIds.length > 0) {
        summary += `${mentionedTaskIds.length} existing tasks were mentioned.`
      }

      resolve({
        actionItems,
        mentionedTaskIds,
        summary,
      })
    }, 1500) // Simulate processing delay
  })
}

export function processAnalysisResults(
  analysis: MeetingAnalysis,
  existingTasks: Task[],
  addTask: (task: Omit<Task, "id" | "createdAt" | "status" | "aiAnalysis">) => void,
  updateTask: (id: string, updates: Partial<Task>) => void,
): {
  updatedTasks: string[]
  newTasks: string[]
} {
  const updatedTasks: string[] = []
  const newTasks: string[] = []

  // Process action items
  for (const item of analysis.actionItems) {
    if (item.isStatusUpdate && item.relatedTaskId) {
      // Update existing task
      const taskToUpdate = existingTasks.find((t) => t.id === item.relatedTaskId)
      if (taskToUpdate) {
        const updates: Partial<Task> = {
          mentionedInMeeting: MentionedStatus.Yes,
          lastMentioned: new Date().toISOString(),
        }

        // Add comment with the status update
        const statusComment = {
          id: Math.random().toString(36).substring(2, 9),
          text: `Status update from meeting: ${item.description}${item.status ? ` (Status: ${item.status})` : ""}`,
          createdAt: new Date().toISOString(),
          author: "Meeting Notes AI",
        }

        updates.comments = [...(taskToUpdate.comments || []), statusComment]

        // Update status if provided
        if (item.status) {
          if (
            item.status.toLowerCase().includes("complete") ||
            item.status.toLowerCase().includes("done") ||
            item.status.toLowerCase().includes("finished")
          ) {
            updates.status = "completed"
          } else if (
            item.status.toLowerCase().includes("in progress") ||
            item.status.toLowerCase().includes("started") ||
            item.status.toLowerCase().includes("working")
          ) {
            updates.status = "in-progress"
          }
        }

        // Update task
        updateTask(taskToUpdate.id, updates)
        updatedTasks.push(taskToUpdate.id)
      }
    } else {
      // Create new task
      const taskType = determineTaskType(item.description)

      const newTask = {
        project: item.project || "Extracted from Meeting",
        title: item.description,
        description: item.description,
        type: taskType,
        dueDate: item.dueDate
          ? new Date(item.dueDate).toISOString()
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        owner: item.owner || "Unassigned",
        mentionedInMeeting: MentionedStatus.Yes,
        lastMentioned: new Date().toISOString(),
        followUpScheduled: FollowUpStatus.No,
      }

      // Add the task and store its description
      addTask(newTask)
      newTasks.push(item.description)

      // Log for debugging
      console.log("Added new task:", item.description)
    }
  }

  // Update tasks that were mentioned but didn't have specific updates
  if (analysis.mentionedTaskIds) {
    for (const taskId of analysis.mentionedTaskIds) {
      const task = existingTasks.find((t) => t.id === taskId)
      if (task && !updatedTasks.includes(taskId)) {
        updateTask(taskId, {
          mentionedInMeeting: MentionedStatus.Yes,
          lastMentioned: new Date().toISOString(),
        })
        updatedTasks.push(taskId)
      }
    }
  }

  return { updatedTasks, newTasks }
}

function determineTaskType(description: string): TaskType {
  const lowerDesc = description.toLowerCase()

  if (
    lowerDesc.includes("decide") ||
    lowerDesc.includes("decision") ||
    lowerDesc.includes("choose") ||
    lowerDesc.includes("determine") ||
    lowerDesc.includes("select")
  ) {
    return TaskType.Decision
  } else if (
    lowerDesc.includes("follow up") ||
    lowerDesc.includes("follow-up") ||
    lowerDesc.includes("check in") ||
    lowerDesc.includes("check-in") ||
    lowerDesc.includes("update on")
  ) {
    return TaskType.FollowUp
  } else {
    return TaskType.Task
  }
}
