/**
 * Intelligent Recommendation System
 * Rule-based engine informed by SEM coefficients and performance thresholds.
 */

import type {
  Recommendation,
  RecommendationType,
  CognitiveDomainScores,
  CompetencyScore,
  SEMResult,
  Locale,
} from './types'

// ── Threshold constants ───────────────────────────────────────

const LOW_DOMAIN_THRESHOLD = 45       // percentile equivalent
const MEDIUM_DOMAIN_THRESHOLD = 65
const LOW_COMPETENCY_THRESHOLD = 50   // percent score
const MEDIUM_COMPETENCY_THRESHOLD = 70
const HIGH_SEM_COEFFICIENT = 0.30    // |coefficient| threshold for priority

// ── Recommendation templates ──────────────────────────────────

interface RecommendationTemplate {
  id: string
  condition: (ctx: RecommendationContext) => boolean
  type: RecommendationType
  audience: 'teacher' | 'student'
  priority: (ctx: RecommendationContext) => 'high' | 'medium' | 'low'
  titleFr: string
  titleAr: string
  bodyFr: (ctx: RecommendationContext) => string
  bodyAr: (ctx: RecommendationContext) => string
}

interface RecommendationContext {
  domainScores: CognitiveDomainScores
  competencyScores: CompetencyScore[]
  semResults: SEMResult[]
  studentId: string
}

