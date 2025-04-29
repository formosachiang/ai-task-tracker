"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { Task } from "@/lib/types"
import { analyzeAllTasks, getTaskInsights } from "@/lib/ai-analyzer"
import { fetchTaskData } from "@/lib/data-service"
import { saveTasks, loadTasks } from "@/lib/storage-utils"

type TaskContextType = {
  tasks: Task[]
  addTask: (task: Omit<Task, "id" | "createdAt" | "status" | "aiAnalysis"> & { id?: string }) => string
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  ghostedTasks: Task[]
  refreshAnalysis: () => Promise<void>
  isLoading: boolean
  insights: any
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [insights, setInsights] = useState<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  const ghostedTasks = tasks.filter((task) => task.aiAnalysis?.isGhosted)

  // Add a task and return the new task ID
  const addTask = (task: Omit<Task, "id" | "createdAt" | "status" | "aiAnalysis"> & { id?: string }): string => {
    const taskId = task.id || Math.random().toString(36).substring(2, 9)

    const newTask: Task = {
      ...task,
      id: taskId,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      status: "pending",
      mentionedInMeeting: task.mentionedInMeeting || "No",
      lastMentioned: task.lastMentioned || new Date().toISOString(),
      followUpScheduled: task.followUpScheduled || "No",
      aiAnalysis: {
        isGhosted: false,
        confidence: 0,
        reasoning: "New task, not yet analyzed",
        suggestedAction: "Monitor for progress",
      },
    } as Task

    console.log("Adding task to state:", newTask)

    // Update state and persist to localStorage
    setTasks((prev) => {
      const updatedTasks = [...prev, newTask]
      saveTasks(updatedTasks)
      return updatedTasks
    })

    return taskId
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) => {
      const updatedTasks = prev.map((task) =>
        task.id === id
          ? {
              ...task,
              ...updates,
              lastUpdated: new Date().toISOString(),
            }
          : task,
      )
      saveTasks(updatedTasks)
      return updatedTasks
    })
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => {
      const updatedTasks = prev.filter((task) => task.id !== id)
      saveTasks(updatedTasks)
      return updatedTasks
    })
  }

  const refreshAnalysis = async () => {
    const analyzedTasks = await analyzeAllTasks(tasks)

    setTasks(analyzedTasks)
    saveTasks(analyzedTasks)

    // Update insights
    const newInsights = getTaskInsights(analyzedTasks)
    setInsights(newInsights)
  }

  // Load initial data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        // First check if we have tasks in localStorage
        const storedTasks = loadTasks()

        if (storedTasks.length > 0) {
          console.log("Loaded tasks from localStorage:", storedTasks.length)
          const analyzedData = await analyzeAllTasks(storedTasks)
          setTasks(analyzedData)

          // Generate insights
          const newInsights = getTaskInsights(analyzedData)
          setInsights(newInsights)
        } else {
          // If no stored tasks, fetch from remote
          console.log("No tasks in localStorage, fetching from remote")
          const data = await fetchTaskData()
          const analyzedData = await analyzeAllTasks(data)
          setTasks(analyzedData)
          saveTasks(analyzedData)

          // Generate insights
          const newInsights = getTaskInsights(analyzedData)
          setInsights(newInsights)
        }
      } catch (error) {
        console.error("Error loading task data:", error)
      } finally {
        setIsLoading(false)
        setIsInitialized(true)
      }
    }

    loadData()
  }, [])

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        ghostedTasks,
        refreshAnalysis,
        isLoading,
        insights,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTaskContext() {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error("useTaskContext must be used within a TaskProvider")
  }
  return context
}
