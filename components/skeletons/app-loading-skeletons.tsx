'use client'

import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

/** Admin gate — light grey placeholders on white / slate-50 shell. */
export function AdminAuthShellSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('min-h-screen bg-slate-50 flex', className)}
      aria-busy="true"
      aria-label="Loading"
    >
      <aside
        className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-white p-4 gap-3"
        aria-hidden
      >
        <Skeleton className="h-8 w-28 rounded-md" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full rounded-md" />
        ))}
      </aside>
      <div className="flex-1 p-4 md:p-8 space-y-4 max-w-7xl w-full">
        <Skeleton className="h-9 w-2/3 max-w-xl rounded-md" />
        <Skeleton className="h-72 w-full rounded-xl" />
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

/** Profile setup / centred forms — card outline stays, fields as light grey bars. */
export function CenteredCardFormSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center px-4 py-10',
        className,
      )}
      aria-busy="true"
    >
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-8 shadow-lg space-y-6">
        <div className="flex justify-center">
          <Skeleton className="h-16 w-16 rounded-xl" />
        </div>
        <Skeleton className="h-8 w-3/4 mx-auto rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
        <div className="space-y-4 pt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
        </div>
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  )
}
