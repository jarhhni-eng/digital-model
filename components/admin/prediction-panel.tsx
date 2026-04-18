'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { aggregatedCompetencyScore } from '@/lib/sem-model'
import { buildRecommendations } from '@/lib/recommendations-engine'
import { Brain, BookOpen, Users } from 'lucide-react'

const domainSliders = [
  { id: 'visual', label: 'Traitement visuel', defaultValue: 74, description: 'Score moyen de classe — domaine visuel' },
  { id: 'attention', label: 'Attention', defaultValue: 71, description: 'Score moyen de classe — domaine attentionnel' },
  { id: 'executive', label: 'Fonctions exécutives', defaultValue: 74, description: 'Score moyen de classe — domaine exécutif' },
  { id: 'memory', label: 'Mémoire de travail', defaultValue: 71, description: 'Score moyen de classe — domaine mnésique' },
]

// Model 3 weights: visual(0.4), attention(0.2), executive(0.2), memory(0.2)
const MODEL3_WEIGHTS = [0.4, 0.2, 0.2, 0.2]
const CONFIDENCE_BAND = 8

const audienceConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  teacher: { icon: Users, color: 'border-l-primary', label: 'Enseignant' },
  student: { icon: BookOpen, color: 'border-l-secondary', label: 'Élève' },
  psycho: { icon: Brain, color: 'border-l-accent', label: 'Psychologue' },
}

export function PredictionPanel() {
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(domainSliders.map((d) => [d.id, d.defaultValue]))
  )

  const domainValues = domainSliders.map((d) => scores[d.id] ?? d.defaultValue)
  const predicted = Math.round(aggregatedCompetencyScore(domainValues, MODEL3_WEIGHTS))
  const low = Math.max(0, predicted - CONFIDENCE_BAND)
  const high = Math.min(100, predicted + CONFIDENCE_BAND)

  const weakestIndex = domainValues.indexOf(Math.min(...domainValues))
  const strongestIndex = domainValues.indexOf(Math.max(...domainValues))
  const weakestDomain = domainSliders[weakestIndex]?.label ?? 'Memory'
  const strongestDomain = domainSliders[strongestIndex]?.label ?? 'Visual'

  const recommendations = useMemo(
    () => buildRecommendations({ weakestDomain, strongestDomain, competencyScore: predicted }),
    [weakestDomain, strongestDomain, predicted]
  )

  const scoreColor = predicted >= 75 ? 'text-green-600' : predicted >= 60 ? 'text-amber-600' : 'text-red-600'

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Ajustez les scores cognitifs moyens de la classe pour obtenir une prédiction de performance
        mathématique basée sur le <strong>Modèle 3</strong> (modèle complet — meilleure adéquation).
        Les recommandations sont générées automatiquement selon les résultats.
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Sliders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Scores cognitifs de classe (entrée)</CardTitle>
            <CardDescription>Modifiez les valeurs pour simuler différents profils de classe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {domainSliders.map((d) => (
              <div key={d.id}>
                <div className="flex justify-between text-sm mb-1.5">
                  <label className="font-medium">{d.label}</label>
                  <span className="font-bold tabular-nums">{scores[d.id]}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={scores[d.id]}
                  onChange={(e) => setScores((prev) => ({ ...prev, [d.id]: Number(e.target.value) }))}
                  className="w-full accent-primary h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">{d.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Prediction output */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base">Prédiction — Modèle 3 (MES complet)</CardTitle>
            <CardDescription>Score mathématique prédit avec bande de confiance ±{CONFIDENCE_BAND} pts</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between gap-4">
            {/* Score display */}
            <div className="text-center py-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Score prédit</p>
              <p className={`text-6xl font-bold ${scoreColor}`}>{predicted}%</p>
              <p className="text-sm text-muted-foreground mt-2">
                Intervalle de confiance : <strong>{low}%</strong> — <strong>{high}%</strong>
              </p>
              {/* Confidence bar */}
              <div className="relative h-4 bg-muted rounded-full overflow-hidden mx-4 mt-4">
                <div
                  className="absolute h-full bg-primary/20 rounded-full"
                  style={{ left: `${low}%`, width: `${high - low}%` }}
                />
                <div
                  className="absolute w-0.5 h-full bg-primary"
                  style={{ left: `${predicted}%` }}
                />
              </div>
            </div>

            {/* Model insight */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-xs font-semibold text-primary mb-1">Insight automatique</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Le prédicteur dominant est le <strong>Traitement visuel</strong> (β=0.40).
                {scores.memory < 70
                  ? ` Un renforcement de la mémoire de travail (actuellement ${scores.memory}%) pourrait améliorer la performance mathématique de ~${Math.round((70 - scores.memory) * 0.2)} points selon le Modèle 2.`
                  : ` La mémoire de travail est à un niveau satisfaisant (${scores.memory}%). Consolider les capacités visuo-spatiales restera la priorité.`}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">Modèle 3 (poids : 0.4 / 0.2 / 0.2 / 0.2)</Badge>
              <Badge variant="outline" className="text-xs">RMSEA 0.048 · CFI 0.96</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="text-base font-semibold mb-4">Recommandations générées</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['teacher', 'student', 'psycho'] as const).map((audience) => {
            const cfg = audienceConfig[audience]!
            const Icon = cfg.icon
            const recs = recommendations.filter((r) => r.audience === audience)
            return (
              <div key={audience} className={`rounded-lg border-l-4 ${cfg.color} border border-border p-4 space-y-3`}>
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold">{cfg.label}</h4>
                </div>
                {recs.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Aucune recommandation spécifique pour ce profil.</p>
                ) : (
                  recs.map((rec, i) => (
                    <div key={i}>
                      <p className="text-xs font-medium text-foreground mb-1">{rec.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{rec.detail}</p>
                    </div>
                  ))
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
