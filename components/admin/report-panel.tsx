'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Users, Building, Printer } from 'lucide-react'

type ReportLevel = 'student' | 'class' | 'institution'

const reportConfig: Record<ReportLevel, { icon: React.ElementType; label: string; description: string }> = {
  student: { icon: FileText, label: 'Rapport Élève', description: 'Profil individuel complet avec scores, indicateurs comportementaux et recommandations.' },
  class: { icon: Users, label: 'Rapport Classe', description: 'Statistiques agrégées, distribution des scores et analyse des compétences Cₖ pour un groupe.' },
  institution: { icon: Building, label: 'Rapport Institution', description: "Vue d'ensemble multi-groupes avec comparaison des niveaux et tendances longitudinales." },
}

function generateStudentReportHTML(): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Rapport Élève — CogniTest</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 13px; color: #1a1a1a; max-width: 800px; margin: 0 auto; padding: 32px; }
    h1 { color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; }
    h2 { color: #1e3a8a; margin-top: 24px; font-size: 15px; }
    .header-meta { color: #64748b; font-size: 11px; margin-bottom: 24px; }
    .score-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 16px 0; }
    .score-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; }
    .score-value { font-size: 28px; font-weight: bold; color: #1e3a8a; }
    .score-label { font-size: 11px; color: #64748b; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th { text-align: left; padding: 8px; background: #f1f5f9; font-size: 12px; border-bottom: 1px solid #e2e8f0; }
    td { padding: 8px; font-size: 12px; border-bottom: 1px solid #f1f5f9; }
    .rec { border-left: 4px solid #1e3a8a; padding: 8px 12px; margin: 8px 0; background: #f8fafc; }
    .rec.student { border-color: #0d9488; }
    .rec.psycho { border-color: #7c3aed; }
    .footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 10px; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <h1>Rapport d'évaluation cognitive individuel</h1>
  <div class="header-meta">
    ENS Fès — Université Sidi Mohamed Ben Abdellah | Date : ${new Date().toLocaleDateString('fr-MA')} | Plateforme CogniTest
  </div>

  <h2>Profil de l'élève</h2>
  <table>
    <tr><th>Prénom &amp; Nom</th><td>Ahmed Benali</td><th>Niveau</th><td>Tronc Commun</td></tr>
    <tr><th>Groupe</th><td>Groupe A</td><th>Tests complétés</th><td>8 / 12</td></tr>
  </table>

  <h2>Scores globaux</h2>
  <div class="score-grid">
    <div class="score-card"><div class="score-value">74%</div><div class="score-label">Score cognitif</div></div>
    <div class="score-card"><div class="score-value">68%</div><div class="score-label">Score mathématique</div></div>
    <div class="score-card"><div class="score-value">Normal</div><div class="score-label">Profil comportemental</div></div>
  </div>

  <h2>Scores par domaine cognitif</h2>
  <table>
    <tr><th>Domaine</th><th>Score</th><th>Interprétation</th></tr>
    <tr><td>Attention</td><td>72%</td><td>Dans la norme</td></tr>
    <tr><td>Raisonnement</td><td>68%</td><td>Dans la norme</td></tr>
    <tr><td>Traitement spatial</td><td>78%</td><td>Bon niveau</td></tr>
    <tr><td>Traitement visuel</td><td>75%</td><td>Bon niveau</td></tr>
    <tr><td>Mémoire de travail</td><td>70%</td><td>Dans la norme</td></tr>
    <tr><td>Fonctions exécutives</td><td>74%</td><td>Dans la norme</td></tr>
  </table>

  <h2>Compétences mathématiques Cₖ</h2>
  <table>
    <tr><th>Code</th><th>Compétence</th><th>Score</th></tr>
    <tr><td>C1</td><td>Vecteurs</td><td>70%</td></tr>
    <tr><td>C2</td><td>Symétrie et transformations</td><td>65%</td></tr>
    <tr><td>C3</td><td>Produit scalaire</td><td>68%</td></tr>
    <tr><td>C4</td><td>Trigonométrie</td><td>72%</td></tr>
    <tr><td>C5</td><td>Droite dans le plan</td><td>69%</td></tr>
  </table>

  <h2>Recommandations</h2>
  <div class="rec"><strong>Enseignant :</strong> Consolider les bases géométriques (C1–C2) avec des supports visuels adaptés. Le bon niveau spatial de l'élève peut être mis à profit.</div>
  <div class="rec student"><strong>Élève :</strong> Pratiquer régulièrement les exercices de produit scalaire (C3) et de trigonométrie (C4) avec des méthodes de répétition espacée.</div>
  <div class="rec psycho"><strong>Psychologue :</strong> Profil attentionnel normal. Maintenir un environnement de travail structuré et sans surcharge cognitive lors des évaluations.</div>

  <div class="footer">
    Document généré par CogniTest — plateforme de recherche doctorale | ENS Fès | Données anonymisées — usage interne uniquement
  </div>
</body>
</html>`
}

function generateClassReportHTML(): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Rapport de Classe — CogniTest</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 13px; color: #1a1a1a; max-width: 800px; margin: 0 auto; padding: 32px; }
    h1 { color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; }
    h2 { color: #1e3a8a; margin-top: 24px; font-size: 15px; }
    .header-meta { color: #64748b; font-size: 11px; margin-bottom: 24px; }
    .stat-row { display: flex; gap: 16px; margin: 16px 0; flex-wrap: wrap; }
    .stat { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 20px; text-align: center; }
    .stat-value { font-size: 24px; font-weight: bold; color: #1e3a8a; }
    .stat-label { font-size: 11px; color: #64748b; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th { text-align: left; padding: 8px; background: #f1f5f9; font-size: 12px; border-bottom: 1px solid #e2e8f0; }
    td { padding: 8px; font-size: 12px; border-bottom: 1px solid #f1f5f9; }
    .footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 10px; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <h1>Rapport de classe — Résultats agrégés</h1>
  <div class="header-meta">
    ENS Fès | Groupe A — Tronc Commun | Date : ${new Date().toLocaleDateString('fr-MA')} | CogniTest
  </div>

  <h2>Statistiques globales</h2>
  <div class="stat-row">
    <div class="stat"><div class="stat-value">5</div><div class="stat-label">Élèves</div></div>
    <div class="stat"><div class="stat-value">73.8%</div><div class="stat-label">Moy. cognitive</div></div>
    <div class="stat"><div class="stat-value">71.8%</div><div class="stat-label">Moy. math</div></div>
    <div class="stat"><div class="stat-value">8</div><div class="stat-label">Tests moy./élève</div></div>
  </div>

  <h2>Moyennes par domaine cognitif</h2>
  <table>
    <tr><th>Domaine</th><th>Moyenne</th><th>Min</th><th>Max</th></tr>
    <tr><td>Attention</td><td>71.6%</td><td>62%</td><td>80%</td></tr>
    <tr><td>Raisonnement</td><td>72.6%</td><td>60%</td><td>85%</td></tr>
    <tr><td>Spatial</td><td>75.0%</td><td>65%</td><td>82%</td></tr>
    <tr><td>Traitement visuel</td><td>75.0%</td><td>68%</td><td>84%</td></tr>
    <tr><td>Mémoire de travail</td><td>71.2%</td><td>63%</td><td>79%</td></tr>
    <tr><td>Fonctions exécutives</td><td>74.2%</td><td>67%</td><td>81%</td></tr>
  </table>

  <h2>Compétences mathématiques Cₖ — Tronc Commun</h2>
  <table>
    <tr><th>Cₖ</th><th>Compétence</th><th>Moyenne classe</th></tr>
    <tr><td>C1</td><td>Vecteurs</td><td>68%</td></tr>
    <tr><td>C2</td><td>Symétrie et transformations</td><td>71%</td></tr>
    <tr><td>C3</td><td>Produit scalaire</td><td>65%</td></tr>
    <tr><td>C4</td><td>Trigonométrie</td><td>74%</td></tr>
    <tr><td>C5</td><td>Droite dans le plan</td><td>69%</td></tr>
  </table>

  <div class="footer">
    CogniTest — ENS Fès | Données anonymisées — usage pédagogique et scientifique uniquement
  </div>
</body>
</html>`
}

function generateInstitutionReportHTML(): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Rapport Institution — CogniTest</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 13px; color: #1a1a1a; max-width: 800px; margin: 0 auto; padding: 32px; }
    h1 { color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; }
    h2 { color: #1e3a8a; margin-top: 24px; font-size: 15px; }
    .header-meta { color: #64748b; font-size: 11px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th { text-align: left; padding: 8px; background: #f1f5f9; font-size: 12px; border-bottom: 1px solid #e2e8f0; }
    td { padding: 8px; font-size: 12px; border-bottom: 1px solid #f1f5f9; }
    .footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 10px; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <h1>Rapport institution — Vue d'ensemble</h1>
  <div class="header-meta">
    ENS Fès — Université Sidi Mohamed Ben Abdellah | Date : ${new Date().toLocaleDateString('fr-MA')} | CogniTest
  </div>

  <h2>Synthèse multi-groupes</h2>
  <table>
    <tr><th>Groupe</th><th>Niveau</th><th>Effectif</th><th>Moy. cognitive</th><th>Moy. math</th></tr>
    <tr><td>Groupe A</td><td>Tronc Commun</td><td>24</td><td>73.8%</td><td>71.8%</td></tr>
    <tr><td>Groupe B</td><td>1ère Bac Sciences</td><td>28</td><td>71.5%</td><td>69.0%</td></tr>
  </table>

  <h2>Tendances par compétence Cₖ</h2>
  <table>
    <tr><th>Cₖ</th><th>Compétence</th><th>Groupe A</th><th>Groupe B</th><th>Écart</th></tr>
    <tr><td>C1</td><td>Vecteurs</td><td>68%</td><td>65%</td><td>−3</td></tr>
    <tr><td>C2</td><td>Symétrie</td><td>71%</td><td>68%</td><td>−3</td></tr>
    <tr><td>C3</td><td>Produit scalaire (TC)</td><td>65%</td><td>—</td><td>—</td></tr>
    <tr><td>C6</td><td>Produit scalaire (1ère Bac)</td><td>—</td><td>62%</td><td>—</td></tr>
  </table>

  <div class="footer">
    CogniTest — ENS Fès | Rapport de recherche — diffusion interne uniquement
  </div>
</body>
</html>`
}

const generators: Record<ReportLevel, () => string> = {
  student: generateStudentReportHTML,
  class: generateClassReportHTML,
  institution: generateInstitutionReportHTML,
}

export function ReportPanel() {
  const [level, setLevel] = useState<ReportLevel>('student')

  const handlePrint = () => {
    const html = generators[level]()
    const w = window.open('', '_blank', 'width=900,height=700')
    if (!w) return
    w.document.write(html)
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 400)
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Générez des rapports structurés à trois niveaux. Les rapports s'ouvrent dans un nouvel onglet
        et peuvent être imprimés ou enregistrés en PDF via le navigateur.
      </p>

      {/* Level selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(Object.entries(reportConfig) as [ReportLevel, typeof reportConfig[ReportLevel]][]).map(([key, cfg]) => {
          const Icon = cfg.icon
          const active = level === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => setLevel(key)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
              }`}
            >
              <Icon className={`w-6 h-6 mb-2 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className={`text-sm font-semibold ${active ? 'text-primary' : 'text-foreground'}`}>{cfg.label}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{cfg.description}</p>
            </button>
          )
        })}
      </div>

      {/* Preview info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{reportConfig[level].label}</CardTitle>
          <CardDescription>{reportConfig[level].description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground mb-4">
            <p>Ce rapport inclut :</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              {level === 'student' && (
                <>
                  <li>Profil identitaire et académique</li>
                  <li>Scores cognitifs par domaine (6 domaines)</li>
                  <li>Scores mathématiques par compétence Cₖ</li>
                  <li>Indicateurs comportementaux</li>
                  <li>Recommandations tripartites (enseignant / élève / psychologue)</li>
                </>
              )}
              {level === 'class' && (
                <>
                  <li>Statistiques descriptives (moyenne, min, max, écart-type)</li>
                  <li>Moyennes par domaine cognitif</li>
                  <li>Moyennes mathématiques par compétence Cₖ</li>
                  <li>Distribution des profils comportementaux</li>
                </>
              )}
              {level === 'institution' && (
                <>
                  <li>Comparaison multi-groupes et multi-niveaux</li>
                  <li>Tendances par compétence Cₖ</li>
                  <li>Synthèse institutionnelle anonymisée</li>
                  <li>Recommandations pédagogiques globales</li>
                </>
              )}
            </ul>
          </div>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" />
            Générer le rapport
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
