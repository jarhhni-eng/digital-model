/** Theoretical introduction & instructions per test — used by the generic test shell. */

export interface TestTheoreticalMeta {
  definition: string
  background: string
  author: string
  source: string
  objective: string
  instructions: string
}

const defaultMeta: TestTheoreticalMeta = {
  definition:
    'A standardized cognitive or academic task measuring specific capacities through structured items.',
  background:
    'Based on psychometric and educational measurement principles; adapted for digital administration.',
  author: 'Research platform (adaptation)',
  source: 'Internal documentation / published test manuals where applicable',
  objective:
    'Quantify performance for feedback, research, and instructional planning.',
  instructions:
    'Answer each item carefully. Use Next to move forward. You must accept the instructions before starting. Scores are computed after submission.',
}

const byTest: Record<string, Partial<TestTheoreticalMeta>> = {
  'test-selective-attention': {
    definition:
      'Selective attention is the ability to focus on task-relevant stimuli while ignoring distractors.',
    background:
      'Related to Stroop-like interference and executive control over automatic responses.',
    objective: 'Assess selective attention and inhibitory control under interference.',
  },
  'test-geo-vectors': {
    definition: 'Les vecteurs et translations constituent le socle de la géométrie vectorielle au secondaire qualifiant. Un vecteur est défini par sa direction, son sens et sa norme.',
    background: 'La notion de vecteur et de translation est fondamentale dans le programme marocain de 1ère Bac Sciences. Elle lie algèbre et géométrie et prépare au produit scalaire.',
    author: 'Programme national marocain — 1ère Bac Sciences',
    source: 'Manuels scolaires marocains, programme MENFP',
    objective: 'Évaluer la maîtrise des vecteurs, de l\'addition vectorielle, de la multiplication scalaire et des translations.',
    instructions: 'Lisez chaque question attentivement. Pour chaque item, sélectionnez la réponse correcte parmi les quatre propositions. Chaque question est associée à une compétence (Cₖ) spécifique.',
  },
  'test-geo-central-sym': {
    definition: 'La symétrie centrale par rapport à un point O est une transformation géométrique qui à tout point M associe le point M\' tel que O est le milieu de [MM\'].',
    background: 'La symétrie centrale est une isométrie indirecte. Elle conserve les distances, les angles et les longueurs. Elle est fondamentale pour comprendre les figures symétriques.',
    author: 'Programme national marocain — 1ère Bac Sciences',
    source: 'Manuels scolaires marocains, programme MENFP',
    objective: 'Évaluer la compréhension de la symétrie centrale, de ses propriétés et de ses applications géométriques.',
    instructions: 'Lisez chaque question attentivement. Pour chaque item, sélectionnez la réponse correcte parmi les quatre propositions. Chaque question est associée à une compétence (Cₖ) spécifique.',
  },
  'test-geo-axial-sym': {
    definition: 'La symétrie axiale par rapport à une droite d est une transformation qui à tout point M associe son symétrique M\' tel que d est la médiatrice de [MM\'].',
    background: 'La symétrie axiale est une isométrie indirecte qui inverse l\'orientation. La composée de deux symétries axiales d\'axes parallèles est une translation.',
    author: 'Programme national marocain — 1ère Bac Sciences',
    source: 'Manuels scolaires marocains, programme MENFP',
    objective: 'Évaluer la maîtrise de la symétrie axiale, de ses propriétés invariantes et de la construction des images.',
    instructions: 'Lisez chaque question attentivement. Pour chaque item, sélectionnez la réponse correcte parmi les quatre propositions. Chaque question est associée à une compétence (Cₖ) spécifique.',
  },
  'test-geo-dot-product': {
    definition: 'Le produit scalaire de deux vecteurs u⃗ = (x₁, y₁) et v⃗ = (x₂, y₂) est le réel u⃗·v⃗ = x₁x₂ + y₁y₂. Il permet de calculer angles, normes et orthogonalité.',
    background: 'Le produit scalaire est un outil central de la géométrie analytique. Il est utilisé pour démontrer l\'orthogonalité, calculer des distances et résoudre des problèmes métriques.',
    author: 'Programme national marocain — 1ère Bac Sciences',
    source: 'Manuels scolaires marocains, programme MENFP',
    objective: 'Évaluer la capacité à calculer et interpréter le produit scalaire, la norme et la condition d\'orthogonalité.',
    instructions: 'Lisez chaque question attentivement. Pour chaque item, sélectionnez la réponse correcte parmi les quatre propositions. Chaque question est associée à une compétence (Cₖ) spécifique.',
  },
  'test-geo-trigonometry': {
    definition: 'La trigonométrie étudie les relations entre angles et longueurs dans les triangles. Les fonctions sin, cos et tan sont définies sur le cercle trigonométrique.',
    background: 'La trigonométrie est fondamentale pour la résolution de triangles et le calcul vectoriel. Elle intervient dans la formule de l\'angle et la loi des cosinus.',
    author: 'Programme national marocain — 1ère Bac Sciences',
    source: 'Manuels scolaires marocains, programme MENFP',
    objective: 'Évaluer la connaissance des valeurs remarquables, des identités trigonométriques et des applications dans les triangles.',
    instructions: 'Lisez chaque question attentivement. Pour chaque item, sélectionnez la réponse correcte parmi les quatre propositions. Chaque question est associée à une compétence (Cₖ) spécifique.',
  },
  'test-geo-line-plane': {
    definition: 'Une droite dans le plan est caractérisée par une équation de la forme y = mx + b (pente m, ordonnée à l\'origine b) ou ax + by + c = 0 (forme générale).',
    background: 'L\'étude des droites dans le plan est au cœur de la géométrie analytique. Pentes, parallélisme, perpendicularité, distance et intersection sont les notions clés.',
    author: 'Programme national marocain — 1ère Bac Sciences',
    source: 'Manuels scolaires marocains, programme MENFP',
    objective: 'Évaluer la maîtrise des équations de droites, du parallélisme, de la perpendicularité, de la distance point-droite et des intersections.',
    instructions: 'Lisez chaque question attentivement. Pour chaque item, sélectionnez la réponse correcte parmi les quatre propositions. Chaque question est associée à une compétence (Cₖ) spécifique.',
  },
}

export function getTestMetadata(testId: string): TestTheoreticalMeta {
  const extra = byTest[testId] ?? {}
  return { ...defaultMeta, ...extra }
}
