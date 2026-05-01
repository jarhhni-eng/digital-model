/**
 * Central catalogue of per-test introduction text + scientific references.
 *
 * Used by `<TestIntroSection />` on the FIRST screen of each test only.
 * Does NOT change scoring, questions, timing, or any other screen.
 */

export interface TestReferenceEntry {
  /** Optional general-domain introduction shown above the test-specific one */
  domainIntroduction?: string
  /** Test-specific introduction text (FIRST SCREEN ONLY) */
  introduction?: string
  /** Optional clinical instructions block */
  instructions?: string
  /** Scientific references — rendered in a collapsible section */
  references: string[]
}

// ─── Shared reference sets ────────────────────────────────────────────────────

const EXECUTIVE_FUNCTIONS_INTRO =
  "Les tâches de fonctionnement exécutif sont des tests individuels conçus pour évaluer des compétences spécifiques au sein du fonctionnement exécutif, telles que la mémoire de travail ou l'inhibition. Une revue systématique de 106 études empiriques menée en 2016 visait à comprendre comment les compétences en fonctionnement exécutif sont conceptualisées et opérationnalisées dans la recherche empirique. Les auteurs ont identifié 109 tâches différentes dans la littérature qui ont été utilisées pour mesurer les compétences en fonctionnement exécutif. Parmi ces 109 tâches, les auteurs ont noté que 56 n'ont été utilisées qu'une seule fois, ce qui suggère que les chercheurs ont développé leurs propres tâches à utiliser dans le contexte de leur étude spécifique. Les 53 tâches restantes ont été utilisées plusieurs fois (Baggetta, P., & Alexander, P. A., 2016)."

