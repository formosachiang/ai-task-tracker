export enum TaskType {
  Task = "Task",
  Decision = "Decision",
  FollowUp = "Follow-up",
}

export enum TaskStatus {
  Pending = "pending",
  InProgress = "in-progress",
  Completed = "completed",
}

export enum MentionedStatus {
  Yes = "Yes",
  No = "No",
}

export enum FollowUpStatus {
  Yes = "Yes",
  No = "No",
}

export type AIAnalysis = {
  isGhosted: boolean
  confidence: number
  reasoning: string
  suggestedAction: string
}

export type Comment = {
  id: string
  text: string
  createdAt: string
  author: string
}

export type Task = {
  id: string
  project: string
  title: string
  description: string
  type: TaskType
  dueDate: string
  owner: string
  status: TaskStatus
  createdAt: string
  lastUpdated: string
  mentionedInMeeting: MentionedStatus
  lastMentioned: string
  followUpScheduled: FollowUpStatus
  finalResolution?: string
  aiAnalysis?: AIAnalysis
  comments?: Comment[]
}

export type RawTaskData = {
  Project: string
  Task_Description: string
  Owner: string
  Status: string
  Mentioned_in_Meeting: string
  Original_Due_Date: string
  Last_Mentioned: string
  Follow_Up_Scheduled: string
  Final_Resolution: string
}
