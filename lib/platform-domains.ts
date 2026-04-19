import type { MainDomain } from './mock-data'

/**
 * Seven top-level domains for the Moroccan cognitive & academic platform.
 * Capacities map to `testId` entries in `mockTests`.
 */
export const platformDomains: MainDomain[] = [
  {
    id: 'attentional-capacities',
    name: 'Attentional capacities',
    description:
      'Divided, selective, and sustained attention; attentional flexibility.',
    subdomains: [
      {
        id: 'attention-core',
        name: 'Attention',
        capacities: [
          { id: 'divided-attention', name: 'Divided attention', nameFr: 'Attention divisée', testId: 'test-divided-attention' },
          { id: 'selective-attention', name: 'Selective attention', nameFr: 'Attention sélective', testId: 'test-selective-attention' },
          { id: 'sustained-attention', name: 'Sustained attention', nameFr: 'Attention soutenue', testId: 'test-sustained-attention' },
          { id: 'attentional-flexibility', name: 'Attentional flexibility', nameFr: 'Flexibilité attentionnelle', testId: 'test-visuo-spatial-attention' },
        ],
      },
    ],
  },
  {
    id: 'reasoning-capacities',
    name: 'Reasoning capacities',
    description: 'Abstract, deductive, and inductive reasoning.',
    subdomains: [
      {
        id: 'reasoning-core',
        name: 'Reasoning',
        capacities: [
          { id: 'abstract-reasoning', name: 'Abstract reasoning', nameFr: 'Raisonnement abstrait', testId: 'test-abstract-reasoning' },
          { id: 'deductive-reasoning', name: 'Deductive reasoning', nameFr: 'Raisonnement déductif', testId: 'test-deductive-reasoning' },
          { id: 'inductive-reasoning', name: 'Inductive reasoning', nameFr: 'Raisonnement inductif', testId: 'test-inductive-reasoning' },
        ],
      },
    ],
  },
  {
    id: 'spatial-reasoning',
    name: 'Spatial reasoning',
    description: 'Mental rotation, transformation, and spatial orientation.',
    subdomains: [
      {
        id: 'spatial-core',
        name: 'Spatial cognition',
        capacities: [
          { id: 'mental-rotation', name: '2D and 3D mental rotation', testId: 'test-mental-rotation' },
          { id: 'mental-transformation', name: 'Mental transformation', testId: 'test-spatial-transformation' },
          { id: 'spatial-orientation', name: 'Spatial orientation', testId: 'test-spatial-orientation' },
        ],
      },
    ],
  },
  {
    id: 'visual-processing',
    name: 'Visual processing',
    description: 'Visual-motor integration, perception, construction, and visuoperceptual skills.',
    subdomains: [
      {
        id: 'visual-integration',
        name: 'Visual integration & construction',
        capacities: [
          { id: 'visuo-motor', name: 'Visual-motor integration', nameFr: 'Intégration visuo-motrice', testId: 'test-visuo-motor' },
          { id: 'visuo-perceptive', name: 'Visual perception (TVPS-3)', nameFr: 'Perception visuelle', testId: 'test-visuo-perceptive' },
          { id: 'visuo-constructive', name: 'Visual construction', nameFr: 'Construction visuelle', testId: 'test-visuo-constructive' },
        ],
      },
      {
        id: 'visuoperceptual',
        name: 'Visuoperceptual skills (TVPS-3)',
        capacities: [
          { id: 'tvps-summary', name: 'Visual discrimination, memory, spatial relations, form constancy, sequential memory, figure-ground, closure', testId: 'test-visuo-perceptive' },
        ],
      },
    ],
  },
  {
    id: 'memory-capacities',
    name: 'Memory capacities',
    description: 'Working memory (visuospatial & global), long-term memory, visual memory.',
    subdomains: [
      {
        id: 'memory-core',
        name: 'Memory',
        capacities: [
          { id: 'working-memory', name: 'Working memory', nameFr: 'Mémoire de travail', testId: 'test-working-memory' },
          { id: 'long-term-memory', name: 'Long-term memory', nameFr: 'Mémoire à long terme', testId: 'test-long-term-memory' },
          { id: 'visuo-spatial-memory', name: 'Visual / visuospatial memory', nameFr: 'Mémoire visuo-spatiale', testId: 'test-visuo-spatial-memory' },
        ],
      },
    ],
  },
  {
    id: 'executive-functions',
    name: 'Executive functions',
    description: 'Cognitive flexibility, inhibition, processing speed, planning.',
    subdomains: [
      {
        id: 'executive-core',
        name: 'Executive control',
        capacities: [
          { id: 'cognitive-flexibility', name: 'Cognitive flexibility', nameFr: 'Flexibilité cognitive', testId: 'test-cognitive-flexibility' },
          { id: 'inhibition', name: 'Inhibition', testId: 'test-inhibition' },
          { id: 'processing-speed', name: 'Processing speed', nameFr: 'Vitesse de traitement', testId: 'test-processing-speed' },
          { id: 'planning', name: 'Planning', nameFr: 'Planification', testId: 'test-planning' },
        ],
      },
    ],
  },
  {
    id: 'mathematics-learning',
    name: 'Domaine mathématique',
    description:
      "Apprentissage des mathématiques basé sur les compétences — géométrie et analyse au cycle secondaire qualifiant (Maroc). Compétences Cₖ cartographiées par niveau scolaire.",
    subdomains: [
      {
        id: 'tronc-commun',
        name: 'Tronc Commun',
        nameFr: 'Tronc Commun',
        capacities: [
          {
            id: 'vectors',
            name: 'Vecteurs',
            nameFr: 'Vecteurs',
            testId: 'test-vectors',
            competencyCode: 'C1',
            gradeLevel: 'Tronc Commun',
          },
          {
            id: 'symmetry',
            name: 'Symétrie et transformations',
            nameFr: 'Symétrie et transformations',
            testId: 'test-transformations-plane',
            competencyCode: 'C2',
            gradeLevel: 'Tronc Commun',
          },
          {
            id: 'dot-product',
            name: 'Produit scalaire',
            nameFr: 'Produit scalaire',
            testId: 'test-dot-product',
            competencyCode: 'C3',
            gradeLevel: 'Tronc Commun',
          },
          {
            id: 'trigonometry',
            name: 'Trigonométrie',
            nameFr: 'Trigonométrie',
            testId: 'test-trigonometry',
            competencyCode: 'C4',
            gradeLevel: 'Tronc Commun',
          },
          {
            id: 'line-plane',
            name: 'Droite dans le plan',
            nameFr: 'Droite dans le plan',
            testId: 'test-line-plane',
            competencyCode: 'C5',
            gradeLevel: 'Tronc Commun',
          },
        ],
      },
      {
        id: 'premiere-bac',
        name: '1ère Bac Sciences',
        nameFr: '1ère Bac Sciences',
        capacities: [
          {
            id: 'ps-c1',
            name: 'Parallélisme et perpendicularité (produit scalaire)',
            nameFr: 'Parallélisme et perpendicularité',
            testId: 'test-ps-c1',
            competencyCode: 'C1',
            gradeLevel: '1ère Bac Sciences',
          },
          {
            id: 'ps-c2',
            name: 'Distances et angles (produit scalaire)',
            nameFr: 'Distances et angles',
            testId: 'test-ps-c2',
            competencyCode: 'C2',
            gradeLevel: '1ère Bac Sciences',
          },
          {
            id: 'ps-c3',
            name: 'Ensemble des points M vérifiant MA·MB = 0',
            nameFr: 'Ensemble de points — produit scalaire nul',
            testId: 'test-ps-c3',
            competencyCode: 'C3',
            gradeLevel: '1ère Bac Sciences',
          },
          {
            id: 'ps-c4',
            name: 'Centre et rayon d\'un cercle (équation cartésienne)',
            nameFr: 'Cercle — équation cartésienne',
            testId: 'test-ps-c4',
            competencyCode: 'C4',
            gradeLevel: '1ère Bac Sciences',
          },
          {
            id: 'ps-c5',
            name: 'Représentation paramétrique et équation cartésienne',
            nameFr: 'Représentation paramétrique',
            testId: 'test-ps-c5',
            competencyCode: 'C5',
            gradeLevel: '1ère Bac Sciences',
          },
          {
            id: 'ps-c6',
            name: 'Propriétés analytiques du produit scalaire',
            nameFr: 'Propriétés analytiques — produit scalaire',
            testId: 'test-ps-c6',
            competencyCode: 'C6',
            gradeLevel: '1ère Bac Sciences',
          },
        ],
      },
    ],
  },
]