const EXECUTIVE_FUNCTIONS_REFS: string[] = [
  "Ahmed, S. F., Skibbe, L. E., McRoy, K., Tatar, B. H., & Scharphorn, L. (2022). Stratégies, recommandations et validation des tâches de fonctions exécutives à distance pour une utilisation avec de jeunes enfants. Early Childhood Research Quarterly. https://doi.org/10.31234/osf.io/z2cu3",
  "Baggetta, P., & Alexander, P. A. (2016). Conceptualisation et operationalisation de la fonction exécutive. Mind, Brain, and Education, 10(1), 10–33. https://doi.org/10.1111/mbe.12100",
  "Bezdjian, S., Baker, L. A., Lozano, D. I., & Raine, A. (2009). Évaluation de l'inattention et de l'impulsivité chez les enfants durant la tâche Go/Nogo. British Journal of Developmental Psychology, 27(2), 365–383. https://doi.org/10.1348/026151008x314919",
  "Biagianti, B., Fisher, M., Brandrett, B., Schlosser, D., Loewy, R., Nahum, M., & Vinogradov, S. (2019). Développement et test d'une batterie Web pour évaluer à distance la santé cognitive chez les individus souffrant de schizophrénie. Schizophrenia Research, 208, 250–257. https://doi.org/10.1016/j.schres.2019.01.047",
  "Bjekić, J., Živanović, M., Purić, D., Oosterman, J. M., & Filipović, S. R. (2017). Douleur et fonctions exécutives : Une relation unique entre la tâche de Stroop et la douleur induite expérimentalement. Psychological Research, 82(3), 580–589. https://doi.org/10.1007/s00426-016-0838-2",
  "Bulut, O., Cormier, D. C., Aquilina, A. M., & Bulut, H. C. (2021). Invariance d'âge et de sexe des tests Woodcock-Johnson IV des capacités cognitives. Journal of Intelligence, 9(3), 35. https://doi.org/10.3390/jintelligence9030035",
  "Cahill, M. N., Dodzik, P., Pyykkonen, B. A., & Flanagan, K. S. (2019). Utilisation du test de la tour du système de fonction exécutive Delis-Kaplan pour examiner la sensibilité du TDAH chez les enfants. Journal of Pediatric Neuropsychology, 5(3), 85–102. https://doi.org/10.1007/s40817-019-00068-0",
  "Chainay, H., Joubert, C., & Massol, S. (2021). Effets comportementaux et ERP de l'entraînement cognitif et combiné chez les adultes plus âgés. Advances in Cognitive Psychology, 17(1), 58–69. https://doi.org/10.5709/acp-0317-y",
  "Clark, C. A., Cook, K., Wang, R., Rueschman, M., Radcliffe, J., Redline, S., & Taylor, H. G. (2023). Propriétés psychométriques d'une tâche combinée Go/No-Go et de performance continue à travers l'enfance. Psychological Assessment, 35(4), 353–365. https://doi.org/10.1037/pas0001202",
  "Cragg, L., & Gilmore, C. (2014). Compétences sous-jacentes aux mathématiques : Le rôle de la fonction exécutive dans le développement de la compétence mathématique. Trends in Neuroscience and Education, 3(2), 63–68. https://doi.org/10.1016/j.tine.2013.12.001",
  "Davis, J. L., & Matthews, R. N. (2010). Révision du NEPSY-II. Journal of Psychoeducational Assessment, 28(2), 175–182. https://doi.org/10.1177/0734282909346716",
  "Dumont, R., Willis, J. O., & Walrath, R. (2016). Interprétation clinique des tests Woodcock-Johnson IV. WJ IV Clinical Use and Interpretation, 31–64. https://doi.org/10.1016/b978-0-12-802076-0.00002-5",
  "Ehtesabi, A., Faramarzi, S., Ehteshamzadeh, P., Bakhtiarpour, S., & Ghamarani, A. (2022). L'efficacité d'un ensemble de formation basé sur les fonctions exécutives de Delis-Kaplan. Journal of Adolescent and Youth Psychological Studies, 3(2), 160–170. https://doi.org/10.61838/kman.jayps.3.2.12",
  "Ernst, J. R., Pan, S. E., & Carlson, S. M. (2024). Évaluation à distance de l'association entre la fonction exécutive précoce et les compétences mathématiques. Infant and Child Development, 33(5). https://doi.org/10.1002/icd.2534",
  "Floyd, R. G., Woods, I. L., Singh, L. J., & Hawkins, H. K. (2016). Utilisation des tests Woodcock-Johnson IV dans le diagnostic d'un handicap intellectuel. WJ IV Clinical Use and Interpretation, 271–289. https://doi.org/10.1016/b978-0-12-802076-0.00010-4",
  "Gajewski, P. D., Hanisch, E., Falkenstein, M., Thönes, S., & Wascher, E. (2018). Que mesure la tâche N-back à mesure que nous vieillissons ? Frontiers in Psychology, 9. https://doi.org/10.3389/fpsyg.2018.02208",
  "Hooper, S.R. (2013). NEPSY-II. In Encyclopedia of Autism Spectrum Disorders. Springer. https://doi.org/10.1007/978-1-4419-1698-3_353",
  "Liu, Y., Schneider, S., Orriens, B., Meijer, E., Darling, J. E., Gutsche, T., & Gatz, M. (2022). Tests Web auto-administrés de fonctions exécutives et de vitesse perceptuelle. Journal of Medical Internet Research, 24(5). https://doi.org/10.2196/34347",
  "MacDonald, R., Baker‐Ericzén, M., Roesch, S., Yeh, M., Dickson, K. S., & Smith, J. (2024). La structure latente du système Delis-Kaplan pour l'autisme. Autism Research, 17(4), 728–738. https://doi.org/10.1002/aur.3122",
  "McAuley, T., Chen, S., Goos, L., Schachar, R., & Crosbie, J. (2010). L'inventaire d'évaluation du comportement des fonctions exécutives. Journal of the International Neuropsychological Society, 16(3), 495–505. https://doi.org/10.1017/s1355617710000093",
  "McCabe, D. P., Roediger, H. L., McDaniel, M. A., Balota, D. A., & Hambrick, D. Z. (2010). La relation entre la capacité de mémoire de travail et le fonctionnement exécutif. Neuropsychology, 24(2), 222–243. https://doi.org/10.1037/a0017619",
  "Mielicki, M. K., Koppel, R. H., Valencia, G., & Wiley, J. (2018). Mesurer la capacité de mémoire de travail avec la tâche de séquençage lettres-nombres. Applied Cognitive Psychology, 32(6), 805–814. https://doi.org/10.1002/acp.3468",
  "Miyake, A., Friedman, N. P., Emerson, M. J., Witzki, A. H., Howerter, A., & Wager, T. D. (2000). L'unité et la diversité des fonctions exécutives. Cognitive Psychology, 41(1), 49–100. https://doi.org/10.1006/cogp.1999.0734",
  "Reimers, K. (2019). Évaluation des déficits cognitifs. The Clinician's Guide to Geriatric Forensic Evaluations, 65–113. https://doi.org/10.1016/b978-0-12-815034-4.00003-9",
  "Rusnáková, Š., Daniel, P., Chládek, J., Jurák, P., & Rektor, I. (2011). Les fonctions exécutives dans les lobes frontaux et temporaux. Journal of Clinical Neurophysiology, 28(1), 30–35. https://doi.org/10.1097/wnp.0b013e31820512d4",
  "Segura, I. A., & Pompéia, S. (2021). Faisabilité de l'évaluation de la performance à distance utilisant la Batterie d'évaluation des fonctions exécutives. Frontiers in Psychology, 12. https://doi.org/10.3389/fpsyg.2021.723063",
  "St Clair-Thompson, H. L., & Gathercole, S. E. (2006). Fonctions exécutives et réalisations scolaires. Quarterly Journal of Experimental Psychology, 59(4), 745–759. https://doi.org/10.1080/17470210500162854",
  "Timmeren, T. V., Daams, J. G., van Holst, R. J., & Goudriaan, A. E. (2018). Déficits de performance neurocognitive liés à la compulsivité dans le trouble du jeu. Neuroscience & Biobehavioral Reviews, 84, 204–217. https://doi.org/10.1016/j.neubiorev.2017.11.022",
  "Wahlstrom, D., Weiss, L. G., & Saklofske, D. H. (2016). Problèmes pratiques dans l'administration et le scoring du WISC-V. WISC-V Assessment and Interpretation, 25–62. https://doi.org/10.1016/b978-0-12-404697-9.00002-9",
  "Watanabe, N. (2023). Une étude empirique de soutien à la fonction exécutive dans l'éducation familiale avec l'abaque mental. Frontiers in Education, 8. https://doi.org/10.3389/feduc.2023.851093",
  "Weidacker, K., Whiteford, S., Boy, F., & Johnston, S. J. (2017). Inhibition de la réponse dans la tâche Go/No-Go paramétrique. Quarterly Journal of Experimental Psychology, 70(3), 473–487. https://doi.org/10.1080/17470218.2015.1135350",
  "Weiss, L. G., Saklofske, D. H., Holdnack, J. A., & Prifitera, A. (2016). WISC-V. WISC-V Assessment and Interpretation, 3–23. https://doi.org/10.1016/b978-0-12-404697-9.00001-7",
]

