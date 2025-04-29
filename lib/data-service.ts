import { type RawTaskData, type Task, TaskStatus, TaskType, type MentionedStatus, type FollowUpStatus } from "./types"

export async function fetchTaskData(): Promise<Task[]> {
  try {
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/week%202%20-%20Problem_5_-_Follow-Up_Vortex_Tracker-Gi2yStMPWgBKHRRuWS3Acyt2LeBkH7.csv",
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`)
    }

    const csvText = await response.text()
    const parsedData = parseCSV(csvText)
    return transformData(parsedData)
  } catch (error) {
    console.error("Error fetching task data:", error)
    return []
  }
}

function parseCSV(csvText: string): RawTaskData[] {
  const lines = csvText.split("\n")
  const headers = lines[0].split(",").map((header) => header.trim())

  const data: RawTaskData[] = []

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue

    // Handle commas within quoted fields
    const values: string[] = []
    let currentValue = ""
    let insideQuotes = false

    for (const char of lines[i]) {
      if (char === '"') {
        insideQuotes = !insideQuotes
      } else if (char === "," && !insideQuotes) {
        values.push(currentValue.trim())
        currentValue = ""
      } else {
        currentValue += char
      }
    }
    values.push(currentValue.trim())

    // Remove quotes from values
    const cleanValues = values.map((val) => val.replace(/^"|"$/g, ""))

    const row: any = {}
    headers.forEach((header, index) => {
      if (index < cleanValues.length) {
        row[header] = cleanValues[index]
      } else {
        row[header] = ""
      }
    })

    data.push(row as RawTaskData)
  }

  return data
}

function transformData(rawData: RawTaskData[]): Task[] {
  return rawData.map((item, index) => {
    // Determine task type based on description
    let taskType = TaskType.Task
    if (
      item.Task_Description.toLowerCase().includes("decision") ||
      item.Task_Description.toLowerCase().includes("decide")
    ) {
      taskType = TaskType.Decision
    } else if (
      item.Task_Description.toLowerCase().includes("follow") ||
      item.Task_Description.toLowerCase().includes("update")
    ) {
      taskType = TaskType.FollowUp
    }

    // Map status
    let status = TaskStatus.Pending
    if (
      item.Status.toLowerCase() === "completed" ||
      item.Status.toLowerCase() === "closed" ||
      item.Status.toLowerCase() === "done"
    ) {
      status = TaskStatus.Completed
    } else if (
      item.Status.toLowerCase() === "in progress" ||
      item.Status.toLowerCase() === "in-progress" ||
      item.Status.toLowerCase() === "started"
    ) {
      status = TaskStatus.InProgress
    }

    // Format dates
    const dueDate = formatDate(item.Original_Due_Date)
    const lastMentioned = formatDate(item.Last_Mentioned)

    return {
      id: `task-${index + 1}`,
      project: item.Project,
      title: item.Task_Description,
      description: item.Task_Description,
      type: taskType,
      dueDate: dueDate,
      owner: item.Owner,
      status: status,
      createdAt: dueDate, // Using due date as proxy for created date since we don't have that info
      lastUpdated: lastMentioned,
      mentionedInMeeting: item.Mentioned_in_Meeting as MentionedStatus,
      lastMentioned: lastMentioned,
      followUpScheduled: item.Follow_Up_Scheduled as FollowUpStatus,
      finalResolution: item.Final_Resolution || undefined,
      aiAnalysis: undefined, // Will be filled in by the AI analyzer
      comments: [],
    }
  })
}

function formatDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString()

  try {
    // Handle different date formats
    let date: Date

    // Check if it's in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      date = new Date(dateStr)
    }
    // Check if it's in MM/DD/YYYY format
    else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
      const [month, day, year] = dateStr.split("/")
      date = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`)
    }
    // Default fallback
    else {
      date = new Date(dateStr)
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return new Date().toISOString()
    }

    return date.toISOString()
  } catch (error) {
    console.error(`Error parsing date: ${dateStr}`, error)
    return new Date().toISOString()
  }
}
