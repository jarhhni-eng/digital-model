'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { mockInstitutions, mockTeacherGroups } from '@/lib/mock-groups'

export default function AdminPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.replace('/')
  }, [loading, user, router])

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen">
      <Sidebar userRole="admin" userName={user.username} />
      <div className="ml-64">
        <Header
          title="Platform administration"
          subtitle="Multi-institution overview (demo)"
        />
        <main className="p-6 pt-24 max-w-5xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Institutions</CardTitle>
              <CardDescription>Registered institutions</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {mockInstitutions.map((i) => (
                  <li key={i.id}>{i.name}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Groups (deployment)</CardTitle>
              <CardDescription>20–30 students per group — assignment by teacher & level</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {mockTeacherGroups.map((g) => (
                  <li key={g.id} className="border-b border-border pb-2">
                    <strong>{g.name}</strong> — {g.studentCount} students · {g.level}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
