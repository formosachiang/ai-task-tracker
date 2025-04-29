import { TaskDashboard } from "@/components/task-dashboard"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto py-8 px-4">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">TaskRadar AI</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Automatically detect and surface ghosted tasks, postponed decisions, and vanishing follow-ups
          </p>
        </header>
        <TaskDashboard />
      </div>
    </main>
  )
}
