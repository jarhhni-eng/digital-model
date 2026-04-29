# Produit scalaire & Géométrie analytique — Évaluation

Boîte à outils Python pour administrer et noter une évaluation de 27 questions
sur le produit scalaire et la géométrie analytique (1ère Bac · Sciences).

## Structure

| Fichier | Rôle |
|---|---|
| `models.py` | Dataclasses `Question`, `Choice`, `StudentAnswer`, `GradedAnswer`, dictionnaires `LESSONS`, `SKILLS`, `QUESTION_TYPES` |
| `dataset.py` | Banque des 27 questions (Partie I cours, Partie II visualisation, Partie III raisonnement) |
| `scoring.py` | Notation multi-correct (1.0 / 0.5 partiel / 0.0) et agrégats par type / leçon / compétence |
| `renderer.py` | Génération HTML pour la vue élève et la vue enseignant (LaTeX rendu via MathJax) |
| `streamlit_app.py` | Interface interactive (KaTeX intégré, layout scindé pour la Partie II) |
| `main.py` | CLI : génération HTML + notation à partir d'un fichier `answers.json` |
| `docx_parser.py` | Parseur tolérant pour importer un sujet `.docx` |

## Code des questions

`T{type}-D{leçon}-Q{n}`

- **Type** : `1` cours · `2` construction / visualisation · `3` raisonnement
- **Leçon** : `1` Produit scalaire · `2` Géométrie analytique
- **n** : numéro original (1 → 27)

## Compétences (taxonomie interne)

| Code | Libellé |
|---|---|
| C1 | Connaître la définition et les propriétés du produit scalaire |
| C2 | Lire et calculer dans un repère / visualisation |
| C3 | Théorèmes (Al-Kashi, médiane) et raisonnement métrique |
| C4 | Cercles : équations, centre et rayon |
| C5 | Géométrie analytique : droites, distances, projections |
| C6 | Angles, cosinus et applications |

## Lancement

```bash
# 1. Dépendances
pip install -r tools/produit_scalaire/requirements.txt

# 2. Interface interactive (recommandé)
streamlit run tools/produit_scalaire/streamlit_app.py

# 3. Générer les vues HTML statiques + noter un fichier de réponses
python -m tools.produit_scalaire.main \
    --answers path/to/answers.json \
    --out tools/produit_scalaire/output
```

## Format `answers.json`

Trois formats acceptés (mélange autorisé) :

```jsonc
{
  "T1-D1-Q2":  ["A", "C"],                                 // multi-réponse
  "T1-D1-Q3":  "A",                                         // mono-réponse
  "T2-D1-Q10": { "selected": [], "free_text": "…", "dont_know": false }
}
```

## Figures (Partie II)

Les questions Q10 et Q11 référencent des figures à déposer dans :

```
tools/produit_scalaire/figures/q10_points.png
tools/produit_scalaire/figures/q11_vectors.png
```

Si une figure est manquante, l'interface affiche un message indicatif sans
empêcher la passation.

## Règles de notation

- **Multi-correct** : 1.0 si l'ensemble des lettres choisies = ensemble correct ;
  0.5 si sous-ensemble strict du correct (sans lettre erronée) ; 0.0 sinon.
- **Mono-correct** : 1.0 ou 0.0.
- **« Je ne sais pas »** ou absence de réponse → 0.0.
- **Q1** est diagnostique : exclue du score et des stats.
- **Items ouverts** (Q10, Q11, Q17, Q18, Q19, Q24) : exclus de la notation
  automatique et listés pour correction manuelle dans la vue enseignant.

## LaTeX

L'app Streamlit s'appuie sur KaTeX (intégré). Les vues HTML utilisent MathJax
(CDN). Les délimiteurs `$...$` et `\(...\)` sont tous deux supportés.
