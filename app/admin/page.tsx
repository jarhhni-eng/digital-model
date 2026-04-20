'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminIndex() {
  const router = useRouter()
  useEffect(() => { router.replace('/admin/individual') }, [router])
  return <p className="text-slate-500">Redirection…</p>
}
