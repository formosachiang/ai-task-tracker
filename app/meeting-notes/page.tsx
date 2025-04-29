import { MeetingNotesAnalyzer } from "@/components/meeting-notes-analyzer"
import { ExampleMeetingNotes } from "@/components/example-meeting-notes"
import { DebugPanel } from "@/components/debug-panel"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function MeetingNotesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto py-8 px-4">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <header className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Meeting Notes Analyzer</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Extract action items and update tasks automatically from your meeting notes
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6">
          <MeetingNotesAnalyzer />
          <ExampleMeetingNotes />
          <DebugPanel />
        </div>
      </div>
    </main>
  )
}
