"use client"

import { useState } from "react"
import { useTaskContext } from "./task-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bug, ChevronDown, ChevronUp } from "lucide-react"

export function DebugPanel() {
  const { tasks } = useTaskContext()
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="mt-8">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center">
            <Bug className="h-4 w-4 mr-2" />
            Debug Panel
          </div>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="text-xs">
            <p>Total Tasks: {tasks.length}</p>
            <div className="mt-2">
              <p className="font-medium">Task IDs:</p>
              <ul className="mt-1 space-y-1">
                {tasks.map((task) => (
                  <li key={task.id}>
                    {task.id}: {task.title} ({task.project})
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  console.log("Current tasks:", tasks)
                }}
              >
                Log Tasks
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  localStorage.clear()
                  window.location.reload()
                }}
              >
                Clear Storage & Reload
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
