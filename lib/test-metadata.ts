/**
 * Test Metadata — Theoretical introduction and instructions for each test.
 * Each test has:
 *   A. Theoretical Introduction (definition, background, author, source, objective)
 *   B. Instructions (steps, important notes, mandatory acceptance)
 */

export interface TestMetadata {
  testId: string
  domainId: string
  theoryTitle: { fr: string; ar: string }
  definition: { fr: string; ar: string }
  background: { fr: string; ar: string }
  author: string
  source: string
  objective: { fr: string; ar: string }
  estimatedDuration: number  // minutes
  questionCount: number
}

export interface TestInstructions {
  testId: string
  steps: Array<{ fr: string; ar: string }>
  importantNotes: Array<{ fr: string; ar: string }>
  exampleQuestion?: {
    question: string
    options: string[]
    correctIndex: number
    explanation: { fr: string; ar: string }
  }
}

// ── Test Metadata Dictionary ──────────────────────────────────

export const TEST_METADATA: Record<string, TestMetadata> = {
  // ── Attentional ──────────────────────────────────────────────
  'test-attention-divided': {
    testId: 'test-attention-divided',
    domainId: 'attentional',
    theoryTitle: { fr: 'Attention Divisée', ar: 'الانتباه المنقسم' },
    definition: {
      fr: "L'attention divisée est la capacité à traiter simultanément deux flux d'informations ou plus, en allouant les ressources attentionnelles entre plusieurs tâches concurrentes.",
      ar: 'الانتباه المنقسم هو القدرة على معالجة تدفقين أو أكثر من المعلومات في وقت واحد، مع توزيع الموارد الانتباهية بين مهام متزامنة.',
    },
    background: {
      fr: "Selon le modèle des ressources attentionnelles de Kahneman (1973), l'attention est une ressource limitée partagée entre les tâches. Les mesures de l'attention divisée évaluent la capacité à gérer la charge cognitive double. Des déficits dans ce domaine sont associés à des difficultés d'apprentissage, notamment en mathématiques.",
      ar: 'وفقًا لنموذج الموارد الانتباهية لكانيمان (1973)، يُعدّ الانتباه موردًا محدودًا يُوزَّع بين المهام. تقيس مقاييس الانتباه المنقسم القدرة على إدارة الحمل المعرفي المزدوج.',
    },
    author: 'Kahneman, D. (1973) ; Baddeley, A. (1986)',
    source: 'Attention and Effort. Prentice-Hall; Working Memory, Oxford University Press',
    objective: {
      fr: "Mesurer la capacité de l'étudiant à partager son attention entre plusieurs stimuli simultanés et à maintenir des performances satisfaisantes sur deux tâches en parallèle.",
      ar: 'قياس قدرة الطالب على توزيع انتباهه بين محفزات متعددة في وقت واحد والحفاظ على أداء مُرضٍ في مهمتين متوازيتين.',
    },
    estimatedDuration: 10,
    questionCount: 15,
  },

  'test-attention-selective': {
    testId: 'test-attention-selective',
    domainId: 'attentional',
    theoryTitle: { fr: 'Attention Sélective', ar: 'الانتباه الانتقائي' },
    definition: {
      fr: "L'attention sélective est la capacité à focaliser les ressources cognitives sur un stimulus cible tout en inhibant les distracteurs non pertinents. Elle reflète l'efficacité du filtre attentionnel.",
      ar: 'الانتباه الانتقائي هو القدرة على تركيز الموارد المعرفية على محفز مستهدف مع تجاهل المشتتات غير ذات الصلة.',
    },
    background: {
      fr: "Le modèle du filtre attentionnel de Broadbent (1958) postule que le système attentionnel filtre les informations sensorielles avant leur traitement complet. L'attention sélective efficace est un prédicteur significatif de la réussite scolaire en mathématiques.",
      ar: 'يفترض نموذج المرشح الانتباهي لبرودبنت (1958) أن الجهاز الانتباهي يُرشّح المعلومات الحسية قبل معالجتها بالكامل.',
    },
    author: 'Broadbent, D.E. (1958) ; Treisman, A. (1964)',
    source: 'Perception and Communication, Pergamon Press',
    objective: {
      fr: "Évaluer la capacité de l'étudiant à isoler un stimulus cible parmi des distracteurs et à maintenir le focus attentionnel sur l'information pertinente.",
      ar: 'تقييم قدرة الطالب على عزل محفز مستهدف بين المشتتات والحفاظ على التركيز الانتباهي على المعلومات ذات الصلة.',
    },
    estimatedDuration: 8,
    questionCount: 12,
  },

  'test-attention-sustained': {
    testId: 'test-attention-sustained',
    domainId: 'attentional',
    theoryTitle: { fr: 'Attention Soutenue', ar: 'الانتباه المستدام' },
    definition: {
      fr: "L'attention soutenue (vigilance) est la capacité à maintenir un niveau d'alerte et de concentration constant sur une période prolongée, même en l'absence de stimulation externe intense.",
      ar: 'الانتباه المستدام (اليقظة) هو القدرة على الحفاظ على مستوى ثابت من التيقظ والتركيز على مدى فترة زمنية طويلة.',
    },
    background: {
      fr: "Les théories de la vigilance (Mackworth, 1948 ; Warm et al., 1996) décrivent le déclin des performances au cours du temps (vigilance decrement). Ce type d'attention est crucial pour les examens de longue durée.",
      ar: 'تصف نظريات اليقظة (ماكورث، 1948) تراجع الأداء مع مرور الوقت (انخفاض اليقظة). هذا النوع من الانتباه حاسم للامتحانات الطويلة.',
    },
    author: 'Mackworth, N.H. (1948) ; Warm, J.S. et al. (1996)',
    source: 'Researches on the Measurement of Human Performance; Human Factors Journal',
    objective: {
      fr: "Mesurer la capacité à maintenir l'attention et à détecter des cibles rares au fil du temps, simulant les conditions d'un examen prolongé.",
      ar: 'قياس القدرة على الحفاظ على الانتباه والكشف عن أهداف نادرة بمرور الوقت، محاكيًا ظروف الامتحان الطويل.',
    },
    estimatedDuration: 12,
    questionCount: 20,
  },

  'test-attention-flexibility': {
    testId: 'test-attention-flexibility',
    domainId: 'attentional',
    theoryTitle: { fr: 'Flexibilité Attentionnelle', ar: 'المرونة الانتباهية' },
    definition: {
      fr: "La flexibilité attentionnelle est la capacité à déplacer volontairement le focus attentionnel d'un aspect à un autre, permettant de basculer rapidement entre différents ensembles de règles ou de stimuli.",
      ar: 'المرونة الانتباهية هي القدرة على تحويل التركيز الانتباهي طوعًا من جانب إلى آخر، مما يتيح التبديل السريع بين مجموعات مختلفة من القواعد.',
    },
    background: {
      fr: "Composante du contrôle exécutif (Miyake et al., 2000), la flexibilité attentionnelle est évaluée via des tâches de commutation (task switching) et le Trail Making Test. Elle prédit la capacité d'adaptation à de nouveaux contextes d'apprentissage.",
      ar: 'كمكوّن من مكونات التحكم التنفيذي (مياكي وآخرون، 2000)، تُقيَّم المرونة الانتباهية عبر مهام التبديل وما شابهها.',
    },
    author: 'Miyake, A. et al. (2000) ; Reitan, R.M. (1958)',
    source: 'Cognitive Psychology, 41; Trail Making Test Manual',
    objective: {
      fr: "Évaluer la capacité de l'étudiant à adapter rapidement ses stratégies attentionnelles en fonction de changements dans les règles ou les stimuli.",
      ar: 'تقييم قدرة الطالب على التكيف السريع لاستراتيجياته الانتباهية وفق التغييرات في القواعد أو المحفزات.',
    },
    estimatedDuration: 8,
    questionCount: 12,
  },

  // ── Reasoning ────────────────────────────────────────────────
  'test-reasoning-abstract': {
    testId: 'test-reasoning-abstract',
    domainId: 'reasoning',
    theoryTitle: { fr: 'Raisonnement Abstrait', ar: 'التفكير المجرد' },
    definition: {
      fr: "Le raisonnement abstrait est la capacité à identifier des modèles, des relations et des règles dans des informations non verbales et à les appliquer à de nouveaux problèmes. Il constitue une mesure centrale de l'intelligence fluide.",
      ar: 'التفكير المجرد هو القدرة على تحديد الأنماط والعلاقات والقواعد في المعلومات غير اللفظية وتطبيقها على مشكلات جديدة.',
    },
    background: {
      fr: "Le raisonnement abstrait correspond au facteur g de Spearman (1904) et à l'intelligence fluide de Cattell-Horn-Carroll. Les Matrices de Raven (1938) sont l'outil de référence. Il est fortement corrélé à la réussite en mathématiques.",
      ar: 'يرتبط التفكير المجرد بعامل g عند سبيرمان (1904) والذكاء السائل في نظرية كاتل-هورن-كارول. مصفوفات رافن (1938) هي الأداة المرجعية.',
    },
    author: 'Spearman, C. (1904) ; Raven, J.C. (1938)',
    source: 'American Journal of Psychology; Progressive Matrices Manual',
    objective: {
      fr: "Mesurer la capacité d'identification de règles abstraites, de relations entre formes et de complétion de séquences logiques.",
      ar: 'قياس القدرة على تحديد القواعد المجردة والعلاقات بين الأشكال وإكمال التسلسلات المنطقية.',
    },
    estimatedDuration: 15,
    questionCount: 12,
  },

  // ── Spatial ──────────────────────────────────────────────────
  'test-spatial-rotation': {
    testId: 'test-spatial-rotation',
    domainId: 'spatial',
    theoryTitle: { fr: 'Rotation Mentale 2D/3D', ar: 'الدوران الذهني ثنائي وثلاثي الأبعاد' },
    definition: {
      fr: "La rotation mentale est la capacité à faire pivoter des représentations mentales d'objets en 2D ou en 3D et à comparer des objets sous différentes orientations.",
      ar: 'الدوران الذهني هو القدرة على تدوير تمثيلات ذهنية للأشكال ثنائية وثلاثية الأبعاد ومقارنة الأشياء بتوجهات مختلفة.',
    },
    background: {
      fr: "Shepard & Metzler (1971) ont démontré que le temps de rotation mentale est linéairement proportionnel à l'angle de rotation. Ce facteur est fortement prédicteur de la réussite en géométrie de l'espace.",
      ar: 'أثبت شيبارد وميتزلر (1971) أن وقت الدوران الذهني يتناسب خطيًا مع زاوية الدوران. هذا العامل يتنبأ بقوة بالنجاح في الهندسة الفراغية.',
    },
    author: 'Shepard, R.N. & Metzler, J. (1971)',
    source: 'Science, 171(3972), 701-703',
    objective: {
      fr: "Évaluer la précision et la vitesse de rotation mentale d'objets, composante fondamentale du raisonnement spatial en géométrie.",
      ar: 'تقييم دقة وسرعة الدوران الذهني للأشياء، وهو مكوّن أساسي في التفكير المكاني في الهندسة.',
    },
    estimatedDuration: 12,
    questionCount: 15,
  },

  // ── Visual Processing ─────────────────────────────────────────
  'test-visuo-motor': {
    testId: 'test-visuo-motor',
    domainId: 'visual',
    theoryTitle: { fr: 'Intégration Visuo-Motrice (Beery VMI)', ar: 'التكامل البصري الحركي (Beery VMI)' },
    definition: {
      fr: "L'intégration visuo-motrice (VMI) est la capacité à coordonner la perception visuelle avec les mouvements moteurs fins pour reproduire des formes géométriques. Elle reflète l'efficacité de la boucle perception-action.",
      ar: 'التكامل البصري الحركي هو القدرة على تنسيق الإدراك البصري مع الحركات الحركية الدقيقة لإعادة إنتاج الأشكال الهندسية.',
    },
    background: {
      fr: "Le test Beery VMI (Beery & Buktenica, 1967, rév. 2010) est un outil standardisé évaluant l'intégration visuo-motrice via 27 figures géométriques progressivement complexes. Il prédit la maîtrise de la représentation géométrique.",
      ar: 'اختبار Beery VMI (بيري وبوكتينيكا، 1967، مراجعة 2010) أداة معيارية تُقيّم التكامل البصري الحركي من خلال 27 شكلًا هندسيًا متزايد التعقيد.',
    },
    author: 'Beery, K.E. & Buktenica, N.A. (1967, rev. 2010)',
    source: 'Beery-Buktenica Developmental Test of Visual-Motor Integration, 6th Ed.',
    objective: {
      fr: "Mesurer la précision de la reproduction de formes géométriques par copie, indice de la coordination visuo-motrice et de la perception spatiale.",
      ar: 'قياس دقة نسخ الأشكال الهندسية، كمؤشر للتنسيق البصري الحركي والإدراك المكاني.',
    },
    estimatedDuration: 40,
    questionCount: 27,
  },

  'test-visuo-perceptive': {
    testId: 'test-visuo-perceptive',
    domainId: 'visual',
    theoryTitle: { fr: 'Traitement Visuo-Perceptif (TVPS-3)', ar: 'المعالجة البصرية الإدراكية (TVPS-3)' },
    definition: {
      fr: "Le traitement visuo-perceptif englobe les processus par lesquels le cerveau interprète et organise les informations visuelles reçues par les yeux, sans faire appel aux mouvements moteurs.",
      ar: 'المعالجة البصرية الإدراكية تشمل العمليات التي يفسر بها الدماغ ويُنظّم المعلومات البصرية المستقبَلة دون الاعتماد على الحركة الحركية.',
    },
    background: {
      fr: "Le TVPS-3 (Martin, 2006) est un test standardisé couvrant 7 sous-tests : discrimination visuelle, mémoire visuelle, relations spatiales, constance de forme, mémoire séquentielle, figure-fond et fermeture visuelle.",
      ar: 'TVPS-3 (مارتن، 2006) اختبار معياري يغطي 7 اختبارات فرعية: التمييز البصري، الذاكرة البصرية، العلاقات المكانية، ثبات الشكل، الذاكرة التسلسلية، الشكل والأرضية، والإغلاق البصري.',
    },
    author: 'Martin, N.A. (2006)',
    source: 'Test of Visual Perceptual Skills, 3rd Edition. Academic Therapy Publications.',
    objective: {
      fr: "Évaluer les 7 composantes du traitement visuo-perceptif pour identifier les forces et faiblesses dans la perception visuelle sans réponse motrice.",
      ar: 'تقييم 7 مكونات للمعالجة البصرية الإدراكية لتحديد نقاط القوة والضعف في الإدراك البصري دون استجابة حركية.',
    },
    estimatedDuration: 35,
    questionCount: 112,
  },

  'test-visuo-constructive': {
    testId: 'test-visuo-constructive',
    domainId: 'visual',
    theoryTitle: { fr: 'Construction Visuo-Spatiale', ar: 'البناء البصري المكاني' },
    definition: {
      fr: "La construction visuo-spatiale est la capacité à assembler ou à analyser des éléments visuels pour former ou reconnaître des configurations complexes. Elle implique la coordination de la perception et du raisonnement spatial.",
      ar: 'البناء البصري المكاني هو القدرة على تجميع أو تحليل العناصر البصرية لتشكيل أو التعرف على تكوينات معقدة.',
    },
    background: {
      fr: "Inspiré des subtests des Échelles de Wechsler (WAIS-IV Visual Puzzles), ce test évalue la capacité à analyser et reconstruire mentalement des formes complexes, une compétence centrale pour la géométrie.",
      ar: 'مستوحى من الاختبارات الفرعية لمقاييس ويكسلر (WAIS-IV)، يقيّم هذا الاختبار القدرة على تحليل وإعادة بناء الأشكال المعقدة ذهنيًا.',
    },
    author: 'Wechsler, D. (2008)',
    source: 'Wechsler Adult Intelligence Scale – Fourth Edition (WAIS-IV). Pearson.',
    objective: {
      fr: "Évaluer la capacité d'analyse et de recomposition mentale de formes complexes, prédicteur clé de la performance en géométrie descriptive.",
      ar: 'تقييم القدرة على التحليل وإعادة التركيب الذهني للأشكال المعقدة، كمتنبئ رئيسي بالأداء في الهندسة الوصفية.',
    },
    estimatedDuration: 20,
    questionCount: 25,
  },

  // ── Memory ───────────────────────────────────────────────────
  'test-memory-working': {
    testId: 'test-memory-working',
    domainId: 'memory',
    theoryTitle: { fr: 'Mémoire de Travail', ar: 'الذاكرة العاملة' },
    definition: {
      fr: "La mémoire de travail est un système cognitif à capacité limitée permettant de maintenir et de manipuler temporairement des informations pendant l'accomplissement de tâches complexes.",
      ar: 'الذاكرة العاملة نظام معرفي محدود السعة يتيح الاحتفاظ بالمعلومات ومعالجتها مؤقتًا خلال تنفيذ المهام المعقدة.',
    },
    background: {
      fr: "Le modèle de Baddeley & Hitch (1974), révisé en 2000, comprend : l'administrateur central, la boucle phonologique, le calepin visuo-spatial et le tampon épisodique. La mémoire de travail est un prédicteur puissant de la réussite en mathématiques.",
      ar: 'يشمل نموذج بادلي وهيتش (1974) المُراجَع عام 2000: المدير التنفيذي، الحلقة الصوتية، المفكرة البصرية المكانية، والمخزن المؤقت.',
    },
    author: 'Baddeley, A. & Hitch, G. (1974) ; Baddeley, A. (2000)',
    source: 'Psychology of Learning and Motivation, 8; Trends in Cognitive Sciences, 4(11)',
    objective: {
      fr: "Mesurer la capacité à maintenir et traiter simultanément des informations visuo-spatiales et globales, essentielle pour la résolution de problèmes mathématiques.",
      ar: 'قياس القدرة على الاحتفاظ بالمعلومات البصرية المكانية والعامة ومعالجتها في آنٍ واحد، وهي أساسية لحل المسائل الرياضية.',
    },
    estimatedDuration: 12,
    questionCount: 16,
  },

  // ── Executive Functions ───────────────────────────────────────
  'test-executive-inhibition': {
    testId: 'test-executive-inhibition',
    domainId: 'executive',
    theoryTitle: { fr: 'Inhibition Cognitive', ar: 'التثبيط المعرفي' },
    definition: {
      fr: "L'inhibition cognitive est la capacité à supprimer délibérément les réponses automatiques ou dominantes inappropriées, permettant de maintenir un comportement dirigé vers un but.",
      ar: 'التثبيط المعرفي هو القدرة على كبح الاستجابات التلقائية أو السائدة غير الملائمة عمدًا، مما يتيح الحفاظ على السلوك الموجَّه نحو هدف.',
    },
    background: {
      fr: "L'inhibition est l'une des trois fonctions exécutives centrales de Miyake et al. (2000). Le test de Stroop (Stroop, 1935) est la mesure de référence. Elle est critique pour éviter les erreurs systématiques en mathématiques.",
      ar: 'التثبيط أحد الوظائف التنفيذية الثلاث المركزية لمياكي وآخرين (2000). اختبار ستروب (1935) هو المقياس المرجعي.',
    },
    author: 'Stroop, J.R. (1935) ; Miyake, A. et al. (2000)',
    source: 'Journal of Experimental Psychology, 18(6); Cognitive Psychology, 41',
    objective: {
      fr: "Évaluer la capacité à inhiber des réponses automatiques, mesure de l'efficacité du contrôle cognitif dans les situations de conflit.",
      ar: 'تقييم القدرة على كبح الاستجابات التلقائية، كمقياس لكفاءة التحكم المعرفي في مواقف التعارض.',
    },
    estimatedDuration: 8,
    questionCount: 12,
  },

  // ── Mathematics ───────────────────────────────────────────────
  'test-math-vectors': {
    testId: 'test-math-vectors',
    domainId: 'mathematical',
    theoryTitle: { fr: 'Vecteurs — Géométrie Analytique', ar: 'المتجهات — الهندسة التحليلية' },
    definition: {
      fr: "Les vecteurs sont des entités mathématiques possédant une magnitude et une direction. La géométrie analytique des vecteurs comprend les opérations vectorielles, le produit scalaire et leurs applications géométriques.",
      ar: 'المتجهات كيانات رياضية تمتلك مقدارًا واتجاهًا. تشمل الهندسة التحليلية للمتجهات العمليات المتجهية والجداء النقطي وتطبيقاتها الهندسية.',
    },
    background: {
      fr: "Composante fondamentale du programme de mathématiques du Baccalauréat marocain (Sciences Mathématiques et Sciences Expérimentales), les vecteurs constituent le pont entre la géométrie euclidienne et l'algèbre linéaire.",
      ar: 'كمكوّن أساسي في برنامج رياضيات البكالوريا المغربية، تُشكّل المتجهات الجسر بين الهندسة الإقليدية والجبر الخطي.',
    },
    author: 'Programme officiel MEN Maroc — Mathématiques 1ère BAC',
    source: 'Ministère de l\'Éducation Nationale – Curriculum Mathématiques 2024',
    objective: {
      fr: "Évaluer la maîtrise des compétences vectorielles : définition, opérations, produit scalaire, et application à la résolution de problèmes géométriques.",
      ar: 'تقييم إتقان الكفاءات المتجهية: التعريف، العمليات، الجداء النقطي، وتطبيقها في حل المسائل الهندسية.',
    },
    estimatedDuration: 25,
    questionCount: 30,
  },
}