const ATTENTIONAL_REFS: string[] = [
  "Andermane, N., Bosten, J. M., Seth, A. K., & Ward, J. (2019). Individual differences in change blindness are predicted by the strength and stability of visual representations. Neuroscience of Consciousness, 2019(1). https://doi.org/10.1093/nc/niy010",
  "Angekumbura, C. D., Dilshani, T. H. T., Perera, K. T. D., Jayarathna, S. N., Kahandawarachchi, K. A. D. C. P., & Udara, S. W. I. (2022). A review of methods to detect divided attention impairments in alzheimer's disease. Procedia Computer Science, 198, 193–202. https://doi.org/10.1016/j.procs.2021.12.228",
  "Baghdadi, G., Towhidkhah, F., & Rajabi, M. (2021). Assessment methods. Neurocognitive Mechanisms of Attention, 203–250. https://doi.org/10.1016/b978-0-323-90935-8.00005-6",
  "Cardoso, M., Fulton, F., Callaghan, J. P., Johnson, M., & Albert, W. J. (2018). A pre/post evaluation of fatigue, stress and vigilance amongst commercially licensed truck drivers. International Journal of Occupational Safety and Ergonomics, 25(3), 344–354. https://doi.org/10.1080/10803548.2018.1491666",
  "Courage, M. L., Bakhtiar, A., Fitzpatrick, C., Kenny, S., & Brandeau, K. (2015). Growing up multitasking: The costs and benefits for cognitive development. Developmental Review, 35, 5–41. https://doi.org/10.1016/j.dr.2014.12.002",
  "Cristofori, I., & Levin, H. S. (2015). Traumatic brain injury and cognition. Handbook of Clinical Neurology, 579–611. https://doi.org/10.1016/b978-0-444-63521-1.00037-6",
  "DeGangi, G. A. (2017). Treatment of attentional problems. Pediatric Disorders of Regulation in Affect and Behavior, 309–360. https://doi.org/10.1016/b978-0-12-810423-1.00008-8",
  "Esmaeili Bijarsari, S. (2021). A current view on dual-task paradigms and their limitations to capture cognitive load. Frontiers in Psychology, 12. https://doi.org/10.3389/fpsyg.2021.648586",
  "Gacek, M., Smoleń, T., Krzywoszański, Ł., Bartecka-Śmietana, A., et al. (2024). Effects of school-based neurofeedback training on attention. Journal of Autism and Developmental Disorders. https://doi.org/10.1007/s10803-024-06400-8",
  "Hokken, M. J., Krabbendam, E., van der Zee, Y. J., & Kooiker, M. J. (2022). Visual selective attention and visual search performance in children with CVI, ADHD, and dyslexia. Child Neuropsychology, 29(3), 357–390. https://doi.org/10.1080/09297049.2022.2057940",
  "Hsieh, S., & Allport, A. (1994). Shifting attention in a rapid visual search paradigm. Perceptual and Motor Skills, 79(1), 315–335. https://doi.org/10.2466/pms.1994.79.1.315",
  "Huang, H., Li, R., & Zhang, J. (2023). A review of visual sustained attention: Neural mechanisms and computational models. PeerJ, 11. https://doi.org/10.7717/peerj.15351",
  "Hughes, M. M., Linck, J. A., Bowles, A. R., Koeth, J. T., & Bunting, M. F. (2013). Alternatives to switch-cost scoring in the task-switching paradigm. Behavior Research Methods, 46(3), 702–721. https://doi.org/10.3758/s13428-013-0411-5",
  "Ko, L.-W., Komarov, O., Hairston, W. D., Jung, T.-P., & Lin, C.-T. (2017). Sustained attention in real classroom settings: An EEG study. Frontiers in Human Neuroscience, 11. https://doi.org/10.3389/fnhum.2017.00388",
  "Lee, J., & Han, S. W. (2020). Visual search proceeds concurrently during the attentional blink. Attention, Perception, & Psychophysics, 82(6), 2893–2908. https://doi.org/10.3758/s13414-020-02047-6",
  "Loh, H. W., Ooi, C. P., Barua, P. D., Palmer, E. E., Molinari, F., & Acharya, U. R. (2022). Automated detection of ADHD: Current trends and future perspective. Computers in Biology and Medicine, 146, 105525. https://doi.org/10.1016/j.compbiomed.2022.105525",
  "Machner, B., Könemund, I., von der Gablentz, J., Bays, P. M., & Sprenger, A. (2018). The ipsilesional attention bias in right-hemisphere stroke patients. Neuropsychology, 32(7), 850–865. https://doi.org/10.1037/neu0000493",
  "Meyerhoff, H. S., & Papenmeier, F. (2020). Individual differences in visual attention. Behavior Research Methods, 52(6), 2556–2566. https://doi.org/10.3758/s13428-020-01413-4",
  "Migliaccio, R., Tanguy, D., Bouzigues, A., et al. (2020). Cognitive and behavioural inhibition deficits in neurodegenerative dementias. Cortex, 131, 265–283. https://doi.org/10.1016/j.cortex.2020.08.001",
  "Moncrieff, D., Jorgensen, L., & Ortmann, A. (2013). Psychophysical auditory tests. Handbook of Clinical Neurophysiology, 217–234. https://doi.org/10.1016/b978-0-7020-5310-8.00011-9",
  "Richard, A. E., & Lajiness-O'Neill, R. (2015). Visual attention shifting in autism spectrum disorders. Journal of Clinical and Experimental Neuropsychology, 37(7), 671–687. https://doi.org/10.1080/13803395.2015.1042838",
  "Song, H., & Rosenberg, M. D. (2021). Predicting attention across time and contexts with functional brain connectivity. Current Opinion in Behavioral Sciences, 40, 33–44. https://doi.org/10.1016/j.cobeha.2020.12.007",
  "Vallesi, A., Tronelli, V., Lomi, F., & Pezzetta, R. (2021). Age differences in sustained attention tasks: A meta-analysis. Psychonomic Bulletin & Review, 28(6), 1755–1775. https://doi.org/10.3758/s13423-021-01908-x",
  "van Rooijen, R., Ploeger, A., & Kret, M. E. (2017). The dot-probe task to measure emotional attention. Psychonomic Bulletin & Review, 24(6), 1686–1717. https://doi.org/10.3758/s13423-016-1224-1",
  "von Suchodoletz, A., Fäsche, A., & Skuballa, I. T. (2017). The role of attention shifting in orthographic competencies. Frontiers in Psychology, 8. https://doi.org/10.3389/fpsyg.2017.01665",
  "Zivony, A., & Lamy, D. (2021). What processes are disrupted during the attentional blink? Psychonomic Bulletin & Review, 29(2), 394–414. https://doi.org/10.3758/s13423-021-01973-2",
]