const TEMPLATES: RecommendationTemplate[] = [
  // ── Didactic (teacher) ────────────────────────────────────

  {
    id: 'didactic-spatial-geometry',
    condition: (ctx) => ctx.domainScores.spatial < LOW_DOMAIN_THRESHOLD,
    type: 'didactic',
    audience: 'teacher',
    priority: (ctx) => ctx.domainScores.spatial < 35 ? 'high' : 'medium',
    titleFr: 'Adapter l\'enseignement de la géométrie au raisonnement spatial',
    titleAr: 'تكييف تدريس الهندسة مع التفكير المكاني',
    bodyFr: (ctx) =>
      `Cet étudiant présente un score spatial de ${Math.round(ctx.domainScores.spatial)}%. Recommandation : utilisez des manipulables physiques (compas, rapporteur, modèles 3D) pour les exercices de géométrie. Décomposez les problèmes en étapes séquentielles et fournissez des représentations graphiques avant d'introduire les abstractions. L'apprentissage par ancrage concret améliore significativement les performances des élèves à faible raisonnement spatial.`,
    bodyAr: (ctx) =>
      `يُظهر هذا الطالب درجة مكانية تبلغ ${Math.round(ctx.domainScores.spatial)}٪. التوصية: استخدم أدوات ملموسة (بركار، منقلة، نماذج ثلاثية الأبعاد) في تمارين الهندسة. قسّم المسائل إلى خطوات تسلسلية وقدّم تمثيلات بيانية قبل إدخال التجريدات.`,
  },

  {
    id: 'didactic-attention-load',
    condition: (ctx) => ctx.domainScores.attentional < LOW_DOMAIN_THRESHOLD,
    type: 'didactic',
    audience: 'teacher',
    priority: (ctx) => ctx.domainScores.attentional < 35 ? 'high' : 'medium',
    titleFr: 'Réduire la charge attentionnelle dans les cours',
    titleAr: 'تخفيف العبء الانتباهي في الدروس',
    bodyFr: (ctx) =>
      `Score attentionnel : ${Math.round(ctx.domainScores.attentional)}%. Structurez les cours en blocs de 15–20 minutes avec des pauses actives. Évitez les présentations denses en informations. Utilisez la technique "worked examples" (exemples résolus) avant les exercices autonomes pour réduire la charge cognitive extrinsèque.`,
    bodyAr: (ctx) =>
      `درجة الانتباه: ${Math.round(ctx.domainScores.attentional)}٪. نظّم الدروس في كتل من 15-20 دقيقة مع فترات راحة نشطة. تجنّب العروض الكثيفة بالمعلومات. استخدم أسلوب "الأمثلة المحلولة" قبل التمارين المستقلة لتقليل العبء المعرفي.`,
  },

  {
    id: 'didactic-memory-strategies',
    condition: (ctx) => ctx.domainScores.memory < LOW_DOMAIN_THRESHOLD,
    type: 'didactic',
    audience: 'teacher',
    priority: (ctx) => 'medium',
    titleFr: 'Stratégies pédagogiques pour la mémoire de travail faible',
    titleAr: 'استراتيجيات تربوية لضعف الذاكرة العاملة',
    bodyFr: (ctx) =>
      `Score mémoire : ${Math.round(ctx.domainScores.memory)}%. Fournissez des fiches de formules et des aides-mémoire lors des exercices. Divisez les problèmes complexes en sous-tâches. Encouragez l'utilisation de schémas et de représentations intermédiaires. La notation progressive sur feuille réduit la charge sur la mémoire de travail.`,
    bodyAr: (ctx) =>
      `درجة الذاكرة: ${Math.round(ctx.domainScores.memory)}٪. وفّر بطاقات صيغ ومذكرات مساعدة أثناء التمارين. قسّم المسائل المعقدة إلى مهام فرعية. شجّع استخدام المخططات والتمثيلات الوسيطة.`,
  },

  {
    id: 'didactic-executive-planning',
    condition: (ctx) => ctx.domainScores.executive < LOW_DOMAIN_THRESHOLD,
    type: 'didactic',
    audience: 'teacher',
    priority: (ctx) => 'medium',
    titleFr: 'Renforcer les stratégies de planification et d\'auto-régulation',
    titleAr: 'تعزيز استراتيجيات التخطيط والتنظيم الذاتي',
    bodyFr: (ctx) =>
      `Score exécutif : ${Math.round(ctx.domainScores.executive)}%. Intégrez des routines de résolution de problèmes explicites (PDCA). Enseignez la vérification systématique des réponses. Proposez des grilles d'auto-évaluation pour que l'élève gère son processus de résolution.`,
    bodyAr: (ctx) =>
      `درجة التنفيذية: ${Math.round(ctx.domainScores.executive)}٪. أدرج روتينات صريحة لحل المسائل. علّم التحقق المنهجي من الإجابات. قدّم شبكات تقييم ذاتي تُمكّن الطالب من إدارة مساره.`,
  },

  // ── Psycho-Pedagogical (teacher) ─────────────────────────

  {
    id: 'psychoped-engagement',
    condition: (ctx) =>
      ctx.domainScores.attentional < MEDIUM_DOMAIN_THRESHOLD ||
      ctx.domainScores.executive < LOW_DOMAIN_THRESHOLD,
    type: 'psycho-pedagogical',
    audience: 'teacher',
    priority: (ctx) => 'medium',
    titleFr: 'Stratégies d\'engagement et de participation en classe',
    titleAr: 'استراتيجيات التفاعل والمشاركة في الفصل',
    bodyFr: (ctx) =>
      `Favorisez l'apprentissage coopératif (groupes de 3–4). Posez des questions ouvertes pour stimuler la réflexion. Introduisez des défis-problèmes à durée limitée (5 min) pour maintenir l'engagement. Valorisez l'effort plutôt que la performance instantanée.`,
    bodyAr: (ctx) =>
      `شجّع التعلم التعاوني (مجموعات من 3-4). اطرح أسئلة مفتوحة لتحفيز التفكير. أدرج تحديات مسائل محدودة الوقت (5 دقائق) للحفاظ على التفاعل. قدّر الجهد بدلاً من الأداء الفوري.`,
  },

  {
    id: 'psychoped-cognitive-load',
    condition: (ctx) =>
      ctx.domainScores.memory < MEDIUM_DOMAIN_THRESHOLD &&
      ctx.domainScores.attentional < MEDIUM_DOMAIN_THRESHOLD,
    type: 'psycho-pedagogical',
    audience: 'teacher',
    priority: (ctx) => 'high',
    titleFr: 'Gestion de la charge cognitive en situation d\'apprentissage',
    titleAr: 'إدارة العبء المعرفي في مواقف التعلم',
    bodyFr: (ctx) =>
      `Cet étudiant présente des capacités attentionnelles et mnésiques en dessous de la moyenne. Appliquez les principes de la Théorie de la Charge Cognitive (Sweller, 1988) : réduisez la charge extrinsèque (mise en page claire), optimisez la charge intrinsèque (progressivité), augmentez la charge germane (liens avec savoirs antérieurs).`,
    bodyAr: (ctx) =>
      `يُظهر هذا الطالب قدرات انتباهية وذاكرية أقل من المتوسط. طبّق مبادئ نظرية العبء المعرفي (سويلر، 1988): قلّص العبء الخارجي، حسّن العبء الجوهري بالتدرج، وزد العبء البنائي بربط المفاهيم بالمعرفة السابقة.`,
  },

  // ── Student-Facing Exercises ──────────────────────────────

  {
    id: 'student-spatial-training',
    condition: (ctx) => ctx.domainScores.spatial < LOW_DOMAIN_THRESHOLD,
    type: 'student-exercise',
    audience: 'student',
    priority: (ctx) => 'high',
    titleFr: 'Exercices de renforcement du raisonnement spatial',
    titleAr: 'تمارين لتعزيز التفكير المكاني',
    bodyFr: (ctx) =>
      `Votre score spatial (${Math.round(ctx.domainScores.spatial)}%) suggère des difficultés de visualisation mentale. Entraînement recommandé :\n• Puzzles de rotation mentale (tangram, blocs de Kohs)\n• Dessins de figures géométriques sous différentes orientations\n• Origami et pliage de papier\n• Jeux vidéo spatiaux (Minecraft, Portal)\n• 15–20 minutes par jour pendant 4 semaines.`,
    bodyAr: (ctx) =>
      `درجتك المكانية (${Math.round(ctx.domainScores.spatial)}٪) تشير إلى صعوبات في التصور الذهني. التدريب الموصى به:\n• ألغاز الدوران الذهني (تانغرام، مكعبات كوهس)\n• رسم أشكال هندسية بتوجهات مختلفة\n• أوريغامي وطي الورق\n• 15-20 دقيقة يوميًا لمدة 4 أسابيع.`,
  },

  {
    id: 'student-attention-training',
    condition: (ctx) => ctx.domainScores.attentional < LOW_DOMAIN_THRESHOLD,
    type: 'student-exercise',
    audience: 'student',
    priority: (ctx) => 'high',
    titleFr: 'Stratégies personnelles pour améliorer l\'attention',
    titleAr: 'استراتيجيات شخصية لتحسين الانتباه',
    bodyFr: (ctx) =>
      `Votre score attentionnel (${Math.round(ctx.domainScores.attentional)}%) indique des difficultés de concentration. Stratégies recommandées :\n• Technique Pomodoro : 25 min de travail, 5 min de pause\n• Étudier dans un environnement calme, sans écran\n• Applications de pleine conscience (10 min/jour)\n• Exercice physique régulier (améliore la vigilance de 15–20%)\n• Éviter l\'étude tardive la nuit.`,
    bodyAr: (ctx) =>
      `درجتك الانتباهية (${Math.round(ctx.domainScores.attentional)}٪) تشير إلى صعوبات في التركيز. الاستراتيجيات الموصى بها:\n• تقنية بومودورو: 25 دقيقة عمل، 5 دقائق راحة\n• الدراسة في بيئة هادئة بعيدًا عن الشاشات\n• تطبيقات التأمل (10 دقائق يوميًا)\n• ممارسة الرياضة بانتظام.`,
  },

  {
    id: 'student-memory-techniques',
    condition: (ctx) => ctx.domainScores.memory < LOW_DOMAIN_THRESHOLD,
    type: 'student-exercise',
    audience: 'student',
    priority: (ctx) => 'medium',
    titleFr: 'Techniques de mémorisation pour les mathématiques',
    titleAr: 'تقنيات الحفظ للرياضيات',
    bodyFr: (ctx) =>
      `Score mémoire : ${Math.round(ctx.domainScores.memory)}%. Techniques recommandées :\n• Fiches de révision (flashcards) pour les formules\n• Méthode des loci (palais de la mémoire) pour les théorèmes\n• Répétition espacée (Anki ou similaire)\n• Enseigner les concepts à quelqu'un d'autre\n• Créer des cartes mentales visuelles des chapitres.`,
    bodyAr: (ctx) =>
      `درجة الذاكرة: ${Math.round(ctx.domainScores.memory)}٪. التقنيات الموصى بها:\n• بطاقات مراجعة للصيغ والقوانين\n• طريقة القصر الذهني للمبرهنات\n• التكرار المتباعد (أنكي أو ما شابهه)\n• تعليم المفاهيم لشخص آخر\n• إنشاء خرائط ذهنية بصرية للفصول.`,
  },

  {
    id: 'student-competency-weak',
    condition: (ctx) =>
      ctx.competencyScores.some((c) => c.standardizedScore < LOW_COMPETENCY_THRESHOLD),
    type: 'student-exercise',
    audience: 'student',
    priority: (ctx) => 'high',
    titleFr: 'Renforcement des compétences mathématiques faibles',
    titleAr: 'تعزيز الكفاءات الرياضية الضعيفة',
    bodyFr: (ctx) => {
      const weak = ctx.competencyScores.filter(
        (c) => c.standardizedScore < LOW_COMPETENCY_THRESHOLD
      )
      const names = weak.map((c) => `C${c.competencyId.slice(-1)} (${Math.round(c.standardizedScore)}%)`).join(', ')
      return `Des lacunes ont été détectées dans les compétences : ${names}. Plan de révision :\n• Revoir les définitions et propriétés fondamentales\n• Résoudre 5 exercices de base par compétence chaque jour\n• Consulter les corrigés du manuel officiel marocain\n• Demander des explications supplémentaires au professeur lors des séances de soutien.`
    },
    bodyAr: (ctx) => {
      const weak = ctx.competencyScores.filter(
        (c) => c.standardizedScore < LOW_COMPETENCY_THRESHOLD
      )
      const names = weak.map((c) => `ك${c.competencyId.slice(-1)} (${Math.round(c.standardizedScore)}٪)`).join(', ')
      return `تم الكشف عن ثغرات في الكفاءات: ${names}. خطة المراجعة:\n• مراجعة التعريفات والخصائص الأساسية\n• حل 5 تمارين أساسية لكل كفاءة يوميًا\n• الرجوع إلى حلول الكتاب المدرسي المغربي الرسمي\n• طلب شرح إضافي من الأستاذ.`
    },
  },

  {
    id: 'student-visual-games',
    condition: (ctx) => ctx.domainScores.visual < LOW_DOMAIN_THRESHOLD,
    type: 'student-exercise',
    audience: 'student',
    priority: (ctx) => 'medium',
    titleFr: 'Jeux éducatifs pour le traitement visuel',
    titleAr: 'ألعاب تعليمية للمعالجة البصرية',
    bodyFr: (ctx) =>
      `Score visuel : ${Math.round(ctx.domainScores.visual)}%. Activités recommandées :\n• Puzzles visuels en ligne (jeux de perception)\n• Exercices de copie de figures géométriques complexes\n• Lecture de plans et cartes (orientation spatiale)\n• Jeux d\'échecs (favorise la visualisation d\'anticipation)\n• 20 minutes par jour, 3 fois par semaine.`,
    bodyAr: (ctx) =>
      `درجة البصرية: ${Math.round(ctx.domainScores.visual)}٪. الأنشطة الموصى بها:\n• ألغاز بصرية عبر الإنترنت\n• تمارين نسخ أشكال هندسية معقدة\n• قراءة الخرائط والمساقط الهندسية\n• لعب الشطرنج (يُعزز التصور الاستباقي)\n• 20 دقيقة يوميًا، 3 مرات أسبوعيًا.`,
  },

  {
    id: 'student-reasoning-enrichment',
    condition: (ctx) => ctx.domainScores.reasoning >= MEDIUM_DOMAIN_THRESHOLD,
    type: 'student-exercise',
    audience: 'student',
    priority: (ctx) => 'low',
    titleFr: 'Approfondissement — Raisonnement avancé',
    titleAr: 'إثراء — تفكير متقدم',
    bodyFr: (ctx) =>
      `Votre score de raisonnement est excellent (${Math.round(ctx.domainScores.reasoning)}%). Défis recommandés :\n• Olympiades de mathématiques (sujets régionaux marocains)\n• Problèmes de logique et de combinatoire\n• Projets de recherche mathématique\n• Préparation aux concours des grandes écoles.`,
    bodyAr: (ctx) =>
      `درجة تفكيرك ممتازة (${Math.round(ctx.domainScores.reasoning)}٪). التحديات الموصى بها:\n• أولمبياد الرياضيات (المسابقات الإقليمية المغربية)\n• مسائل المنطق والتوافقيات\n• مشاريع البحث الرياضي\n• التحضير لمسابقات المدارس العليا.`,
  },
]

