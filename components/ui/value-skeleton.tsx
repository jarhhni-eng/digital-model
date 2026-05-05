'use client'

import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

/** Light grey placeholder for numeric / short text values (stats, scores). */
export function ValueTextSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn('h-8 w-[4.5rem] rounded-md', className)} />
}

/** Larger headline stat (e.g. text-3xl row). */
export function ValueHeadlineSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn('h-10 w-24 rounded-md', className)} />
}

export function ValueOrText({
  ready,
  children,
  className,
}: {
  ready: boolean
  children: React.ReactNode
  className?: string
}) {
  if (!ready) return <ValueTextSkeleton className={className} />
  return <>{children}</>
}

/** Chart / block placeholder — same light tone as value skeletons. */
export function ChartAreaSkeleton({
  height,
  className,
}: {
  height: number
  className?: string
}) {
  return (
    <Skeleton
      className={cn('w-full rounded-lg', className)}
      style={{ height, minHeight: height }}
    />
  )
}