const PROCESSING_SPEED_REFS: string[] = [
  "Adam, K., & Serences, J. (2022). Interactions of sustained attention and visual search. Journal of Vision, 22(14), 4355. https://doi.org/10.1167/jov.22.14.4355",
  "Canu, D., Ioannou, C., Müller, K., et al. (2021). Visual search in neurodevelopmental disorders. European Child & Adolescent Psychiatry, 31(8), 1–18. https://doi.org/10.1007/s00787-021-01756-z",
  "Chesham, A., Gerber, S. M., Schütz, N., et al. (2019). Search and match task: Development of a taskified match-3 puzzle game. JMIR Serious Games, 7(2). https://doi.org/10.2196/13620",
  "Davis, E. T., Shikano, T., Peterson, S. A., & Keyes Michel, R. (2003). Divided attention and visual search for simple versus complex features. Vision Research, 43(21), 2213–2232. https://doi.org/10.1016/s0042-6989(03)00339-0",
  "Friedman, G. N., Johnson, L., & Williams, Z. M. (2018). Long-term visual memory and its role in learning suppression. Frontiers in Psychology, 9. https://doi.org/10.3389/fpsyg.2018.01896",
  "Halverson, T., & Hornof, A. J. (2007). A minimal model for predicting visual search in human-computer interaction. SIGCHI Conference Proceedings, 431–434. https://doi.org/10.1145/1240624.1240693",
  "Lin, W., & Qian, J. (2023). Priming effect of individual similarity and ensemble perception in Visual Search and working memory. Psychological Research, 88(3), 719–734. https://doi.org/10.1007/s00426-023-01902-z",
  "Maljkovic, V., & Martini, P. (2005). Implicit short-term memory and event frequency effects in visual search. Vision Research, 45(21), 2831–2846. https://doi.org/10.1016/j.visres.2005.05.019",
  "Mason, D. J., Humphreys, G. W., & Kent, L. S. (2003). Exploring selective attention in ADHD: Visual search through space and time. Journal of Child Psychology and Psychiatry, 44(8), 1158–1176. https://doi.org/10.1111/1469-7610.00204",
  "Nachtnebel, S. J., Cambronero-Delgadillo, A. J., Helmers, L., Ischebeck, A., & Höfler, M. (2023). The impact of different distractions on outdoor visual search and Object Memory. Scientific Reports, 13(1). https://doi.org/10.1038/s41598-023-43679-6",
  "Nasiri, E., Khalilzad, M., Hakimzadeh, Z., et al. (2023). A comprehensive review of attention tests. The Egyptian Journal of Neurology, Psychiatry and Neurosurgery, 59(1). https://doi.org/10.1186/s41983-023-00628-4",
  "Pereira, M. L., Camargo, M. von, Bellan, A. F., et al. (2020). Visual search efficiency in mild cognitive impairment and alzheimer's disease. Journal of Alzheimer's Disease, 75(1), 261–275. https://doi.org/10.3233/jad-190690",
  "Qin, X. A., Koutstaal, W., & Engel, S. A. (2014). The hard-won benefits of familiarity in visual search. Attention, Perception & Psychophysics, 76(4), 914–930. https://doi.org/10.3758/s13414-014-0623-5",
  "Radhakrishnan, A., Balakrishnan, M., Behera, S., & Raghunandhan, R. (2022). Role of reading medium and audio distractors on visual search. Journal of Optometry, 15(4), 299–304. https://doi.org/10.1016/j.optom.2021.12.004",
  "Redden, R. S., Eady, K., Klein, R. M., & Saint-Aubin, J. (2022). Individual differences in working memory capacity and visual search while reading. Memory & Cognition, 51(2), 321–335. https://doi.org/10.3758/s13421-022-01357-4",
  "Rorden, C., & Karnath, H.-O. (2010). A simple measure of neglect severity. Neuropsychologia, 48(9), 2758–2763. https://doi.org/10.1016/j.neuropsychologia.2010.04.018",
  "Ryu, H., Ju, U., & Wallraven, C. (2024). Decoding visual fatigue in a visual search task. Frontiers in Neuroscience, 18. https://doi.org/10.3389/fnins.2024.1307688",
  "Sauter, M., Stefani, M., & Mack, W. (2020). Towards interactive search: Investigating visual search in a novel real-world paradigm. Brain Sciences, 10(12), 927. https://doi.org/10.3390/brainsci10120927",
  "Souto, D., & Kerzel, D. (2021). Visual selective attention and the control of tracking eye movements: A critical review. Journal of Neurophysiology, 125(5), 1552–1576. https://doi.org/10.1152/jn.00145.2019",
  "Thielgen, M. M., Schade, S., & Bosé, C. (2021). Face processing in Police Service. Cognitive Research: Principles and Implications, 6(1). https://doi.org/10.1186/s41235-021-00317-x",
  "Vater, C., Roca, A., & Williams, A. M. (2016). Effects of anxiety on anticipation and visual search in dynamic, time-constrained situations. Sport, Exercise, and Performance Psychology, 5(3), 179–192. https://doi.org/10.1037/spy0000056",
  "Wagner, J., Zurlo, A., & Rusconi, E. (2024). Individual differences in visual search: A systematic review. Cortex, 178, 51–90. https://doi.org/10.1016/j.cortex.2024.05.020",
  "Wickens, C. D. (2023). Pilot attention and perception and spatial cognition. Human Factors in Aviation and Aerospace, 141–170. https://doi.org/10.1016/b978-0-12-420139-2.00009-5",
  "Wolfe, J. M. (2021). Guided search 6.0: An updated model of visual search. Psychonomic Bulletin & Review, 28(4), 1060–1092. https://doi.org/10.3758/s13423-020-01859-9",
]

