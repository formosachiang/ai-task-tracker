import type { Task } from "./types"

const TASKS_STORAGE_KEY = "taskradar-tasks"

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks))
  } catch (error) {
    console.error("Error saving tasks to localStorage:", error)
  }
}

export function loadTasks(): Task[] {
  try {
    const tasksJson = localStorage.getItem(TASKS_STORAGE_KEY)
    return tasksJson ? JSON.parse(tasksJson) : []
  } catch (error) {
    console.error("Error loading tasks from localStorage:", error)
    return []
  }
}

export function clearTasks(): void {
  try {
    localStorage.removeItem(TASKS_STORAGE_KEY)
  } catch (error) {
    console.error("Error clearing tasks from localStorage:", error)
  }
}
