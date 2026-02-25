'use client'

import { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon: ReactNode
  title: string
  value: string | number
  description?: string
  change?: {
    value: number
    trend: 'up' | 'down'
  }
  onClick?: () => void
}

export function StatCard({
  icon,
  title,
  value,
  description,
  change,
  onClick,
}: StatCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all"
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {(description || change) && (
          <div className="flex items-center gap-2 mt-2">
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {change && (
              <p
                className={cn(
                  'text-xs font-medium',
                  change.trend === 'up' ? 'text-success' : 'text-destructive'
                )}
              >
                {change.trend === 'up' ? '+' : '-'}{change.value}%
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface ProgressCardProps {
  title: string
  description?: string
  value: number
  max?: number
  label?: string
  variant?: 'default' | 'success' | 'warning'
}

export function ProgressCard({
  title,
  description,
  value,
  max = 100,
  label,
  variant = 'default',
}: ProgressCardProps) {
  const percentage = (value / max) * 100

  const variantClasses = {
    default: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && (
          <CardDescription className="text-xs">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end justify-between">
          <Progress value={percentage} className="flex-1" />
          <span className={cn('ml-3 text-sm font-bold', variantClasses[variant])}>
            {label || `${Math.round(percentage)}%`}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {value} / {max}
        </p>
      </CardContent>
    </Card>
  )
}

interface DomainCardProps {
  title: string
  description?: string
  icon?: ReactNode
  progress: number
  capacityCount: number
  isLocked?: boolean
  onClick?: () => void
}

export function DomainCard({
  title,
  description,
  icon,
  progress,
  capacityCount,
  isLocked = false,
  onClick,
}: DomainCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        isLocked && 'opacity-60 cursor-not-allowed'
      )}
      onClick={() => !isLocked && onClick?.()}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base flex items-center gap-2">
              {icon && <span className="text-primary">{icon}</span>}
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="text-xs mt-1">
                {description}
              </CardDescription>
            )}
          </div>
          {isLocked && (
            <div className="text-xs font-medium text-muted-foreground">
              Locked
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              Progress
            </span>
            <span className="text-xs font-bold text-foreground">
              {progress}%
            </span>
          </div>
          <Progress value={progress} />
        </div>
        <p className="text-xs text-muted-foreground">
          {capacityCount} {capacityCount === 1 ? 'capacity' : 'capacities'}
        </p>
      </CardContent>
    </Card>
  )
}

interface TestCardProps {
  title: string
  domain: string
  status: 'upcoming' | 'in-progress' | 'completed'
  dueDate?: string
  icon?: ReactNode
  onClick?: () => void
}

export function TestCard({
  title,
  domain,
  status,
  dueDate,
  icon,
  onClick,
}: TestCardProps) {
  const statusClasses = {
    upcoming: 'bg-blue-50 text-primary border-primary/20',
    'in-progress': 'bg-amber-50 text-warning border-warning/20',
    completed: 'bg-green-50 text-success border-success/20',
  }

  const statusLabels = {
    upcoming: 'Upcoming',
    'in-progress': 'In Progress',
    completed: 'Completed',
  }

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base flex items-center gap-2">
              {icon}
              {title}
            </CardTitle>
            <CardDescription className="text-xs mt-1">{domain}</CardDescription>
          </div>
          <span
            className={cn(
              'text-xs font-medium px-2 py-1 rounded border',
              statusClasses[status]
            )}
          >
            {statusLabels[status]}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {dueDate && (
          <p className="text-xs text-muted-foreground">Due: {dueDate}</p>
        )}
      </CardContent>
    </Card>
  )
}
