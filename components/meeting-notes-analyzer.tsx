"use client"

import { useState } from "react"
import { useTaskContext } from "./task-provider"
import { analyzeMeetingNotes, processAnalysisResults } from "@/lib/meeting-analyzer"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Check, Loader2, FileText, Plus, RefreshCw, ArrowRight } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"

export function MeetingNotesAnalyzer() {
  const router = useRouter()
  const { tasks, addTask, updateTask, refreshAnalysis } = useTaskContext()
  const [meetingNotes, setMeetingNotes] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<{
    summary: string
    updatedTasks: string[]
    newTasks: string[]
    newTaskIds: string[]
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!meetingNotes.trim()) {
      setError("Please enter meeting notes to analyze")
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setAnalysisResult(null)

    try {
      // Store the current task count to track new additions
      const initialTaskCount = tasks.length
      console.log("Initial task count:", initialTaskCount)

      // Analyze the meeting notes
      const analysis = await analyzeMeetingNotes(meetingNotes, tasks)

      // Process the results and add/update tasks
      // Modified to capture the IDs of newly added tasks
      const newTaskIds: string[] = []

      // Create a custom addTask function that captures the IDs
      const addTaskWithTracking = (taskData: any) => {
        const newTaskId = addTask({
          ...taskData,
        })
        newTaskIds.push(newTaskId)
        return newTaskId
      }

      const results = processAnalysisResults(analysis, tasks, addTaskWithTracking, updateTask)

      setAnalysisResult({
        summary: analysis.summary,
        updatedTasks: results.updatedTasks,
        newTasks: results.newTasks,
        newTaskIds,
      })

      // Refresh AI analysis after processing
      await refreshAnalysis()

      // Log the before and after counts to help debug
      console.log(`Tasks before: ${initialTaskCount}, Tasks after: ${tasks.length}, New tasks: ${newTaskIds.length}`)
      console.log("New task IDs:", newTaskIds)
    } catch (err) {
      console.error("Error analyzing meeting notes:", err)
      setError("Failed to analyze meeting notes. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleClear = () => {
    setMeetingNotes("")
    setAnalysisResult(null)
    setError(null)
  }

  const handleViewTasks = () => {
    router.push("/")
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Meeting Notes Analyzer
        </CardTitle>
        <CardDescription>
          Paste your meeting notes to automatically extract action items and update existing tasks
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysisResult ? (
          <div className="space-y-4">
            <Alert className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/50">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle className="text-green-700 dark:text-green-300">Analysis Complete</AlertTitle>
              <AlertDescription className="text-green-600 dark:text-green-300">
                Successfully analyzed meeting notes and processed action items.
                {analysisResult.newTasks.length > 0 && (
                  <p className="mt-1 font-medium">
                    {analysisResult.newTasks.length} new tasks were added to your task list.
                  </p>
                )}
              </AlertDescription>
            </Alert>

            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="new">
                  New Tasks <Badge className="ml-1 bg-green-500">{analysisResult.newTasks.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="updated">
                  Updated <Badge className="ml-1 bg-blue-500">{analysisResult.updatedTasks.length}</Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-md">
                  <h3 className="font-medium mb-2">Meeting Summary</h3>
                  <p className="text-slate-700 dark:text-slate-300">{analysisResult.summary}</p>
                </div>
              </TabsContent>

              <TabsContent value="new" className="space-y-4">
                {analysisResult.newTasks.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400">No new tasks were created.</p>
                ) : (
                  <div className="space-y-2">
                    {analysisResult.newTasks.map((task, index) => (
                      <div
                        key={index}
                        className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800/30"
                      >
                        <div className="flex items-start gap-2">
                          <Plus className="h-4 w-4 text-green-600 dark:text-green-400 mt-1" />
                          <div>
                            <p className="text-slate-800 dark:text-slate-200">{task}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              Task ID: {analysisResult.newTaskIds[index] || "Unknown"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="updated" className="space-y-4">
                {analysisResult.updatedTasks.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400">No existing tasks were updated.</p>
                ) : (
                  <div className="space-y-2">
                    {analysisResult.updatedTasks.map((taskId, index) => {
                      const task = tasks.find((t) => t.id === taskId)
                      return (
                        <div
                          key={index}
                          className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800/30"
                        >
                          <div className="flex items-start gap-2">
                            <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-1" />
                            <div>
                              <p className="text-slate-800 dark:text-slate-200">{task?.title}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Owner: {task?.owner} | Project: {task?.project}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleClear}>
                Analyze Another
              </Button>

              <Button onClick={handleViewTasks}>
                View Tasks <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Textarea
              placeholder="Paste your meeting notes here..."
              value={meetingNotes}
              onChange={(e) => setMeetingNotes(e.target.value)}
              className="min-h-[200px] mb-4"
            />

            <div className="flex justify-end">
              <Button onClick={handleAnalyze} disabled={isAnalyzing || !meetingNotes.trim()}>
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Analyze Notes
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex flex-col items-start text-sm text-slate-500 dark:text-slate-400 pt-0">
        <p>
          <strong>How it works:</strong> Our AI will scan your meeting notes to identify action items, decisions needed,
          and follow-ups. It will also look for updates on existing tasks.
        </p>
      </CardFooter>
    </Card>
  )
}
