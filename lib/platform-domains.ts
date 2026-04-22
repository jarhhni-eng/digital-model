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
    id: 'geometry-learning',
    name: 'Cognition et apprentissage de la géométrie',
    description: "Évaluer les capacités cognitives mobilisées dans l'apprentissage de la géométrie du secondaire qualifiant.",
    subdomains: [
      {
        id: 'geo-vectors',
        name: 'Vecteurs et translation',
        nameFr: 'Vecteurs et translation',
        capacities: [
          { id: 'geo-vectors-cap', name: 'Vectors and translation', nameFr: 'Vecteurs et translation', testId: 'test-geo-vectors' },
        ],
      },
      {
        id: 'geo-central-sym',
        name: 'Symétrie centrale',
        nameFr: 'Symétrie centrale',
        capacities: [
          { id: 'geo-central-sym-cap', name: 'Central symmetry', nameFr: 'Symétrie centrale', testId: 'test-geo-central-sym' },
        ],
      },
      {
        id: 'geo-axial-sym',
        name: 'Symétrie axiale',
        nameFr: 'Symétrie axiale',
        capacities: [
          { id: 'geo-axial-sym-cap', name: 'Axial symmetry', nameFr: 'Symétrie axiale', testId: 'test-geo-symetrie-axiale' },
        ],
      },
      {
        id: 'geo-dot-product',
        name: 'Produit scalaire',
        nameFr: 'Produit scalaire',
        capacities: [
          { id: 'geo-dot-product-cap', name: 'Dot product', nameFr: 'Produit scalaire', testId: 'test-geo-dot-product' },
        ],
      },
      {
        id: 'geo-trigonometry',
        name: 'Trigonométrie',
        nameFr: 'Trigonométrie',
        capacities: [
          { id: 'geo-trig-cap', name: 'Trigonometry', nameFr: 'Trigonométrie', testId: 'test-geo-trigonometry' },
        ],
      },
      {
        id: 'geo-line-plane',
        name: 'Droite dans le plan',
        nameFr: 'Droite dans le plan',
        capacities: [
          { id: 'geo-line-plane-cap', name: 'Line in the plane', nameFr: 'Droite dans le plan', testId: 'test-geo-line-plane' },
        ],
      },
      {
        id: 'geo-3d-geometry',
        name: 'Géométrie dans l\'espace',
        nameFr: 'Géométrie dans l\'espace',
        capacities: [
          { id: 'geo-3d-geometry-cap', name: 'Spatial Geometry', nameFr: 'Géométrie dans l\'espace', testId: 'test-geo-3d-geometry' },
        ],
      },
    ],
  },
]
