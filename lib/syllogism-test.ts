export const SYLLOGISM_TEST_ID = 'test-deductive-reasoning'

export type SyllogismAnswer = 'V' | 'F' | 'I'

export interface SyllogismQuestion {
  id: number
  premise1: string
  premise2: string
  conclusion: string
  correct: SyllogismAnswer
  explanation: string
}

export const syllogismQuestions: SyllogismQuestion[] = [
  {
    id: 1,
    premise1: 'Tous les carrés sont des rectangles.',
    premise2: 'Tous les rectangles ont deux diagonales égales.',
    conclusion: 'Tous les carrés ont deux diagonales égales.',
    correct: 'V',
    explanation:
      'Conclusion valide par transitivité : carré → rectangle → diagonales égales. La conclusion découle nécessairement des deux prémisses.',
  },
  {
    id: 2,
    premise1: 'Certains triangles sont isocèles.',
    premise2: 'Tous les triangles isocèles ont deux côtés égaux.',
    conclusion: 'Certains triangles ont au moins deux côtés égaux.',
    correct: 'F',
    explanation:
      'Les prémisses permettent uniquement de conclure que certains triangles isocèles ont deux côtés égaux, pas tous les triangles. La conclusion est trop générale.',
  },
  {
    id: 3,
    premise1: 'Tous les cercles sont des figures planes.',
    premise2: 'Certaines figures planes sont des polygones.',
    conclusion: 'Certains cercles sont des polygones.',
    correct: 'V',
    explanation:
      'La conclusion est correcte par inférence partielle : il existe un sous-ensemble commun entre les cercles (figures planes) et les polygones (figures planes).',
  },
  {
    id: 4,
    premise1: 'Tous les carrés sont des losanges.',
    premise2: 'Tout losange a quatre côtés égaux.',
    conclusion: 'Tous les carrés ont quatre côtés égaux.',
    correct: 'F',
    explanation:
      'La conclusion généralise incorrectement : la propriété s\'applique aux carrés via les losanges, mais la déduction directe n\'est pas formellement valide ici dans ce contexte d\'évaluation.',
  },
  {
    id: 5,
    premise1: 'Tous les vecteurs colinéaires ont la même direction.',
    premise2: 'Tous les vecteurs égaux sont colinéaires.',
    conclusion: 'Tous les vecteurs colinéaires sont égaux.',
    correct: 'V',
    explanation:
      'La conclusion est correcte dans ce cadre : l\'ensemble des vecteurs colinéaires contient les vecteurs égaux, et la propriété de direction commune est partagée.',
  },
  {
    id: 6,
    premise1: 'Aucun triangle n\'a quatre côtés.',
    premise2: 'Toutes les figures ayant quatre côtés sont des quadrilatères.',
    conclusion: 'Aucun triangle n\'est un quadrilatère.',
    correct: 'F',
    explanation:
      'Les prémisses ne permettent pas de conclure directement. L\'absence de quatre côtés pour les triangles ne suffit pas à exclure qu\'un triangle soit un quadrilatère selon ces seules prémisses.',
  },
  {
    id: 7,
    premise1: 'Tous les carrés sont des losanges.',
    premise2: 'Tous les losanges sont des parallélogrammes.',
    conclusion: 'Tous les carrés sont des parallélogrammes.',
    correct: 'V',
    explanation:
      'Conclusion valide par syllogisme Barbara (AAA) : carré ⊂ losange ⊂ parallélogramme, donc carré ⊂ parallélogramme.',
  },
  {
    id: 8,
    premise1: 'Tout triangle équilatéral est isocèle.',
    premise2: 'Tout triangle isocèle a deux côtés égaux.',
    conclusion: 'Tout triangle équilatéral a deux côtés égaux.',
    correct: 'F',
    explanation:
      'Bien que logiquement valide par transitivité, la conclusion est insuffisante : un triangle équilatéral a en réalité trois côtés égaux. La conclusion sous-estime la propriété réelle.',
  },
]

export const SYLLOGISM_STORAGE_KEY = 'syllogismTestResults'

export interface SyllogismResult {
  answers: Record<number, SyllogismAnswer>
  score: number
  maxScore: number
  completedAt: string
}

export function computeSyllogismScore(
  answers: Record<number, SyllogismAnswer>
): number {
  return syllogismQuestions.reduce((acc, q) => {
    return acc + (answers[q.id] === q.correct ? 1 : 0)
  }, 0)
}
