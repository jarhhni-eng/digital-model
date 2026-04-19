/**
 * Competency codes (Cₖ) for the Mathematics learning domain.
 * Only the Mathematics domain uses competency mapping, per research design.
 * Aligned with the Moroccan secondary curriculum (Tronc Commun & 1ère Bac Sciences).
 */

export interface CompetencyDescriptor {
  code: string
  nameFr: string
  nameAr?: string
  topic: string
  gradeLevel: 'Tronc Commun' | '1ère Bac Sciences'
  testId: string
  description: string
}

export const mathCompetencies: CompetencyDescriptor[] = [
  {
    code: 'C1',
    nameFr: 'Vecteurs',
    nameAr: 'المتجهات',
    topic: 'vectors',
    gradeLevel: 'Tronc Commun',
    testId: 'test-vectors',
    description:
      "Maîtriser la notion de vecteur, les opérations vectorielles et la colinéarité dans le plan.",
  },
  {
    code: 'C2',
    nameFr: 'Symétrie et transformations',
    nameAr: 'التماثل والتحويلات',
    topic: 'symmetry',
    gradeLevel: 'Tronc Commun',
    testId: 'test-transformations-plane',
    description:
      "Reconnaître et appliquer les symétries axiale et centrale, et les transformations du plan.",
  },
  {
    code: 'C3',
    nameFr: 'Produit scalaire (TC)',
    nameAr: 'الجداء السلمي',
    topic: 'dot-product',
    gradeLevel: 'Tronc Commun',
    testId: 'test-dot-product',
    description:
      "Calculer et utiliser le produit scalaire pour démontrer des propriétés géométriques.",
  },
  {
    code: 'C4',
    nameFr: 'Trigonométrie',
    nameAr: 'حساب المثلثات',
    topic: 'trigonometry',
    gradeLevel: 'Tronc Commun',
    testId: 'test-trigonometry',
    description:
      "Utiliser les fonctions trigonométriques (sin, cos, tan) et résoudre des équations trigonométriques simples.",
  },
  {
    code: 'C5',
    nameFr: 'Droite dans le plan',
    nameAr: 'المستقيم في المستوى',
    topic: 'line',
    gradeLevel: 'Tronc Commun',
    testId: 'test-line-plane',
    description:
      "Représenter et caractériser des droites dans le plan cartésien, équation de droite, parallélisme et perpendicularité.",
  },
  {
    code: 'C6',
    nameFr: 'Produit scalaire — approfondissement',
    nameAr: 'الجداء السلمي (تعميق)',
    topic: 'dot-product-space',
    gradeLevel: '1ère Bac Sciences',
    testId: 'test-dot-product-space',
    description:
      "Approfondir le produit scalaire dans l'espace, angles et distances en géométrie tridimensionnelle.",
  },
]

export function getCompetencyByCode(code: string): CompetencyDescriptor | undefined {
  return mathCompetencies.find((c) => c.code === code)
}

export function getCompetenciesByGrade(grade: string): CompetencyDescriptor[] {
  return mathCompetencies.filter((c) => c.gradeLevel === grade)
}
