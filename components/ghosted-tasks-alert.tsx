"use client"

import type { Task } from "@/lib/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

type GhostedTasksAlertProps = {
  tasks: Task[]
}

export function GhostedTasksAlert({ tasks }: GhostedTasksAlertProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Alert className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50">
      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
      <AlertTitle className="text-red-700 dark:text-red-300">
        Attention Required: {tasks.length} Ghosted {tasks.length === 1 ? "Task" : "Tasks"} Detected
      </AlertTitle>
      <AlertDescription className="text-red-600 dark:text-red-300">
        <p className="mb-2">
          The AI has identified {tasks.length} {tasks.length === 1 ? "task" : "tasks"} that{" "}
          {tasks.length === 1 ? "requires" : "require"} immediate attention.
        </p>

        {expanded && (
          <ul className="list-disc pl-5 space-y-1 mb-3">
            {tasks.map((task) => (
              <li key={task.id}>
                <span className="font-medium">{task.title}</span> - {task.aiAnalysis?.suggestedAction}
              </li>
            ))}
          </ul>
        )}

        <Button
          variant="outline"
          size="sm"
          className="mt-1 bg-white dark:bg-slate-900 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-950"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Show Less" : "Show Details"}
        </Button>
      </AlertDescription>
    </Alert>
  )
}
