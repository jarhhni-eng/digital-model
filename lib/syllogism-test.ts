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
    correct: 'V',
    explanation:
      'Conclusion valide : « certains triangles sont isocèles » et « tout isocèle a deux côtés égaux » donnent par syllogisme « certains triangles ont au moins deux côtés égaux ».',
  },
  {
    id: 3,
    premise1: 'Tous les cercles sont des figures planes.',
    premise2: 'Certaines figures planes sont des polygones.',
    conclusion: 'Certains cercles sont des polygones.',
    correct: 'F',
    explanation:
      'Conclusion non valide : que certaines figures planes soient des polygones ne garantit pas que ces polygones soient parmi les cercles. Le moyen terme n\'est pas distribué.',
  },
  {
    id: 4,
    premise1: 'Tous les carrés sont des losanges.',
    premise2: 'Tout losange a quatre côtés égaux.',
    conclusion: 'Tous les carrés ont quatre côtés égaux.',
    correct: 'V',
    explanation:
      'Conclusion valide par syllogisme Barbara (AAA) : carré ⊂ losange et tout losange a quatre côtés égaux ⇒ tout carré a quatre côtés égaux.',
  },
  {
    id: 5,
    premise1: 'Tous les vecteurs colinéaires ont la même direction.',
    premise2: 'Tous les vecteurs égaux sont colinéaires.',
    conclusion: 'Tous les vecteurs colinéaires sont égaux.',
    correct: 'F',
    explanation:
      'Conclusion non valide : les vecteurs égaux sont colinéaires, mais la réciproque est fausse — deux vecteurs colinéaires de normes différentes ne sont pas égaux.',
  },
  {
    id: 6,
    premise1: 'Aucun triangle n\'a quatre côtés.',
    premise2: 'Toutes les figures ayant quatre côtés sont des quadrilatères.',
    conclusion: 'Aucun triangle n\'est un quadrilatère.',
    correct: 'V',
    explanation:
      'Conclusion valide : un quadrilatère a quatre côtés ; or aucun triangle n\'a quatre côtés ; donc aucun triangle n\'est un quadrilatère.',
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
    correct: 'V',
    explanation:
      'Conclusion valide par syllogisme Barbara (AAA) : équilatéral ⊂ isocèle ⇒ tout équilatéral hérite de la propriété « avoir deux côtés égaux ».',
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