// ─── Per-test catalogue ───────────────────────────────────────────────────────

const byTest: Record<string, TestReferenceEntry> = {
  // ── Executive functions ───────────────────────────────────────────────────
  'test-inhibition': {
    domainIntroduction: EXECUTIVE_FUNCTIONS_INTRO,
    introduction:
      "Tâche de performance continue (CPT). Description de la tâche : dans la tâche de performance continue (CPT), les participants doivent réagir correctement à des stimuli spécifiques. Par exemple, les participants sont censés appuyer sur la barre d'espace pour toutes les lettres sauf « A », ou lorsqu'ils voient ou entendent un mot ou une image spécifique. Fonctions exécutives et CPT : la CPT évalue principalement l'attention soutenue et l'inhibition des réponses car elle exige que les participants se concentrent sur un flux continu de stimuli et contrôlent / inhibent leur impulsivité de réagir à des stimuli non pertinents (Clark, 2023).",
    references: EXECUTIVE_FUNCTIONS_REFS,
  },
  'test-processing-speed': {
    domainIntroduction: EXECUTIVE_FUNCTIONS_INTRO,
    introduction:
      "Le test de vitesse de traitement mesure la rapidité avec laquelle vous identifiez et traitez l'information visuelle dans un environnement chargé en distracteurs. Plus la charge perceptive (couleurs, formes, densité) est élevée, plus la tâche met à l'épreuve l'attention sélective, la vitesse perceptive et la coordination œil-main.",
    references: PROCESSING_SPEED_REFS,
  },
  'test-cognitive-flexibility': {
    domainIntroduction: EXECUTIVE_FUNCTIONS_INTRO,
    introduction:
      "Shifting attention tasks, also known as attention shift tasks, assess our ability to switch focus between different tasks or different elements within the same task. Shifting tasks can cover a broad range of attention-shifts, requiring the participant to shift between locations, objects, object attributes, stimulus-response rules, and tasks (Wager, T. D., Jonides, J., & Reading, S., 2004). Ultimately, shifting tasks provide insights into cognitive flexibility and adaptability in various environments.",
    references: ATTENTIONAL_REFS,
  },
  'test-working-memory': {
    domainIntroduction: EXECUTIVE_FUNCTIONS_INTRO,
    introduction:
      "Tâche d'empan de chiffres (Digit Span Task). Les tâches d'empan de chiffres, c'est-à-dire la mémorisation de l'ordre de chiffres présentés, sont très utilisées en psychologie cognitive pour évaluer la capacité de mémoire. En effet, les performances des participants ne dépendent pas de facteurs parasites tels que la signification, la complexité ou la fréquence d'apparition dans la vie quotidienne. Déroulement : dans cette tâche cognitive, les participants voient ou entendent une séquence de chiffres et doivent la restituer correctement. À chaque essai, des séries de chiffres de plus en plus longues sont présentées.",
    references: EXECUTIVE_FUNCTIONS_REFS,
  },

  // ── Attentional capacities ────────────────────────────────────────────────
  'test-divided-attention': { references: ATTENTIONAL_REFS },
  'test-selective-attention': { references: ATTENTIONAL_REFS },
  'test-sustained-attention': { references: ATTENTIONAL_REFS },
  'test-trail-making': { references: ATTENTIONAL_REFS },
  'test-shifting-attention': {
    introduction:
      "Shifting attention tasks, also known as attention shift tasks, assess our ability to switch focus between different tasks or different elements within the same task. Shifting tasks can cover a broad range of attention-shifts, requiring the participant to shift between locations, objects, object attributes, stimulus-response rules, and tasks (Wager, Jonides, & Reading, 2004). Ultimately, shifting tasks provide insights into cognitive flexibility and adaptability in various environments.",
    references: ATTENTIONAL_REFS,
  },

  // ── Reasoning ─────────────────────────────────────────────────────────────
  'test-inductive-reasoning': {
    introduction:
      "Les Matrices progressives de Raven (souvent appelées simplement « matrices de Raven ») constituent un test non verbal couramment utilisé pour évaluer l'intelligence générale ainsi que le raisonnement abstrait à travers la comparaison de formes et le raisonnement par analogie. Elles sont considérées comme une estimation non verbale de l'intelligence fluide. Le test comprend 60 questions à choix multiple, présentées par ordre de difficulté croissante. Ce format vise à évaluer la capacité de raisonnement du sujet, en particulier la composante « inductive ». Les tests ont été initialement développés par John C. Raven et Lionel Penrose en 1936. Dans chaque item, le sujet doit identifier l'élément manquant qui complète un motif. De nombreux items sont présentés sous forme de matrices (6×6, 4×4, 3×3 ou 2×2), ce qui a donné son nom au test.",
    instructions:
      "Ce court test d'entraînement aux matrices progressives de Raven est conçu pour vous donner un aperçu de l'expérience réelle. Vous devrez répondre à 60 questions en 40 minutes. Comme dans le test officiel, chaque question vous demande d'identifier des motifs et des règles logiques dans une série de formes ou de symboles. Prenez le temps d'observer attentivement chaque motif, mais gardez à l'esprit que la rapidité est importante : essayez de travailler efficacement tout en restant précis. Une fois le temps écoulé, le test sera corrigé et vous pourrez consulter vos réponses. Bonne chance !",
    references: [
      "Raven, J. C., & Penrose, L. S. (1936). Mental tests used in genetic studies: The performance of related individuals on tests mainly educative and mainly reproductive. M.Sc. thesis, University of London.",
      "Raven, J. (2000). The Raven's progressive matrices: Change and stability over culture and time. Cognitive Psychology, 41(1), 1–48. https://doi.org/10.1006/cogp.1999.0735",
      "Carpenter, P. A., Just, M. A., & Shell, P. (1990). What one intelligence test measures: A theoretical account of the processing in the Raven Progressive Matrices Test. Psychological Review, 97(3), 404–431.",
    ],
  },

  // ── Spatial reasoning ─────────────────────────────────────────────────────
  'test-mental-rotation': {
    introduction:
      "Le Test de Rotation Mentale 3D (Vandenberg & Kuse, 1978) mesure la capacité à pivoter mentalement des objets tridimensionnels et à reconnaître la même figure parmi des candidates présentées à différentes orientations.",
    references: [
      "Shepard, R. N., & Metzler, J. (1971). Mental rotation of three-dimensional objects. Science, 171(3972), 701–703.",
      "Vandenberg, S. G., & Kuse, A. R. (1978). Mental rotations, a group test of three-dimensional spatial visualization. Perceptual and Motor Skills, 47(2), 599–604.",
      "Cooper, L. A. (1975). Mental rotation of random two-dimensional shapes. Cognitive Psychology, 7(1), 20–43.",
    ],
  },
  'test-mental-rotation-2d': {
    introduction:
      "Le test de Rotation Mentale 2D mesure la capacité à pivoter mentalement une figure plane et à reconnaître la version correcte parmi des candidates présentées à différentes orientations. Choisissez aussi rapidement et précisément que possible.",
    references: [
      "Cooper, L. A. (1975). Mental rotation of random two-dimensional shapes. Cognitive Psychology, 7(1), 20–43.",
      "Xiang, Z., Huang, Y., Luo, G., Ma, H., & Zhang, D. (2021). Decreased event-related desynchronization of mental rotation tasks in young Tibetan immigrants. Frontiers in Human Neuroscience, 15.",
      "Collins, D. W., & Kimura, D. (1997). A large sex difference on a two-dimensional mental rotation task. Behavioral Neuroscience, 111(4), 845–849.",
    ],
  },
  'test-spatial-transformation': {
    introduction:
      "Le Mental Cutting Test (MCT) évalue la capacité à se représenter mentalement la coupe d'un solide tridimensionnel par un plan, et à reconnaître la section parmi plusieurs candidates. Il mesure la visualisation spatiale et la transformation mentale des objets 3D.",
    references: [
      "Németh, B., Sörös, C., & Hoffmann, M. (2007). Measurement of the development of spatial ability by Mental Cutting Test. Annales Mathematicae et Informaticae.",
      "Sorby, S. A. (1999). Developing 3-D Spatial Visualization Skills. Engineering Design Graphics Journal.",
      "Hegarty, M., & Waller, D. (2004). A dissociation between mental rotation and perspective-taking spatial abilities. Intelligence, 32, 175–191.",
    ],
  },
  'test-spatial-orientation': {
    introduction:
      "Test d'orientation spatiale — développé par Mary Hegarty, Maria Kozhevnikov et David Waller, adapté par Achraf Jarhni (2026). Cette version du test a été utilisée par Hegarty et Waller (2004) et constitue une révision du test initialement utilisé par Kozhevnikov et Hegarty (2001). Imagine que tu te trouves au centre du cercle et détermine l'objet indiqué par la flèche.",
    references: [
      "Hegarty, M., & Waller, D. (2004). A dissociation between mental rotation and perspective-taking spatial abilities. Intelligence, 32, 175–191.",
      "Kozhevnikov, M., & Hegarty, M. (2001). A dissociation between object-manipulation and perspective-taking spatial abilities. Memory & Cognition, 29, 745–756.",
    ],
  },

  // ── Visual processing ─────────────────────────────────────────────────────
  'test-visuo-motor': {
    introduction:
      "Intégration visuo-motrice (Beery, 2004) : coordination entre la perception visuelle et la coordination des mouvements des doigts et de la main. Le Developmental Test of Visual-Motor Integration de Beery (1967), révisé en 1989, comporte une épreuve visuo-motrice portant sur la copie de 24 formes géométriques, dont les neuf premières constituent les formes de base élémentaires.",
    references: [
      "Beery, K. E., & Beery, N. A. (2004). The Beery-Buktenica Developmental Test of Visual-Motor Integration (5th ed.). Pearson.",
      "Beery, K. E. (1967). Developmental Test of Visual-Motor Integration. Follett Educational Corporation.",
    ],
  },
  'test-visuo-constructive': {
    introduction:
      "La WAIS-IV (Wechsler Adult Intelligence Scale) fait partie des cinq outils les plus utilisés dans le monde (Oakland & Hu, 1992). Elle évalue les compétences cognitives des jeunes de plus de 16 ans : repérage et diagnostic d'un trouble spécifique des apprentissages, haut potentiel, retard cognitif, etc. Le sous-test WAIS Puzzles permet de détecter les difficultés visuo-constructives observées dans les épreuves de construction (dessins, puzzles), dont les déficits varient selon la localisation hémisphérique de la lésion cérébrale (Warrington, James & Kinsbourne, 1996 ; Ratcliff, 1982 ; Delis, Kiefner & Fridlund, 1988).",
    references: [
      "Wechsler, D. (2008). Wechsler Adult Intelligence Scale (4th ed.). Pearson.",
      "Oakland, T., & Hu, S. (1992). The top 10 tests used with children and youth worldwide. Bulletin of the International Test Commission, 19, 99–120.",
      "Warrington, E. K., James, M., & Kinsbourne, M. (1996). Drawing disability in relation to laterality of cerebral lesion. Brain, 89, 53–82.",
    ],
  },
}

export function getTestReferences(testId: string): TestReferenceEntry | undefined {
  return byTest[testId]
}
