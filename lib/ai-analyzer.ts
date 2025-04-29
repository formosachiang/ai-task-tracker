"use client"

import { type Task, type AIAnalysis, TaskStatus, FollowUpStatus, MentionedStatus } from "./types"

export async function analyzeTaskStatus(task: Task): Promise<AIAnalysis> {
  try {
    // Real AI analysis logic based on the dataset fields
    const now = new Date()
    const dueDate = new Date(task.dueDate)
    const lastMentioned = new Date(task.lastMentioned)

    const daysSinceLastMention = Math.floor((now.getTime() - lastMentioned.getTime()) / (1000 * 60 * 60 * 24))
    const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))

    // If the task is completed, it's not ghosted
    if (task.status === TaskStatus.Completed || task.finalResolution) {
      return {
        isGhosted: false,
        confidence: 0.95,
        reasoning: task.finalResolution ? `Task resolved: ${task.finalResolution}` : "Task is already completed",
        suggestedAction: "No action needed",
      }
    }

    // Determine if the task is ghosted
    let isGhosted = false
    let confidence = 0.5
    let reasoning = ""
    let suggestedAction = ""

    // Key ghosting indicators from our dataset:
    // 1. Not mentioned in meeting
    // 2. No follow-up scheduled
    // 3. Past due date
    // 4. Not mentioned recently

    const notMentionedInMeeting = task.mentionedInMeeting === MentionedStatus.No
    const noFollowUpScheduled = task.followUpScheduled === FollowUpStatus.No
    const isPastDue = daysOverdue > 0
    const notMentionedRecently = daysSinceLastMention > 14

    // Calculate ghosting score
    let ghostingFactors = 0
    if (notMentionedInMeeting) ghostingFactors++
    if (noFollowUpScheduled) ghostingFactors++
    if (isPastDue) ghostingFactors++
    if (notMentionedRecently) ghostingFactors++

    if (ghostingFactors >= 3) {
      isGhosted = true
      confidence = 0.7 + ghostingFactors * 0.07 // Max 0.98 with all 4 factors

      // Build reasoning based on factors
      const reasons = []
      if (isPastDue) reasons.push(`Task is ${daysOverdue} days overdue`)
      if (notMentionedRecently) reasons.push(`Not mentioned for ${daysSinceLastMention} days`)
      if (notMentionedInMeeting) reasons.push("Not brought up in meetings")
      if (noFollowUpScheduled) reasons.push("No follow-up scheduled")

      reasoning = reasons.join(". ")

      // Suggest actions
      if (isPastDue && daysOverdue > 30) {
        suggestedAction = `Urgent: Escalate to ${task.owner}'s manager or reassign task`
      } else if (isPastDue) {
        suggestedAction = `Schedule immediate follow-up with ${task.owner}`
      } else if (notMentionedRecently) {
        suggestedAction = `Add to next meeting agenda and contact ${task.owner}`
      } else {
        suggestedAction = `Check with ${task.owner} for status update`
      }
    } else if (ghostingFactors === 2) {
      isGhosted = true
      confidence = 0.6

      if (isPastDue) {
        reasoning = `Task is ${daysOverdue} days overdue and needs attention`
        suggestedAction = `Follow up with ${task.owner} about overdue task`
      } else if (notMentionedRecently) {
        reasoning = `Task hasn't been mentioned for ${daysSinceLastMention} days`
        suggestedAction = `Check with ${task.owner} for status update`
      } else {
        reasoning = "Task shows early signs of being forgotten"
        suggestedAction = "Monitor closely and add to next meeting agenda"
      }
    } else {
      isGhosted = false
      confidence = 0.8
      reasoning = "Task appears to be on track"
      suggestedAction = "Continue normal monitoring"
    }

    return {
      isGhosted,
      confidence,
      reasoning,
      suggestedAction,
    }
  } catch (error) {
    console.error("Error analyzing task:", error)

    // Return a default analysis in case of error
    return {
      isGhosted: false,
      confidence: 0.5,
      reasoning: "Unable to analyze task due to an error",
      suggestedAction: "Manual review recommended",
    }
  }
}

export async function analyzeAllTasks(tasks: Task[]): Promise<Task[]> {
  const analyzedTasks = await Promise.all(
    tasks.map(async (task) => {
      const analysis = await analyzeTaskStatus(task)
      return {
        ...task,
        aiAnalysis: analysis,
      }
    }),
  )

  return analyzedTasks
}

export function getTaskInsights(tasks: Task[]) {
  const ghostedTasks = tasks.filter((task) => task.aiAnalysis?.isGhosted)
  const completedTasks = tasks.filter((task) => task.status === TaskStatus.Completed || task.finalResolution)
  const pendingTasks = tasks.filter((task) => task.status !== TaskStatus.Completed && !task.finalResolution)

  // Get projects with most ghosted tasks
  const projectGhostedCounts: Record<string, number> = {}
  ghostedTasks.forEach((task) => {
    projectGhostedCounts[task.project] = (projectGhostedCounts[task.project] || 0) + 1
  })

  // Get owners with most ghosted tasks
  const ownerGhostedCounts: Record<string, number> = {}
  ghostedTasks.forEach((task) => {
    ownerGhostedCounts[task.owner] = (ownerGhostedCounts[task.owner] || 0) + 1
  })

  // Sort projects and owners by ghosted count
  const projectsRanked = Object.entries(projectGhostedCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([project, count]) => ({ project, count }))

  const ownersRanked = Object.entries(ownerGhostedCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([owner, count]) => ({ owner, count }))

  return {
    totalTasks: tasks.length,
    ghostedCount: ghostedTasks.length,
    completedCount: completedTasks.length,
    pendingCount: pendingTasks.length,
    ghostedPercentage: Math.round((ghostedTasks.length / tasks.length) * 100),
    projectsWithMostGhosted: projectsRanked,
    ownersWithMostGhosted: ownersRanked,
  }
}
