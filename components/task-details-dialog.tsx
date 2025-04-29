"use client"

import { format } from "date-fns"
import { type Task, TaskStatus, FollowUpStatus, MentionedStatus } from "@/lib/types"
import { useTaskContext } from "./task-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { AlertCircle, Calendar, Clock, User, CheckCircle, XCircle } from "lucide-react"

type TaskDetailsDialogProps = {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskDetailsDialog({ task, open, onOpenChange }: TaskDetailsDialogProps) {
  const { updateTask } = useTaskContext()
  const [comment, setComment] = useState("")

  const handleAddComment = () => {
    if (!comment.trim()) return

    updateTask(task.id, {
      status: TaskStatus.InProgress,
      comments: [
        ...(task.comments || []),
        {
          id: Math.random().toString(36).substring(2, 9),
          text: comment,
          createdAt: new Date().toISOString(),
          author: "Current User", // In a real app, this would be the logged-in user
        },
      ],
    })

    setComment("")
  }

  const handleMarkComplete = () => {
    updateTask(task.id, {
      status: TaskStatus.Completed,
    })
  }

  const handleToggleFollowUp = () => {
    updateTask(task.id, {
      followUpScheduled: task.followUpScheduled === FollowUpStatus.Yes ? FollowUpStatus.No : FollowUpStatus.Yes,
    })
  }

  const handleToggleMentioned = () => {
    updateTask(task.id, {
      mentionedInMeeting: task.mentionedInMeeting === MentionedStatus.Yes ? MentionedStatus.No : MentionedStatus.Yes,
      lastMentioned: new Date().toISOString(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{task.title}</DialogTitle>
          <DialogDescription className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline">{task.type}</Badge>
            <Badge
              variant="outline"
              className={
                task.status === TaskStatus.Completed
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : task.status === TaskStatus.InProgress
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
              }
            >
              {task.status}
            </Badge>
            {task.aiAnalysis?.isGhosted && (
              <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                Ghosted
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          <div>
            <h4 className="text-sm font-medium mb-1">Project</h4>
            <p className="text-slate-600 dark:text-slate-300">{task.project}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-1">Description</h4>
            <p className="text-slate-600 dark:text-slate-300">{task.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                <User className="h-3 w-3" /> Owner
              </h4>
              <p className="text-slate-600 dark:text-slate-300">{task.owner}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Due Date
              </h4>
              <p
                className={`${new Date(task.dueDate) < new Date() && task.status !== TaskStatus.Completed ? "text-red-600 dark:text-red-400" : "text-slate-600 dark:text-slate-300"}`}
              >
                {format(new Date(task.dueDate), "PPP")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Last Mentioned
              </h4>
              <p className="text-slate-600 dark:text-slate-300">{format(new Date(task.lastMentioned), "PPP")}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">Final Resolution</h4>
              <p className="text-slate-600 dark:text-slate-300">{task.finalResolution || "Not resolved yet"}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              size="sm"
              variant={task.mentionedInMeeting === MentionedStatus.Yes ? "default" : "outline"}
              onClick={handleToggleMentioned}
              className={task.mentionedInMeeting === MentionedStatus.Yes ? "bg-blue-600" : ""}
            >
              {task.mentionedInMeeting === MentionedStatus.Yes ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Mentioned in Meeting
            </Button>

            <Button
              size="sm"
              variant={task.followUpScheduled === FollowUpStatus.Yes ? "default" : "outline"}
              onClick={handleToggleFollowUp}
              className={task.followUpScheduled === FollowUpStatus.Yes ? "bg-green-600" : ""}
            >
              {task.followUpScheduled === FollowUpStatus.Yes ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Follow-up Scheduled
            </Button>
          </div>

          {task.aiAnalysis?.isGhosted && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded border border-red-200 dark:border-red-900/50">
              <h4 className="text-sm font-medium mb-1 flex items-center gap-1 text-red-700 dark:text-red-300">
                <AlertCircle className="h-4 w-4" /> AI Analysis
              </h4>
              <p className="text-red-600 dark:text-red-300 mb-1">
                <span className="font-medium">Confidence:</span> {(task.aiAnalysis.confidence * 100).toFixed(0)}%
              </p>
              <p className="text-red-600 dark:text-red-300 mb-1">
                <span className="font-medium">Reasoning:</span> {task.aiAnalysis.reasoning}
              </p>
              <p className="text-red-600 dark:text-red-300">
                <span className="font-medium">Suggested Action:</span> {task.aiAnalysis.suggestedAction}
              </p>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium mb-2">Comments & Updates</h4>
            {!task.comments || task.comments.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 italic">No comments yet</p>
            ) : (
              <div className="space-y-3">
                {task.comments?.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm">{comment.author}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {format(new Date(comment.createdAt), "PPP")}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{comment.text}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4">
              <Textarea
                placeholder="Add a comment or update..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mb-2"
              />
              <Button size="sm" onClick={handleAddComment} disabled={!comment.trim()}>
                Add Comment
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {task.status !== TaskStatus.Completed && !task.finalResolution && (
            <Button variant="default" onClick={handleMarkComplete}>
              Mark as Completed
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