// ── Recommendation Generator ──────────────────────────────────

export function generateRecommendations(
  studentId: string,
  competencyScores: CompetencyScore[],
  domainScores: CognitiveDomainScores,
  semResults: SEMResult[]
): Recommendation[] {
  const ctx: RecommendationContext = {
    domainScores,
    competencyScores,
    semResults,
    studentId,
  }

  const generated: Recommendation[] = []
  const now = new Date().toISOString()

  for (const template of TEMPLATES) {
    if (!template.condition(ctx)) continue

    generated.push({
      id: `${template.id}-${studentId}`,
      studentId,
      type: template.type,
      audience: template.audience,
      priority: template.priority(ctx),
      titleFr: template.titleFr,
      titleAr: template.titleAr,
      bodyFr: template.bodyFr(ctx),
      bodyAr: template.bodyAr(ctx),
      generatedAt: now,
    })
  }

  // Sort: high priority first, then by type (didactic → psycho-ped → student)
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  const typeOrder = { didactic: 0, 'psycho-pedagogical': 1, 'student-exercise': 2 }

  generated.sort((a, b) => {
    const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (pDiff !== 0) return pDiff
    return typeOrder[a.type] - typeOrder[b.type]
  })

  // Limit: max 5 per audience
  const teacherRecs = generated.filter((r) => r.audience === 'teacher').slice(0, 5)
  const studentRecs = generated.filter((r) => r.audience === 'student').slice(0, 5)

  return [...teacherRecs, ...studentRecs]
}

