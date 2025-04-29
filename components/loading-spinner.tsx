export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900 dark:border-slate-100"></div>
      <p className="mt-4 text-slate-600 dark:text-slate-300">Loading task data...</p>
    </div>
  )
}
