# Géométrie dans l'espace — Python toolkit

Modular Python package mirroring the in-app Next.js test for **Geometry in
Space (3D geometry)**. Provides parsing, scoring, Word export, and an
interactive Streamlit UI with KaTeX rendering.

## Install

```bash
pip install -r tools/geo_space/requirements.txt
```

## Run the Streamlit interface

```bash
streamlit run tools/geo_space/streamlit_app.py
```

Features:
- One question per screen
- Next / Previous / "Je ne sais pas"
- KaTeX math (auto-render via the official CDN)
- Optional shuffle of questions and answers
- Optional per-question countdown timer
- Progress bar
- Hides skill (C1/C2/C3) and truth markers from the student

## CLI

```bash
# Parse an arbitrary Word document into structured questions
python -m tools.geo_space.main --docx myinput.docx

# Generate a clean student-facing .docx (no truth markers, no skills)
python -m tools.geo_space.main --export-student out/student.docx

# Grade a JSON dictionary of answers and print a summary
python -m tools.geo_space.main --answers answers.json
```

`answers.json` format:

```json
{
  "G1-D3-Q1": {"selected": [0]},
  "G1-D3-Q2": {"selected": [0, 2]},
  "G1-D3-Q3": {"dont_know": true}
}
```

## Skills (internal only)

| Code | Description |
|------|-------------|
| C1   | Reconnaître et représenter des parties de l'espace sur le plan |
| C2   | Appréhender les cas de similarité / insimilarité plan ↔ espace |
| C3   | Utiliser les propriétés de la géométrie de l'espace dans la résolution de problèmes |

These labels are stored in the dataset and used by `scoring.summarize()` for
analytics, but are **never** shown in the student UI.

## Module layout

```
tools/geo_space/
  __init__.py
  models.py          # dataclasses
  dataset.py         # canonical Q1..Q18 + diagnostic
  docx_parser.py     # tolerant .docx parser
  docx_export.py     # student-facing Word output
  scoring.py         # grade(), summarize()
  streamlit_app.py   # UI
  main.py            # CLI
  requirements.txt
```