// ── SEM-informed intervention leverage points ─────────────────

export interface LeveragePoint {
  domain: string
  domainFr: string
  domainAr: string
  maxAbsCoefficient: number  // across all competencies
  averageCoefficient: number
  priority: 'high' | 'medium' | 'low'
}

const DOMAIN_LABELS: Record<string, { fr: string; ar: string }> = {
  attentional: { fr: 'Attentionnel', ar: 'انتباهي' },
  reasoning: { fr: 'Raisonnement', ar: 'استدلالي' },
  spatial: { fr: 'Spatial', ar: 'مكاني' },
  visual: { fr: 'Visuel', ar: 'بصري' },
  memory: { fr: 'Mémoire', ar: 'ذاكرة' },
  executive: { fr: 'Exécutif', ar: 'تنفيذي' },
}

export function computeLeveragePoints(semResults: SEMResult[]): LeveragePoint[] {
  const domains = ['attentional', 'reasoning', 'spatial', 'visual', 'memory', 'executive']
  const coefIndexes = [1, 2, 3, 4, 5, 6]  // indices in coefficients array

  return domains.map((domain, di) => {
    const coefIdx = coefIndexes[di]
    const coefs = semResults.map((r) => Math.abs(r.coefficients[coefIdx] ?? 0))
    const maxAbsCoefficient = coefs.reduce((m, c) => Math.max(m, c), 0)
    const averageCoefficient = coefs.reduce((s, c) => s + c, 0) / (coefs.length || 1)

    return {
      domain,
      domainFr: DOMAIN_LABELS[domain]?.fr ?? domain,
      domainAr: DOMAIN_LABELS[domain]?.ar ?? domain,
      maxAbsCoefficient,
      averageCoefficient,
      priority:
        maxAbsCoefficient >= HIGH_SEM_COEFFICIENT
          ? 'high'
          : maxAbsCoefficient >= 0.15
          ? 'medium'
          : 'low',
    }
  }).sort((a, b) => b.maxAbsCoefficient - a.maxAbsCoefficient)
}
