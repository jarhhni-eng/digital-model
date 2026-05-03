/**
 * lib/competency-definitions.ts
 *
 * ⚠️ RÈGLE FONDAMENTALE : Les compétences sont SPÉCIFIQUES à chaque leçon.
 *    C1 (Symétrie centrale) ≠ C1 (Vecteurs et translation)
 *
 * Structure : LESSON_COMPETENCIES[lessonId] → CompetencyDef[]
 */

export interface CompetencyDef {
  /** Code affiché : "C1", "C2", … */
  code: string
  /** Nom complet de la compétence dans le contexte de cette leçon */
  label: string
  /** IDs des questions qui évaluent cette compétence */
  questionIds: string[]
}

export interface LessonDef {
  id: string
  title: string
  domain: 'geometry' | 'cognitive'
  competencies: CompetencyDef[]
}

// ─── Leçons de géométrie ──────────────────────────────────────────────────────

export const LESSON_DEFINITIONS: Record<string, LessonDef> = {

  // ── Vecteurs et translation ──────────────────────────────────────────────
  'test-geo-vectors-complete': {
    id: 'test-geo-vectors-complete',
    title: 'Vecteurs et translation',
    domain: 'geometry',
    competencies: [
      {
        code: 'C1',
        label: 'Expression de la distance et perpendicularité via produit scalaire',
        questionIds: ['vec-q1', 'vec-q2'],
      },
      {
        code: 'C2',
        label: 'Résolution de problèmes avec produit scalaire',
        questionIds: ['vec-q3', 'vec-q4'],
      },
      {
        code: 'C3',
        label: 'Théorème de Cauchy et médiane',
        questionIds: ['vec-q5'],
      },
    ],
  },

  // ── Géométrie dans l'espace ──────────────────────────────────────────────
  'test-geo-space': {
    id: 'test-geo-space',
    title: "Géométrie dans l'espace",
    domain: 'geometry',
    competencies: [
      {
        code: 'C1',
        label: "Représentation des parties de l'espace sur le plan",
        questionIds: ['space-q1', 'space-q2'],
      },
      {
        code: 'C2',
        label: 'Similarité et dissimilarité plan / espace',
        questionIds: ['space-q3', 'space-q4'],
      },
      {
        code: 'C3',
        label: "Résolution de problèmes en géométrie de l'espace",
        questionIds: ['space-q5'],
      },
    ],
  },

  // ── Symétrie axiale ──────────────────────────────────────────────────────
  'test-geo-symetrie-axiale': {
    id: 'test-geo-symetrie-axiale',
    title: 'Symétrie axiale',
    domain: 'geometry',
    competencies: [
      {
        code: 'C1',
        label: 'Reconnaissance de la similarité des formes géométriques',
        questionIds: ['geo-as-q1', 'geo-as-q2', 'geo-as-q3'],
      },
      {
        code: 'C2',
        label: 'Utilisation dans la résolution de problèmes',
        questionIds: ['geo-as-q4', 'geo-as-q5'],
      },
    ],
  },

  // ── Symétrie centrale ────────────────────────────────────────────────────
  'test-geo-central-sym': {
    id: 'test-geo-central-sym',
    title: 'Symétrie centrale',
    domain: 'geometry',
    competencies: [
      {
        code: 'C1',
        label: 'Reconnaissance de la similarité des formes géométriques',
        questionIds: ['geo-cs-q1', 'geo-cs-q2', 'geo-cs-q3'],
      },
      {
        code: 'C2',
        label: 'Utilisation dans la résolution de problèmes',
        questionIds: ['geo-cs-q4', 'geo-cs-q5'],
      },
    ],
  },

  // ── Droite dans le plan ──────────────────────────────────────────────────
  'test-geo-line-plane': {
    id: 'test-geo-line-plane',
    title: 'Droite dans le plan',
    domain: 'geometry',
    competencies: [
      {
        code: 'C1',
        label: 'Traduction affine et vectorielle par coordonnées',
        questionIds: ['geo-lp-q1', 'geo-lp-q2'],
      },
      {
        code: 'C2',
        label: 'Colinéarité et alignement',
        questionIds: ['geo-lp-q3', 'geo-lp-q4', 'geo-lp-q5'],
      },
    ],
  },

  // ── Cercle trigonométrique ───────────────────────────────────────────────
  'test-geo-trig-circle': {
    id: 'test-geo-trig-circle',
    title: 'Cercle trigonométrique',
    domain: 'geometry',
    competencies: [
      {
        code: 'C1',
        label: 'Représentation des angles par abscisses curvilignes',
        questionIds: ['trig-q1', 'trig-q2', 'trig-q3'],
      },
      {
        code: 'C2',
        label: 'Identification cosinus et sinus',
        questionIds: ['trig-q4', 'trig-q5'],
      },
    ],
  },

  // ── Produit scalaire ─────────────────────────────────────────────────────
  'test-geo-produit-scalaire': {
    id: 'test-geo-produit-scalaire',
    title: 'Produit scalaire (1ère Bac)',
    domain: 'geometry',
    competencies: [
      {
        code: 'C1',
        label: 'Calcul distances et angles',
        questionIds: ['ps-q1'],
      },
      {
        code: 'C2',
        label: 'Condition (MA⃗ · MB⃗ = 0)',
        questionIds: ['ps-q2'],
      },
      {
        code: 'C3',
        label: "Centre et rayon d'un cercle",
        questionIds: ['ps-q3'],
      },
      {
        code: 'C4',
        label: 'Paramétrique ↔ cartésien',
        questionIds: ['ps-q4'],
      },
      {
        code: 'C5',
        label: 'Résolution de problèmes géométriques',
        questionIds: ['ps-q5'],
      },
    ],
  },
}

/** Retourne la définition d'une leçon, ou null si inconnue */
export function getLessonDef(lessonId: string): LessonDef | null {
  return LESSON_DEFINITIONS[lessonId] ?? null
}

/** Retourne toutes les leçons de géométrie */
export function getGeometryLessons(): LessonDef[] {
  return Object.values(LESSON_DEFINITIONS).filter((l) => l.domain === 'geometry')
}
