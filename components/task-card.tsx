"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { type Task, TaskStatus, TaskType, FollowUpStatus, MentionedStatus } from "@/lib/types"
import { useTaskContext } from "./task-provider"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertTriangle, Calendar, CheckCircle2, Clock, MoreVertical, User, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { TaskDetailsDialog } from "./task-details-dialog"

type TaskCardProps = {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const { updateTask, deleteTask } = useTaskContext()
  const [showDetails, setShowDetails] = useState(false)

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== TaskStatus.Completed
  const isCompleted = task.status === TaskStatus.Completed || task.finalResolution

  const getTaskTypeIcon = () => {
    switch (task.type) {
      case TaskType.Task:
        return <CheckCircle2 className="h-4 w-4" />
      case TaskType.Decision:
        return <AlertTriangle className="h-4 w-4" />
      case TaskType.FollowUp:
        return <Clock className="h-4 w-4" />
      default:
        return <CheckCircle2 className="h-4 w-4" />
    }
  }

  const getTaskTypeColor = () => {
    switch (task.type) {
      case TaskType.Task:
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
      case TaskType.Decision:
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
      case TaskType.FollowUp:
        return "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400"
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
    }
  }

  const toggleCompleted = () => {
    updateTask(task.id, {
      status: isCompleted ? TaskStatus.InProgress : TaskStatus.Completed,
    })
  }

  return (
    <>
      <Card
        className={`
        transition-all duration-200
        ${task.aiAnalysis?.isGhosted ? "border-red-300 dark:border-red-800 shadow-md" : ""}
        ${isCompleted ? "opacity-70" : ""}
      `}
      >
        <CardHeader className="pb-2 flex flex-row justify-between items-start">
          <div className="flex items-center gap-2">
            <Checkbox checked={isCompleted} onCheckedChange={toggleCompleted} id={`task-${task.id}`} />
            <div>
              <Badge className={`${getTaskTypeColor()} flex items-center gap-1`}>
                {getTaskTypeIcon()}
                {task.type}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowDetails(true)}>View Details</DropdownMenuItem>
              <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-red-600 dark:text-red-400">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="pb-2">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{task.project}</div>
          <h3
            className={`font-medium text-lg mb-1 ${isCompleted ? "line-through text-slate-500 dark:text-slate-400" : "text-slate-900 dark:text-white"}`}
          >
            {task.title}
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2">{task.description}</p>
        </CardContent>

        <CardFooter className="flex flex-col items-start pt-0">
          <div className="w-full flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {task.owner}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span className={isOverdue ? "text-red-500 dark:text-red-400 font-medium" : ""}>
                {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
              </span>
            </div>
          </div>

          {task.aiAnalysis?.isGhosted && (
            <div className="w-full mt-3 p-2 bg-red-50 dark:bg-red-950/30 rounded text-xs text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50">
              <p className="font-medium">AI Analysis: Ghosted Task</p>
              <p className="mt-1">{task.aiAnalysis.reasoning}</p>
              <p className="mt-1 font-medium">Suggested: {task.aiAnalysis.suggestedAction}</p>
            </div>
          )}

          <div className="w-full flex flex-wrap gap-2 mt-3">
            {task.followUpScheduled === FollowUpStatus.Yes && (
              <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                Follow-up Scheduled
              </Badge>
            )}
            {task.mentionedInMeeting === MentionedStatus.Yes && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                Mentioned in Meeting
              </Badge>
            )}
            {task.finalResolution && (
              <Badge
                variant="outline"
                className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
              >
                Resolved
              </Badge>
            )}
          </div>
        </CardFooter>
      </Card>

      <TaskDetailsDialog task={task} open={showDetails} onOpenChange={setShowDetails} />
    </>
  )
}
