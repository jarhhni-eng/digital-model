import { VPSubtestId, VP_SUBTESTS, getSubtestById } from './index'

export interface TrialAnswer {
  trialIndex: number
  questionNumber: number
  userAnswer: number | null
  correctAnswer: number
  score: 0 | 1
  timeMs: number
  clicks: number
  modifications: number
}

export interface SubtestResult {
  subtest: VPSubtestId
  answers: TrialAnswer[]
  totalCorrect: number
  total: number
  percentage: number
  averageTimeMs: number
  totalClicks: number
  totalModifications: number
  completedAt: string
}

export function gradeTrial(
  userAnswer: number | null,
  correctAnswer: number,
  trialIndex: number,
  questionNumber: number,
  meta: { timeMs: number; clicks: number; modifications: number },
): TrialAnswer {
  return {
    trialIndex,
    questionNumber,
    userAnswer,
    correctAnswer,
    score: userAnswer === correctAnswer ? 1 : 0,
    ...meta,
  }
}

export function summarize(subtest: VPSubtestId, answers: TrialAnswer[]): SubtestResult {
  const total = answers.length
  const totalCorrect = answers.reduce((s, a) => s + a.score, 0)
  const averageTimeMs = total ? answers.reduce((s, a) => s + a.timeMs, 0) / total : 0
  return {
    subtest,
    answers,
    totalCorrect,
    total,
    percentage: total ? (totalCorrect / total) * 100 : 0,
    averageTimeMs,
    totalClicks: answers.reduce((s, a) => s + a.clicks, 0),
    totalModifications: answers.reduce((s, a) => s + a.modifications, 0),
    completedAt: new Date().toISOString(),
  }
}

export interface CognitiveProfile {
  perSubtest: { subtest: VPSubtestId; title: string; percentage: number; status: 'strength' | 'weakness' | 'average' }[]
  strengths: VPSubtestId[]
  weaknesses: VPSubtestId[]
  overallPercentage: number
  category: Record<string, number>
}

const STRONG_THRESHOLD = 75
const WEAK_THRESHOLD = 50

export function buildProfile(results: SubtestResult[]): CognitiveProfile {
  const perSubtest = results.map((r) => {
    const meta = getSubtestById(r.subtest)
    const status: 'strength' | 'weakness' | 'average' =
      r.percentage >= STRONG_THRESHOLD ? 'strength' : r.percentage < WEAK_THRESHOLD ? 'weakness' : 'average'
    return { subtest: r.subtest, title: meta.title, percentage: r.percentage, status }
  })
  const strengths = perSubtest.filter((p) => p.status === 'strength').map((p) => p.subtest)
  const weaknesses = perSubtest.filter((p) => p.status === 'weakness').map((p) => p.subtest)
  const overall = perSubtest.length ? perSubtest.reduce((s, p) => s + p.percentage, 0) / perSubtest.length : 0
  const category: Record<string, { sum: number; n: number }> = {}
  for (const p of perSubtest) {
    const cat = getSubtestById(p.subtest).category
    category[cat] = category[cat] || { sum: 0, n: 0 }
    category[cat].sum += p.percentage
    category[cat].n += 1
  }
  const catAvg: Record<string, number> = {}
  for (const k of Object.keys(category)) catAvg[k] = category[k].sum / category[k].n
  return { perSubtest, strengths, weaknesses, overallPercentage: overall, category: catAvg }
}

export interface Recommendations {
  pedagogical: { subtest: VPSubtestId; title: string; activities: string[] }[]
  cognitive: { subtest: VPSubtestId; title: string; exercises: string[] }[]
  individual: string[]
}

const PED_LIB: Record<VPSubtestId, string[]> = {
  discrimination: ['Jeux des 7 différences', 'Tri de cartes avec formes proches', 'Atelier « presque pareil »'],
  memoire_sequentielle: ['Simon / séquences lumineuses', 'Répétition de motifs en chaîne', 'Storyboards à reconstituer'],
  memoire_perceptive: ['Fiches flash + rappel différé', 'Collections de textures à retrouver'],
  cloture: ['Dessiner une forme incomplète', 'Complétion de silhouettes', 'Puzzles à pièces manquantes'],
  constance_forme: ['Même forme, tailles différentes', 'Rotation de lettres / figures', 'Tri par catégorie malgré l’angle'],
  figure_fond: ['Coloriages figure-fond', 'Livres « Où est Charlie »', 'Labyrinthes denses'],
  intrus: ['Jeu de l’intrus par attribut', 'Catégorisation inversée', 'Défi « laquelle ne va pas ? »'],
  fond_cache: ['Recherche d’objets camouflés', 'Images superposées semi-transparentes'],
}

const COG_LIB: Record<VPSubtestId, string[]> = {
  discrimination: ['Exercices d’appariement rapide', 'Inhibition des distracteurs similaires'],
  memoire_sequentielle: ['Ordre sériel inversé', 'Empan temporel croissant'],
  memoire_perceptive: ['Consolidation par rappel espacé', 'Reconnaissance vs rappel libre'],
  cloture: ['Gestalt – loi de fermeture', 'Inférence visuelle partielle'],
  constance_forme: ['Invariance par transformation', 'Rotation mentale 2D / 3D'],
  figure_fond: ['Attention sélective visuelle', 'Filtrage du bruit contextuel'],
  intrus: ['Abstraction de règles', 'Comparaison multi-attributs'],
  fond_cache: ['Analyse fine des contours', 'Exploration systématique du champ visuel'],
}

export function buildRecommendations(profile: CognitiveProfile): Recommendations {
  const ped: Recommendations['pedagogical'] = []
  const cog: Recommendations['cognitive'] = []
  const weakSet = new Set(profile.weaknesses)
  const avgSet = new Set(profile.perSubtest.filter((p) => p.status === 'average').map((p) => p.subtest))
  const targeted = [...weakSet, ...avgSet] as VPSubtestId[]
  for (const id of targeted) {
    const meta = getSubtestById(id)
    ped.push({ subtest: id, title: meta.title, activities: PED_LIB[id] ?? [] })
    cog.push({ subtest: id, title: meta.title, exercises: COG_LIB[id] ?? [] })
  }
  const indiv: string[] = []
  if (profile.weaknesses.length) {
    const names = profile.weaknesses.map((id) => getSubtestById(id).title).join(', ')
    indiv.push(`Renforcement prioritaire : ${names}.`)
    indiv.push(`Séances courtes (15–20 min) ciblées, 3× par semaine, pendant 4 semaines.`)
  }
  if (profile.strengths.length) {
    const names = profile.strengths.map((id) => getSubtestById(id).title).join(', ')
    indiv.push(`Capitaliser sur les points forts : ${names} — les mobiliser comme levier pour les domaines plus fragiles.`)
  }
  if (!profile.weaknesses.length && !profile.strengths.length) {
    indiv.push('Profil homogène. Poursuivre un entraînement varié sur l’ensemble des sous-tests.')
  }
  if (profile.overallPercentage < WEAK_THRESHOLD) {
    indiv.push('Reconsidérer les conditions de passation (fatigue, compréhension des consignes) et refaire un passage différé.')
  }
  return { pedagogical: ped, cognitive: cog, individual: indiv }
}

export function storageAllResults(): SubtestResult[] {
  if (typeof window === 'undefined') return []
  const out: SubtestResult[] = []
  for (const s of VP_SUBTESTS) {
    const raw = window.localStorage.getItem(`vp-result:${s.id}`)
    if (!raw) continue
    try { out.push(JSON.parse(raw) as SubtestResult) } catch {}
  }
  return out
}
