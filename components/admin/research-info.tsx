'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GraduationCap, FlaskConical, BookOpen, User, Building, Calendar } from 'lucide-react'

const researchProfile = {
  doctoralProgram: "Doctorat en Sciences de l'Éducation — Didactique des Mathématiques",
  laboratory: "Laboratoire de Recherche en Éducation et Formation (LREF)",
  supervisor: "Pr. Jalal Asermouh",
  thesis:
    "Impact des capacités cognitives visuo-spatiales sur l'apprentissage de la géométrie au cycle secondaire qualifiant au Maroc",
  institution: "École Normale Supérieure, Fès — Université Sidi Mohamed Ben Abdellah (USMBA)",
  academicYear: "2024–2025",
  researchContext:
    "Cette recherche s'inscrit dans le cadre de l'évaluation des processus cognitifs mobilisés lors de l'apprentissage de la géométrie (vecteurs, transformations, produit scalaire, trigonométrie) par les élèves du cycle secondaire qualifiant marocain. L'objectif est de modéliser les relations entre les capacités visuo-spatiales, la mémoire de travail, les fonctions exécutives et la performance mathématique à l'aide de méthodes psychométriques avancées (TRI, ACP, MES).",
}

const infoItems = [
  { icon: GraduationCap, label: 'Programme doctoral', value: researchProfile.doctoralProgram },
  { icon: FlaskConical, label: 'Laboratoire', value: researchProfile.laboratory },
  { icon: User, label: 'Directeur de thèse', value: researchProfile.supervisor },
  { icon: Building, label: 'Établissement', value: researchProfile.institution },
  { icon: Calendar, label: 'Année académique', value: researchProfile.academicYear },
]

export function ResearchInfoPanel() {
  return (
    <div className="space-y-6">
      {/* Research profile header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Cadre de recherche doctorale</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">ENS Fès — USMBA, Maroc</p>
            </div>
            <Badge variant="secondary" className="flex-shrink-0">En cours</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {infoItems.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-medium text-foreground leading-snug">{item.value}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Thesis topic */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Sujet de thèse</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-medium text-foreground leading-relaxed">
            {researchProfile.thesis}
          </p>
        </CardContent>
      </Card>

      {/* Research context */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contexte et objectifs de la recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {researchProfile.researchContext}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {['Psychométrie', 'Visuo-spatial', 'Géométrie', 'SEM', 'IRT', 'ACP', 'Maroc', 'Secondaire'].map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Curriculum scope */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tronc Commun</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-sm">
              {['C1 — Vecteurs', 'C2 — Symétrie et transformations', 'C3 — Produit scalaire', 'C4 — Trigonométrie', 'C5 — Droite dans le plan'].map((c) => (
                <li key={c} className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">1ère Bac Sciences</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-sm">
              {['C6 — Produit scalaire (approfondissement)'].map((c) => (
                <li key={c} className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
