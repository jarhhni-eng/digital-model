'use client'

import { Brain, BookOpen, Triangle } from 'lucide-react'

export type DomainPresentation = {
  nameFr: string
  icon: React.ReactNode
  color: string
}

const DOMAIN_UI: Record<string, DomainPresentation> = {
  'Cognitive Capacity': {
    nameFr: 'Capacités cognitives',
    icon: <Brain className="h-4 w-4" />,
    color: '#6366f1',
  },
  'Cognition et apprentissage de la géométrie': {
    nameFr: 'Géométrie',
    icon: <Triangle className="h-4 w-4" />,
    color: '#059669',
  },
}

export function getDomainPresentation(domain: string): DomainPresentation {
  const d = DOMAIN_UI[domain]
  if (d) return d
  return {
    nameFr: domain,
    icon: <BookOpen className="h-4 w-4" />,
    color: '#64748b',
  }
}
