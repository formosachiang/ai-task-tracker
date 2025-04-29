"use client"

import { useState } from "react"
import { useTaskContext } from "./task-provider"
import { TaskList } from "./task-list"
import { GhostedTasksAlert } from "./ghosted-tasks-alert"
import { AddTaskDialog } from "./add-task-dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, Plus, AlertTriangle, FileText } from "lucide-react"
import { TaskInsights } from "./task-insights"
import { LoadingSpinner } from "./loading-spinner"
import Link from "next/link"

export function TaskDashboard() {
  const { tasks, ghostedTasks, refreshAnalysis, isLoading, insights } = useTaskContext()
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshAnalysis()
    setIsRefreshing(false)
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {ghostedTasks.length > 0 && <GhostedTasksAlert tasks={ghostedTasks} />}

      {insights && <TaskInsights insights={insights} />}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">Task Management</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Analyzing..." : "Analyze Tasks"}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/meeting-notes">
              <FileText className="h-4 w-4 mr-2" />
              Meeting Notes
            </Link>
          </Button>
          <Button onClick={() => setIsAddingTask(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="all">All Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="ghosted" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Ghosted ({ghostedTasks.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="by-project">By Project</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <TaskList tasks={tasks} />
        </TabsContent>

        <TabsContent value="ghosted">
          <TaskList tasks={ghostedTasks} />
        </TabsContent>

        <TabsContent value="upcoming">
          <TaskList
            tasks={tasks.filter((task) => new Date(task.dueDate) > new Date() && task.status !== "completed")}
          />
        </TabsContent>

        <TabsContent value="completed">
          <TaskList tasks={tasks.filter((task) => task.status === "completed" || task.finalResolution)} />
        </TabsContent>

        <TabsContent value="by-project">
          <TasksByProject tasks={tasks} />
        </TabsContent>
      </Tabs>

      <AddTaskDialog open={isAddingTask} onOpenChange={setIsAddingTask} />
    </div>
  )
}

function TasksByProject({ tasks }: { tasks: any[] }) {
  // Group tasks by project
  const projectGroups: Record<string, any[]> = {}

  tasks.forEach((task) => {
    if (!projectGroups[task.project]) {
      projectGroups[task.project] = []
    }
    projectGroups[task.project].push(task)
  })

  return (
    <div className="space-y-8">
      {Object.entries(projectGroups).map(([project, projectTasks]) => (
        <div key={project} className="space-y-4">
          <h3 className="text-xl font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
            {project}
            <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
              ({projectTasks.length} tasks)
            </span>
          </h3>
          <TaskList tasks={projectTasks} />
        </div>
      ))}
    </div>
  )
}