// ── Test Instructions Dictionary ──────────────────────────────

export const TEST_INSTRUCTIONS: Record<string, TestInstructions> = {
  'test-attention-divided': {
    testId: 'test-attention-divided',
    steps: [
      {
        fr: 'Lisez attentivement chaque question avant de répondre.',
        ar: 'اقرأ كل سؤال بعناية قبل الإجابة.',
      },
      {
        fr: 'Vous verrez deux types d\'informations simultanément. Répondez en tenant compte des deux.',
        ar: 'ستظهر لك نوعان من المعلومات في وقت واحد. أجب مع مراعاة كليهما.',
      },
      {
        fr: 'Choisissez la meilleure réponse parmi les options proposées.',
        ar: 'اختر أفضل إجابة من بين الخيارات المقدمة.',
      },
      {
        fr: 'Cliquez sur "Suivant" pour passer à la question suivante. Vous ne pouvez pas revenir en arrière.',
        ar: 'انقر على "التالي" للانتقال إلى السؤال التالي. لا يمكنك العودة للخلف.',
      },
      {
        fr: 'À la fin, cliquez sur "Soumettre le test" pour enregistrer vos réponses.',
        ar: 'في النهاية، انقر على "إرسال الاختبار" لحفظ إجاباتك.',
      },
    ],
    importantNotes: [
      {
        fr: 'Vos scores ne sont pas affichés pendant le test. Ils sont enregistrés de façon sécurisée.',
        ar: 'لن تُعرض نتائجك أثناء الاختبار. يتم تسجيلها بشكل آمن.',
      },
      {
        fr: 'Le test est chronométré. Essayez de répondre rapidement mais avec précision.',
        ar: 'الاختبار محدد بوقت. حاول الإجابة بسرعة ودقة.',
      },
      {
        fr: 'Ne rafraîchissez pas la page — votre progression est sauvegardée automatiquement.',
        ar: 'لا تُحدّث الصفحة — يتم حفظ تقدمك تلقائيًا.',
      },
    ],
  },

  'test-attention-selective': {
    testId: 'test-attention-selective',
    steps: [
      { fr: 'Regardez attentivement le stimulus présenté.', ar: 'راقب المحفز المقدَّم بعناية.' },
      { fr: 'Identifiez l\'élément cible en ignorant les distracteurs.', ar: 'حدّد العنصر المستهدف مع تجاهل المشتتات.' },
      { fr: 'Sélectionnez la réponse correcte parmi les options.', ar: 'اختر الإجابة الصحيحة من الخيارات.' },
      { fr: 'Cliquez sur "Suivant" pour continuer.', ar: 'انقر على "التالي" للمتابعة.' },
    ],
    importantNotes: [
      { fr: 'Concentrez-vous sur l\'élément demandé, pas sur l\'ensemble du stimulus.', ar: 'ركّز على العنصر المطلوب وليس على المحفز بأكمله.' },
      { fr: 'Les réponses correctes sont masquées pendant le test.', ar: 'الإجابات الصحيحة مخفية أثناء الاختبار.' },
    ],
  },

  'test-reasoning-abstract': {
    testId: 'test-reasoning-abstract',
    steps: [
      { fr: 'Observez la série de figures ou le motif présenté.', ar: 'لاحظ سلسلة الأشكال أو النمط المقدَّم.' },
      { fr: 'Identifiez la règle ou le principe sous-jacent.', ar: 'حدّد القاعدة أو المبدأ الأساسي.' },
      { fr: 'Choisissez la figure qui complète logiquement la séquence.', ar: 'اختر الشكل الذي يُكمل التسلسل منطقيًا.' },
      { fr: 'Cliquez "Suivant" pour passer à la prochaine question.', ar: 'انقر "التالي" للانتقال إلى السؤال التالي.' },
    ],
    importantNotes: [
      { fr: 'Il n\'y a pas de calculs numériques — c\'est du raisonnement par patterns.', ar: 'لا توجد حسابات رقمية — إنه تفكير بالأنماط.' },
      { fr: 'Une seule réponse est correcte pour chaque question.', ar: 'إجابة واحدة فقط صحيحة لكل سؤال.' },
    ],
  },

  'test-visuo-motor': {
    testId: 'test-visuo-motor',
    steps: [
      { fr: 'Observez la figure géométrique affichée à l\'écran.', ar: 'لاحظ الشكل الهندسي المعروض على الشاشة.' },
      { fr: 'Reproduisez-la aussi fidèlement que possible dans l\'espace de dessin.', ar: 'انسخه بأكبر قدر ممكن من الدقة في مساحة الرسم.' },
      { fr: 'Utilisez votre souris/stylet pour tracer la figure.', ar: 'استخدم الماوس/القلم لرسم الشكل.' },
      { fr: 'Cliquez "Suivant" quand vous êtes satisfait de votre tracé.', ar: 'انقر "التالي" عندما تكون راضيًا عن رسمك.' },
    ],
    importantNotes: [
      { fr: 'Essayez de reproduire la taille, la forme et l\'orientation aussi précisément que possible.', ar: 'حاول إعادة إنتاج الحجم والشكل والاتجاه بدقة أكبر قدر ممكن.' },
      { fr: 'Vous ne pouvez pas revenir sur une figure précédente.', ar: 'لا يمكنك العودة إلى شكل سابق.' },
      { fr: 'Le test n\'est pas chronométré — prenez votre temps.', ar: 'الاختبار غير محدد بوقت — خذ وقتك.' },
    ],
    exampleQuestion: {
      question: 'Exemple de figure à copier : une ligne verticale simple',
      options: ['Tracé correct', 'Tracé approximatif', 'Pas de tracé'],
      correctIndex: 0,
      explanation: {
        fr: 'Copiez la figure aussi fidèlement que possible.',
        ar: 'انسخ الشكل بأكبر قدر ممكن من الدقة.',
      },
    },
  },

  'test-visuo-perceptive': {
    testId: 'test-visuo-perceptive',
    steps: [
      { fr: 'Regardez l\'image présentée (figure principale en haut).', ar: 'انظر إلى الصورة المقدَّمة (الشكل الرئيسي في الأعلى).' },
      { fr: 'Examinez les 4 options de réponse.', ar: 'افحص خيارات الإجابة الأربعة.' },
      { fr: 'Sélectionnez l\'option qui correspond le mieux à la consigne du sous-test.', ar: 'اختر الخيار الأنسب وفق تعليمة الاختبار الفرعي.' },
      { fr: 'Cliquez "Suivant" pour passer à l\'image suivante.', ar: 'انقر "التالي" للانتقال إلى الصورة التالية.' },
    ],
    importantNotes: [
      { fr: 'Le test comporte 7 sous-tests de 16 questions chacun (112 questions au total).', ar: 'يتضمن الاختبار 7 اختبارات فرعية من 16 سؤالاً لكل منها (112 سؤالاً إجمالاً).' },
      { fr: 'Chaque sous-test évalue un aspect différent de la perception visuelle.', ar: 'يُقيّم كل اختبار فرعي جانبًا مختلفًا من الإدراك البصري.' },
      { fr: 'Ne vous attardez pas trop sur un seul item.', ar: 'لا تتوقف طويلاً عند بند واحد.' },
    ],
  },

  'test-memory-working': {
    testId: 'test-memory-working',
    steps: [
      { fr: 'Mémorisez les éléments présentés à l\'écran.', ar: 'احفظ العناصر المقدَّمة على الشاشة.' },
      { fr: 'Réalisez la tâche demandée sur ces éléments (ex: les réorganiser, les compter).', ar: 'قم بالمهمة المطلوبة على هذه العناصر (مثل إعادة ترتيبها، عدّها).' },
      { fr: 'Choisissez la bonne réponse parmi les options.', ar: 'اختر الإجابة الصحيحة من الخيارات.' },
      { fr: 'Cliquez "Suivant" pour continuer.', ar: 'انقر "التالي" للمتابعة.' },
    ],
    importantNotes: [
      { fr: 'Ne prenez pas de notes — utilisez uniquement votre mémoire.', ar: 'لا تدوّن ملاحظات — استخدم ذاكرتك فقط.' },
      { fr: 'Certaines questions requièrent de traiter l\'information mémorisée, pas seulement de la retenir.', ar: 'بعض الأسئلة تتطلب معالجة المعلومات المحفوظة وليس مجرد حفظها.' },
    ],
  },

  'test-executive-inhibition': {
    testId: 'test-executive-inhibition',
    steps: [
      { fr: 'Lisez la consigne de chaque question attentivement.', ar: 'اقرأ تعليمة كل سؤال بعناية.' },
      { fr: 'Inhibez votre première réaction si elle va à l\'encontre de la règle.', ar: 'أوقف ردّ فعلك الأول إذا كان مخالفًا للقاعدة.' },
      { fr: 'Sélectionnez la réponse correcte selon la règle en vigueur.', ar: 'اختر الإجابة الصحيحة وفق القاعدة المطبَّقة.' },
      { fr: 'Cliquez "Suivant" pour passer à la question suivante.', ar: 'انقر "التالي" للانتقال إلى السؤال التالي.' },
    ],
    importantNotes: [
      { fr: 'Contrôlez votre première impulsion — elle n\'est pas toujours correcte.', ar: 'تحكّم في أول دافع لديك — فهو ليس دائمًا صحيحًا.' },
      { fr: 'Les règles peuvent changer d\'une question à l\'autre — restez vigilant.', ar: 'قد تتغير القواعد من سؤال لآخر — ابقَ يقظًا.' },
    ],
  },

  'test-math-vectors': {
    testId: 'test-math-vectors',
    steps: [
      { fr: 'Lisez chaque question de mathématiques attentivement.', ar: 'اقرأ كل مسألة رياضية بعناية.' },
      { fr: 'Identifiez la compétence mathématique requise (définition, opération, application).', ar: 'حدّد الكفاءة الرياضية المطلوبة (تعريف، عملية، تطبيق).' },
      { fr: 'Effectuez les calculs nécessaires sur du papier brouillon.', ar: 'أجرِ الحسابات اللازمة على ورقة مسودة.' },
      { fr: 'Choisissez la réponse correcte parmi les 4 options.', ar: 'اختر الإجابة الصحيحة من بين 4 خيارات.' },
      { fr: 'Cliquez "Suivant" pour passer à la question suivante.', ar: 'انقر "التالي" للانتقال إلى السؤال التالي.' },
    ],
    importantNotes: [
      { fr: 'Ce test évalue des compétences du programme officiel marocain (1ère BAC).', ar: 'يُقيّم هذا الاختبار كفاءات البرنامج الرسمي المغربي (أولى باكالوريا).' },
      { fr: 'Les scores par compétence sont calculés séparément.', ar: 'تُحسب النتائج لكل كفاءة على حدة.' },
      { fr: 'Vous pouvez utiliser du papier brouillon mais pas de calculatrice.', ar: 'يمكنك استخدام ورقة مسودة لكن ليس آلة حاسبة.' },
    ],
    exampleQuestion: {
      question: 'Soit u⃗(2, 3) et v⃗(1, -1). Calculer u⃗ · v⃗ (produit scalaire).',
      options: ['-1', '5', '2', '1'],
      correctIndex: 0,
      explanation: {
        fr: 'u⃗ · v⃗ = 2×1 + 3×(-1) = 2 - 3 = -1',
        ar: 'u⃗ · v⃗ = 2×1 + 3×(-1) = 2 - 3 = -1',
      },
    },
  },
}

// ── Helper: Get metadata with fallback ────────────────────────

export function getTestMetadata(testId: string): TestMetadata | null {
  return TEST_METADATA[testId] ?? null
}

export function getTestInstructions(testId: string): TestInstructions | null {
  return TEST_INSTRUCTIONS[testId] ?? null
}
