'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Building2, User, FlaskConical, Calendar, BookOpen } from 'lucide-react'

const info = [
  { icon: FlaskConical, label: 'Cadre de recherche doctorale', value: 'ENS Fès — USMBA, Maroc' },
  { icon: BookOpen,     label: 'Statut',                       value: 'En cours' },
  { icon: GraduationCap,label: 'Programme doctoral',           value: "Doctorat en Sciences de l'Éducation — Didactique des Mathématiques" },
  { icon: Building2,    label: 'Laboratoire',                  value: 'Laboratoire de Recherche en Éducation et Formation (LREF)' },
  { icon: User,         label: 'Directeur de thèse',           value: 'Pr. Jalal Asermouh' },
  { icon: Building2,    label: 'Établissement',                value: 'École Normale Supérieure, Fès — Université Sidi Mohamed Ben Abdellah (USMBA)' },
  { icon: Calendar,     label: 'Année académique',             value: '2024–2025' },
]

export default function ResearchInfoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Administration de la recherche</h1>
        <p className="text-slate-500 mt-1">Cadre institutionnel et scientifique du projet de thèse.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {info.map((it) => (
          <Card key={it.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-slate-500 uppercase tracking-wide flex items-center gap-2">
                <it.icon className="w-4 h-4 text-indigo-600" />
                {it.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-900 font-medium">{it.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
