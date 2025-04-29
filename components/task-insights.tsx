"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Clock, Users } from "lucide-react"

type TaskInsightsProps = {
  insights: {
    totalTasks: number
    ghostedCount: number
    completedCount: number
    pendingCount: number
    ghostedPercentage: number
    projectsWithMostGhosted: { project: string; count: number }[]
    ownersWithMostGhosted: { owner: string; count: number }[]
  }
}

export function TaskInsights({ insights }: TaskInsightsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{insights.totalTasks}</div>
          <div className="flex justify-between mt-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span>Completed: {insights.completedCount}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
              <span>Pending: {insights.pendingCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-1 text-red-500" />
            Ghosted Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{insights.ghostedCount}</div>
          <div className="mt-2">
            <div className="flex justify-between mb-1 text-sm">
              <span>Ghosted Rate</span>
              <span>{insights.ghostedPercentage}%</span>
            </div>
            <Progress value={insights.ghostedPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center">
            <Users className="h-4 w-4 mr-1 text-blue-500" />
            Top Ghosted Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.projectsWithMostGhosted.length > 0 ? (
            <ul className="space-y-2">
              {insights.projectsWithMostGhosted.map((item, index) => (
                <li key={index} className="flex justify-between text-sm">
                  <span className="truncate mr-2">{item.project}</span>
                  <span className="font-medium text-red-600 dark:text-red-400">{item.count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No ghosted projects</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center">
            <Clock className="h-4 w-4 mr-1 text-purple-500" />
            Top Ghosted Owners
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.ownersWithMostGhosted.length > 0 ? (
            <ul className="space-y-2">
              {insights.ownersWithMostGhosted.map((item, index) => (
                <li key={index} className="flex justify-between text-sm">
                  <span className="truncate mr-2">{item.owner}</span>
                  <span className="font-medium text-red-600 dark:text-red-400">{item.count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No ghosted owners</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
