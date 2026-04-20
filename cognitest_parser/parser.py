#!/usr/bin/env python3
"""
CogniTest — Word MCQ Parser
============================
Reads a structured .docx file containing MCQ geometry questions and generates:
  1. student_exam.html   — clean exam for students (no C-labels, no answer keys)
  2. teacher_report.html — full analysis version with competencies and correct answers
  3. questions_data.json — machine-readable export for statistical models

Usage:
    python parser.py questions.docx

Requirements:
    pip install python-docx
"""

import re
import json
import sys
import base64
from pathlib import Path
from dataclasses import dataclass, field
from typing import Optional

try:
    from docx import Document
    from docx.oxml.ns import qn
    import docx.text.paragraph
    import docx.table
except ImportError:
    print("[ERROR] python-docx is not installed. Run: pip install python-docx")
    sys.exit(1)


# ─────────────────────────────────────────────────────────────────────────────
# Data structures
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class Answer:
    text: str
    is_correct: bool          # True = correct, False = incorrect


@dataclass
class Question:
    original_code: str        # original label in doc: "Q1", "Q2" …
    auto_code: str            # T[type]-D[lesson]-Q[n], e.g. "T1-D1-Q2"
    question_type: int        # 1 = cours, 2 = construction, 3 = raisonnement
    type_label: str           # human-readable type name
    lesson_num: int
    lesson_title: str
    competency: Optional[str] # "C1"–"C6" or None
    text: str
    answers: list             # list[Answer]
    image_name: Optional[str] = None   # e.g. "repere.jpg"
    image_b64: Optional[str] = None    # base64-encoded image bytes (if found)


# ─────────────────────────────────────────────────────────────────────────────
# Constants & compiled patterns
# ─────────────────────────────────────────────────────────────────────────────

TYPE_LABELS = {
    1: "Questions du cours",
    2: "Questions de la construction",
    3: "Questions de raisonnement",
}

# Images attached to specific questions (per user specification)
QUESTION_IMAGES: dict[str, str] = {
    **{f"Q{i}": "repere.jpg" for i in range(9, 17)},
    "Q4": "mediane.jpg",
    "Q5": "mediane.jpg",
}

# Text tokens that mean "correct"
CORRECT_TOKENS = {"true", "vrai", "correct", "juste"}

# Text tokens that mean "incorrect"
INCORRECT_TOKENS = {"false", "faux", "incorrect"}

# Text tokens that mean "skip this option entirely" (e.g. "J'ai oublié")
SKIP_TOKENS = {"j'ai tout oublié", "j'ai oublié", "j ai tout oublie", "j ai oublie"}

# Section-type detection patterns (case-insensitive)
TYPE_PATTERNS = {
    1: re.compile(r"questions?\s+du\s+cours", re.IGNORECASE),
    2: re.compile(r"questions?\s+de\s+la\s+construction", re.IGNORECASE),
    3: re.compile(r"questions?\s+de\s+raisonnement", re.IGNORECASE),
}

# Lesson heading: "1. Mémorisation : prérequis   1BAC SM"
LESSON_PATTERN = re.compile(
    r"^(\d+)\s*[.)]\s*(.+?)(?:\s*[：:]\s*.+?)?(?:\s+\d+BAC.*)?$",
    re.IGNORECASE,
)

# Question code at start of text: "Q3 :" or "Q3."
Q_CODE_RE = re.compile(r"^Q(\d+)\s*[.:]\s*", re.IGNORECASE)

# Competency code embedded anywhere in text: "C1", "C2" … "C6"
COMPETENCY_RE = re.compile(r"\bC([1-6])\b")

# Colors used per type in the UI
TYPE_COLORS = {1: "#3b82f6", 2: "#10b981", 3: "#f59e0b"}
COMP_COLORS = {"C1": "#3b82f6", "C2": "#10b981", "C3": "#f59e0b",
               "C4": "#ec4899", "C5": "#8b5cf6", "C6": "#f97316"}


# ─────────────────────────────────────────────────────────────────────────────
# Utility helpers
# ─────────────────────────────────────────────────────────────────────────────

def clean(text: str) -> str:
    """Collapse whitespace and strip."""
    return re.sub(r"\s+", " ", text or "").strip()


def classify_label(raw: str) -> Optional[bool]:
    """
    Classify an answer label:
      True  → correct answer
      False → incorrect answer
      None  → skip this option ("J'ai oublié" etc.)
    """
    token = raw.lower().strip(" .\n\t")
    if token in CORRECT_TOKENS:
        return True
    if token in INCORRECT_TOKENS:
        return False
    if any(skip in token for skip in SKIP_TOKENS):
        return None
    # No label found → treat as incorrect
    return False


def extract_competency(text: str) -> tuple[Optional[str], str]:
    """
    Pull out the first Cₖ code from `text`.
    Returns (code_or_None, cleaned_text_without_code).
    """
    m = COMPETENCY_RE.search(text)
    if m:
        code = f"C{m.group(1)}"
        cleaned = COMPETENCY_RE.sub("", text, count=1).strip(" :")
        return code, clean(cleaned)
    return None, clean(text)


def dedupe_cells(cells) -> list:
    """
    python-docx repeats merged cells; deduplicate by internal XML element id.
    """
    seen = set()
    result = []
    for cell in cells:
        cid = id(cell._tc)
        if cid not in seen:
            seen.add(cid)
            result.append(cell)
    return result


def load_embedded_images(doc: Document) -> dict[str, bytes]:
    """Extract all images embedded in the docx and return {filename: bytes}."""
    images: dict[str, bytes] = {}
    for rel in doc.part.rels.values():
        if "image" in rel.reltype:
            part = rel.target_part
            name = Path(part.partname).name
            images[name] = part.blob
    return images


def image_to_b64(img_name: str, embedded: dict[str, bytes]) -> Optional[str]:
    """Return base64 string for an image (from embedded dict or disk)."""
    if img_name in embedded:
        return base64.b64encode(embedded[img_name]).decode()
    path = Path(img_name)
    if path.exists():
        return base64.b64encode(path.read_bytes()).decode()
    return None


# ─────────────────────────────────────────────────────────────────────────────
# Table question parser
# ─────────────────────────────────────────────────────────────────────────────

def parse_table(table, q_type: int, lesson_num: int, lesson_title: str,
                embedded_images: dict, q_global_counter: int) -> Optional[Question]:
    """
    Parse one Word table as a single MCQ question.

    Expected table layouts
    ──────────────────────
    Layout A (3 rows):
      Row 0  │ Question text (merged cells)
      Row 1  │ Opt A  │ Opt B  │ Opt C  │ Opt D
      Row 2  │ true   │ false  │ True   │ (empty)

    Layout B (2 rows, options + labels alternated in same row):
      Row 0  │ Question text
      Row 1  │ Opt A │ true │ Opt B │ false │ Opt C │ True │ Opt D │

    Layout C (many rows, each option on its own row pair):
      Row 0  │ Question text
      Row 1  │ Opt A  (next cell) label
      Row 2  │ Opt B  (next cell) label
      …
    """
    rows = table.rows
    if not rows:
        return None

    # ── Row 0: question text ──────────────────────────────────────────────
    first_row_text = " ".join(clean(c.text) for c in dedupe_cells(rows[0].cells) if c.text.strip())
    if not first_row_text:
        return None

    # Extract Q-code
    m = Q_CODE_RE.match(first_row_text)
    if m:
        original_code = f"Q{m.group(1)}"
        raw_q_text = first_row_text[m.end():]
    else:
        original_code = f"Q{q_global_counter}"
        raw_q_text = first_row_text

    competency, q_text = extract_competency(raw_q_text)

    # ── Answer rows ───────────────────────────────────────────────────────
    answers: list[Answer] = []

    if len(rows) >= 3:
        # Layout A: separate option row and label row
        opt_cells  = dedupe_cells(rows[1].cells)
        lbl_cells  = dedupe_cells(rows[2].cells)
        for i, opt_c in enumerate(opt_cells):
            opt_text = clean(opt_c.text)
            if not opt_text:
                continue
            lbl_text = clean(lbl_cells[i].text) if i < len(lbl_cells) else ""
            verdict = classify_label(lbl_text)
            if verdict is None:
                continue   # skip "J'ai oublié"
            answers.append(Answer(text=opt_text, is_correct=verdict))

    elif len(rows) == 2:
        cells = dedupe_cells(rows[1].cells)
        if len(cells) >= 4:
            # Layout A with 2 rows: options in cols 0,1,2,3 — look for labels in same cells
            # (some docs put label below option text within the same cell)
            for cell in cells:
                lines = [l.strip() for l in cell.text.splitlines() if l.strip()]
                if not lines:
                    continue
                opt_text = lines[0]
                lbl_text = lines[1] if len(lines) > 1 else ""
                verdict = classify_label(lbl_text)
                if verdict is None:
                    continue
                answers.append(Answer(text=opt_text, is_correct=verdict))
        else:
            # Layout B: alternating opt / label in row 1
            it = iter(cells)
            for opt_c in it:
                opt_text = clean(opt_c.text)
                if not opt_text:
                    continue
                try:
                    lbl_c = next(it)
                    lbl_text = clean(lbl_c.text)
                except StopIteration:
                    lbl_text = ""
                verdict = classify_label(lbl_text)
                if verdict is None:
                    continue
                answers.append(Answer(text=opt_text, is_correct=verdict))

    # Fallback: look inside every remaining row for option + label pairs
    if not answers and len(rows) > 1:
        for row in rows[1:]:
            cells = dedupe_cells(row.cells)
            for cell in cells:
                lines = [l.strip() for l in cell.text.splitlines() if l.strip()]
                if len(lines) >= 2:
                    opt_text, lbl_text = lines[0], lines[1]
                elif len(lines) == 1:
                    opt_text, lbl_text = lines[0], ""
                else:
                    continue
                verdict = classify_label(lbl_text)
                if verdict is None:
                    continue
                answers.append(Answer(text=opt_text, is_correct=verdict))

    if not answers:
        return None   # table doesn't look like a question

    # ── Image ─────────────────────────────────────────────────────────────
    image_name = QUESTION_IMAGES.get(original_code)
    image_b64 = image_to_b64(image_name, embedded_images) if image_name else None

    # ── Auto-code ─────────────────────────────────────────────────────────
    auto_code = f"T{q_type}-D{lesson_num}-{original_code}"

    return Question(
        original_code=original_code,
        auto_code=auto_code,
        question_type=q_type,
        type_label=TYPE_LABELS[q_type],
        lesson_num=lesson_num,
        lesson_title=lesson_title,
        competency=competency,
        text=q_text,
        answers=answers,
        image_name=image_name,
        image_b64=image_b64,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Main document parser
# ─────────────────────────────────────────────────────────────────────────────

def parse_document(docx_path: str) -> list:
    """
    Walk the Word document body in order (paragraphs + tables).
    Returns an ordered list of Question objects.
    """
    doc = Document(docx_path)
    embedded_images = load_embedded_images(doc)

    questions: list[Question] = []
    current_type = 1
    current_lesson_num = 1
    current_lesson_title = "Prérequis"
    q_counter = 0

    body = doc.element.body

    for child in body:
        local = child.tag.split("}")[-1]   # "p" or "tbl"

        if local == "p":
            para = docx.text.paragraph.Paragraph(child, doc)
            text = clean(para.text)
            if not text:
                continue

            # Detect question-type heading
            for t_num, pat in TYPE_PATTERNS.items():
                if pat.search(text):
                    current_type = t_num
                    break

            # Detect lesson heading  "1. Mémorisation : prérequis   1BAC SM"
            m = LESSON_PATTERN.match(text)
            if m and not Q_CODE_RE.match(text):
                current_lesson_num = int(m.group(1))
                current_lesson_title = clean(m.group(2))

        elif local == "tbl":
            q_counter += 1
            table = docx.table.Table(child, doc)
            q = parse_table(
                table, current_type, current_lesson_num, current_lesson_title,
                embedded_images, q_counter,
            )
            if q:
                questions.append(q)

    return questions


# ─────────────────────────────────────────────────────────────────────────────
# Student HTML generator
# ─────────────────────────────────────────────────────────────────────────────

def build_student_html(questions: list) -> str:
    """
    Clean student exam:
    - One card per question
    - Shows question text, optional image, 4 answer buttons
    - Hides C-labels and correct/incorrect markers completely
    - Adds "Je ne sais pas" option (= 0 points)
    """

    def option_letter(i: int) -> str:
        return chr(65 + i)   # A, B, C, D

    cards = []
    q_meta = []

    for idx, q in enumerate(questions):
        display = "block" if idx == 0 else "none"

        # Image block
        if q.image_b64:
            ext = Path(q.image_name).suffix.lstrip(".") if q.image_name else "jpg"
            img_tag = (f'<div class="q-img">'
                       f'<img src="data:image/{ext};base64,{q.image_b64}" alt="{q.image_name}">'
                       f'</div>')
        elif q.image_name:
            img_tag = (f'<div class="q-img">'
                       f'<img src="{q.image_name}" alt="{q.image_name}">'
                       f'</div>')
        else:
            img_tag = ""

        # Answer options (no correctness shown)
        opts_html = ""
        for j, ans in enumerate(q.answers):
            letter = option_letter(j)
            opts_html += f"""
        <button class="opt" onclick="pick({idx},{j},this)" data-q="{idx}" data-opt="{j}">
          <span class="opt-letter">{letter}</span>
          <span class="opt-text">{ans.text}</span>
        </button>"""

        # "Je ne sais pas" button
        opts_html += f"""
        <button class="opt opt-skip" onclick="pick({idx},-1,this)" data-q="{idx}" data-opt="-1">
          <span class="opt-letter">?</span>
          <span class="opt-text" style="color:#94a3b8">Je ne sais pas</span>
        </button>"""

        cards.append(f"""
  <div class="q-card" id="card-{idx}" style="display:{display}">
    <div class="q-header">
      <span class="q-badge">{q.auto_code}</span>
      <span class="q-count">Question {idx+1} / {len(questions)}</span>
    </div>
    <p class="q-text">{q.text}</p>
    {img_tag}
    <div class="opts">{opts_html}
    </div>
  </div>""")

        q_meta.append({"idx": idx, "code": q.auto_code, "n_opts": len(q.answers)})

    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Évaluation — Cognition et apprentissage de la géométrie</title>
<style>
*{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:'Segoe UI',sans-serif;background:#f1f5f9;color:#1e293b;min-height:100vh}}
.shell{{max-width:720px;margin:0 auto;padding:24px 16px 80px}}
/* progress */
.prog-wrap{{margin-bottom:20px}}
.prog-track{{height:6px;background:#e2e8f0;border-radius:3px}}
.prog-fill{{height:100%;background:#6366f1;border-radius:3px;transition:width .35s}}
.prog-label{{font-size:12px;color:#64748b;text-align:right;margin-top:5px}}
/* card */
.q-card{{background:#fff;border-radius:14px;box-shadow:0 2px 14px rgba(0,0,0,.07);
  padding:28px 24px;border-left:5px solid #6366f1;animation:fadeIn .3s}}
@keyframes fadeIn{{from{{opacity:0;transform:translateY(8px)}}to{{opacity:1;transform:none}}}}
.q-header{{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}}
.q-badge{{background:#6366f1;color:#fff;font-weight:700;font-size:12px;
  padding:4px 10px;border-radius:6px;letter-spacing:.4px}}
.q-count{{font-size:12px;color:#94a3b8}}
.q-text{{font-size:16px;font-weight:500;line-height:1.7;margin-bottom:18px}}
.q-img{{text-align:center;margin-bottom:18px}}
.q-img img{{max-width:100%;border-radius:10px;border:1px solid #e2e8f0;box-shadow:0 1px 6px rgba(0,0,0,.06)}}
/* options */
.opts{{display:flex;flex-direction:column;gap:10px}}
.opt{{display:flex;align-items:flex-start;gap:14px;padding:13px 16px;border-radius:10px;
  border:2px solid #e2e8f0;background:#fff;cursor:pointer;text-align:left;
  font-size:14px;transition:border-color .15s,background .15s;width:100%}}
.opt:hover{{border-color:#a5b4fc;background:#f5f3ff}}
.opt.selected{{border-color:#6366f1;background:#eef2ff}}
.opt-skip{{border-style:dashed}}
.opt-letter{{min-width:26px;height:26px;border-radius:50%;background:#f1f5f9;
  color:#64748b;font-weight:700;font-size:12px;display:flex;align-items:center;
  justify-content:center;flex-shrink:0;transition:background .15s}}
.opt.selected .opt-letter{{background:#6366f1;color:#fff}}
.opt-text{{line-height:1.5}}
/* nav */
.nav{{position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #e2e8f0;
  padding:12px 24px;display:flex;justify-content:space-between;align-items:center;z-index:10}}
.btn{{padding:10px 26px;border-radius:8px;border:none;cursor:pointer;font-weight:600;font-size:14px}}
.btn-prev{{background:#f1f5f9;color:#475569}}
.btn-next{{background:#6366f1;color:#fff}}
.btn-submit{{background:#16a34a;color:#fff;display:none}}
</style>
</head>
<body>
<div class="shell">
  <div class="prog-wrap">
    <div class="prog-track"><div class="prog-fill" id="prog" style="width:{round(1/len(questions)*100)}%"></div></div>
    <div class="prog-label" id="prog-lbl">Question 1 / {len(questions)}</div>
  </div>
{''.join(cards)}
</div>

<div class="nav">
  <button class="btn btn-prev" id="btn-prev" onclick="go(-1)" disabled>◀ Précédent</button>
  <button class="btn btn-next" id="btn-next" onclick="go(1)">Suivant ▶</button>
  <button class="btn btn-submit" id="btn-submit" onclick="submit()">Soumettre ✓</button>
</div>

<script>
const TOTAL = {len(questions)};
let cur = 0;
const answers = {{}};

function pick(qIdx, optIdx, btn) {{
  const card = document.getElementById('card-' + qIdx);
  card.querySelectorAll('.opt').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  answers[qIdx] = optIdx;
}}

function go(dir) {{
  document.getElementById('card-' + cur).style.display = 'none';
  cur = Math.max(0, Math.min(TOTAL - 1, cur + dir));
  document.getElementById('card-' + cur).style.display = 'block';
  document.getElementById('prog').style.width = Math.round((cur + 1) / TOTAL * 100) + '%';
  document.getElementById('prog-lbl').textContent = 'Question ' + (cur + 1) + ' / ' + TOTAL;
  document.getElementById('btn-prev').disabled = cur === 0;
  document.getElementById('btn-next').style.display = cur < TOTAL - 1 ? 'inline-block' : 'none';
  document.getElementById('btn-submit').style.display = cur === TOTAL - 1 ? 'inline-block' : 'none';
}}

function submit() {{
  const payload = JSON.stringify({{timestamp: new Date().toISOString(), answers}});
  console.log('SUBMIT', payload);
  // In production: POST to your API endpoint
  alert('Réponses enregistrées avec succès.');
}}

// Init state
document.getElementById('btn-next').style.display = TOTAL > 1 ? 'inline-block' : 'none';
document.getElementById('btn-submit').style.display = TOTAL === 1 ? 'inline-block' : 'none';
</script>
</body></html>"""


# ─────────────────────────────────────────────────────────────────────────────
# Teacher HTML generator
# ─────────────────────────────────────────────────────────────────────────────

def _badge(color: str, text: str) -> str:
    return (f'<span style="background:{color}22;color:{color};border:1px solid {color}44;'
            f'padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700">{text}</span>')


def build_teacher_html(questions: list) -> str:
    """
    Teacher / analysis version:
    - Full question table with correct answers highlighted
    - Statistics by type, lesson, and competency
    - Scoring rules summary
    """

    # ── Aggregate stats ───────────────────────────────────────────────────
    by_type: dict[int, list] = {}
    by_lesson: dict[int, list] = {}
    by_comp: dict[str, list] = {}

    for q in questions:
        by_type.setdefault(q.question_type, []).append(q)
        by_lesson.setdefault(q.lesson_num, []).append(q)
        key = q.competency or "—"
        by_comp.setdefault(key, []).append(q)

    def stat_table(rows_html: str) -> str:
        return (f'<table style="width:100%;border-collapse:collapse;font-size:13px">'
                f'{rows_html}</table>')

    def stat_row(label: str, count: int, color: str = "#6366f1") -> str:
        return (f'<tr><td style="padding:5px 0;border-bottom:1px solid #f1f5f9">{label}</td>'
                f'<td style="text-align:right;font-weight:700;color:{color}">{count}</td></tr>')

    type_rows = "".join(
        stat_row(TYPE_LABELS[t], len(qs), TYPE_COLORS.get(t, "#6366f1"))
        for t, qs in sorted(by_type.items())
    )
    lesson_rows = "".join(
        stat_row(f"Leçon {ln} — {qs[0].lesson_title}", len(qs))
        for ln, qs in sorted(by_lesson.items())
    )
    comp_rows = "".join(
        stat_row(c, len(qs), COMP_COLORS.get(c, "#64748b"))
        for c, qs in sorted(by_comp.items())
    )

    # ── Question rows ─────────────────────────────────────────────────────
    q_rows = ""
    for q in questions:
        correct_opts = [a.text for a in q.answers if a.is_correct]
        correct_html = " &nbsp;|&nbsp; ".join(
            f'<span style="color:#16a34a;font-weight:600">{t}</span>'
            for t in correct_opts
        ) or "<em style='color:#94a3b8'>Aucune</em>"

        all_opts_html = ""
        for j, ans in enumerate(q.answers):
            color = "#16a34a" if ans.is_correct else "#dc2626"
            icon = "✓" if ans.is_correct else "✗"
            all_opts_html += (
                f'<div style="font-size:12px;padding:2px 0;color:{color}">'
                f'{icon} {ans.text}</div>'
            )

        comp_badge = _badge(COMP_COLORS.get(q.competency or "", "#64748b"), q.competency or "—") if q.competency else "—"
        type_badge = _badge(TYPE_COLORS.get(q.question_type, "#6366f1"), q.type_label)
        img_cell = (f'<img src="{q.image_name}" style="max-height:50px;border-radius:4px;'
                    f'border:1px solid #e2e8f0">'
                    if q.image_name else "—")

        q_rows += f"""
<tr>
  <td style="white-space:nowrap"><code style="background:#eef2ff;color:#4338ca;padding:2px 7px;border-radius:4px">{q.auto_code}</code></td>
  <td>{type_badge}</td>
  <td style="font-size:12px">Leçon&nbsp;{q.lesson_num}<br><span style="color:#94a3b8">{q.lesson_title}</span></td>
  <td>{comp_badge}</td>
  <td style="max-width:260px;font-size:13px">{q.text[:140]}{"…" if len(q.text)>140 else ""}</td>
  <td style="min-width:160px">{all_opts_html}</td>
  <td>{img_cell}</td>
</tr>"""

    # ── Per-question scoring table (for teacher use) ───────────────────────
    scoring_rows = ""
    for q in questions:
        n_correct = sum(1 for a in q.answers if a.is_correct)
        scoring_rows += (
            f'<tr><td><code style="background:#eef2ff;color:#4338ca;padding:2px 6px;border-radius:4px">'
            f'{q.auto_code}</code></td>'
            f'<td style="text-align:center">{n_correct}</td>'
            f'<td>{_badge(COMP_COLORS.get(q.competency or "","#64748b"), q.competency or "—") if q.competency else "—"}</td>'
            f'<td style="font-size:12px;color:#64748b">{q.text[:60]}{"…" if len(q.text)>60 else ""}</td></tr>\n'
        )

    total = len(questions)
    total_points = sum(sum(1 for a in q.answers if a.is_correct) for q in questions)

    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Rapport Enseignant — Cognition et apprentissage de la géométrie</title>
<style>
*{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:'Segoe UI',sans-serif;background:#f8fafc;color:#1e293b;padding:40px 32px}}
h1{{color:#6366f1;font-size:22px;margin-bottom:6px}}
.sub{{color:#64748b;font-size:14px;margin-bottom:32px}}
h2{{color:#334155;font-size:14px;text-transform:uppercase;letter-spacing:.6px;
  margin:32px 0 12px;padding-bottom:6px;border-bottom:2px solid #e2e8f0}}
.stats{{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-bottom:8px}}
.stat-card{{background:#fff;border-radius:12px;padding:20px;
  box-shadow:0 1px 8px rgba(0,0,0,.06);border-top:3px solid #6366f1}}
.stat-card h3{{font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px}}
table.main{{width:100%;border-collapse:collapse;background:#fff;border-radius:12px;
  overflow:hidden;box-shadow:0 1px 8px rgba(0,0,0,.06)}}
table.main th{{background:#6366f1;color:#fff;padding:11px 14px;font-size:12px;
  text-align:left;font-weight:600;letter-spacing:.3px}}
table.main td{{padding:11px 14px;border-bottom:1px solid #f1f5f9;vertical-align:top}}
table.main tr:hover td{{background:#f8fafc}}
.score-card{{background:#fff;border-radius:12px;padding:24px;
  box-shadow:0 1px 8px rgba(0,0,0,.06);margin-bottom:24px}}
.score-rule{{font-size:13px;line-height:2.1;color:#475569}}
.score-rule b{{color:#1e293b}}
</style>
</head>
<body>

<h1>Rapport Enseignant — Analyse des questions</h1>
<p class="sub">Domaine : <strong>Cognition et apprentissage de la géométrie</strong> &nbsp;|&nbsp;
  Total : <strong>{total} questions</strong> &nbsp;|&nbsp; Points max : <strong>{total_points}</strong></p>

<h2>Statistiques</h2>
<div class="stats">
  <div class="stat-card"><h3>Par type de questions</h3>{stat_table(type_rows)}</div>
  <div class="stat-card"><h3>Par leçon</h3>{stat_table(lesson_rows)}</div>
  <div class="stat-card"><h3>Par compétence</h3>{stat_table(comp_rows)}</div>
</div>

<h2>Détail des questions &amp; réponses</h2>
<table class="main">
  <thead>
    <tr>
      <th>Code</th><th>Type</th><th>Leçon</th><th>Compét.</th>
      <th>Énoncé</th><th>Options (✓ = correcte)</th><th>Image</th>
    </tr>
  </thead>
  <tbody>{q_rows}</tbody>
</table>

<h2>Barème &amp; système de scoring</h2>
<div class="score-card">
  <p class="score-rule">
    <b>Score total</b> = nombre de bonnes réponses sélectionnées<br>
    Réponse correcte sélectionnée &nbsp;→&nbsp; <b style="color:#16a34a">+1 point</b><br>
    Réponse incorrecte sélectionnée &nbsp;→&nbsp; <b style="color:#dc2626">0 point</b><br>
    "Je ne sais pas" &nbsp;→&nbsp; <b style="color:#64748b">0 point</b><br>
    Sans réponse &nbsp;→&nbsp; <b style="color:#64748b">0 point</b><br>
    <br>
    <b>Scores détaillés disponibles par :</b> Type de question · Leçon · Compétence (C1–C6)<br>
    Les scores par compétence servent d'entrée pour les modèles statistiques (IRT, SEM, etc.)
  </p>
</div>

<h2>Récapitulatif par question (points disponibles)</h2>
<table class="main">
  <thead><tr><th>Code</th><th style="text-align:center">Pts max</th><th>Compét.</th><th>Énoncé abrégé</th></tr></thead>
  <tbody>{scoring_rows}</tbody>
</table>

</body></html>"""


# ─────────────────────────────────────────────────────────────────────────────
# JSON export
# ─────────────────────────────────────────────────────────────────────────────

def export_json(questions: list, path: str):
    """Export full question data (with correct answers) as JSON for statistical models."""
    data = [
        {
            "auto_code": q.auto_code,
            "original_code": q.original_code,
            "question_type": q.question_type,
            "type_label": q.type_label,
            "lesson_num": q.lesson_num,
            "lesson_title": q.lesson_title,
            "competency": q.competency,
            "text": q.text,
            "image": q.image_name,
            "answers": [
                {"text": a.text, "is_correct": a.is_correct}
                for a in q.answers
            ],
            "n_correct": sum(1 for a in q.answers if a.is_correct),
        }
        for q in questions
    ]
    Path(path).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"  JSON data      : {path}")


# ─────────────────────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────────────────────

def main():
    docx_path = sys.argv[1] if len(sys.argv) > 1 else "questions.docx"

    if not Path(docx_path).exists():
        print(f"[ERROR] File not found: {docx_path}")
        print("Usage: python parser.py <path_to_docx>")
        sys.exit(1)

    print(f"\n CogniTest Parser")
    print(f"  Input : {docx_path}")

    questions = parse_document(docx_path)

    if not questions:
        print("[WARNING] No questions found. Check document structure.")
        sys.exit(0)

    print(f"  Found : {len(questions)} questions")

    # ── Print summary ─────────────────────────────────────────────────────
    by_comp: dict[str, int] = {}
    for q in questions:
        by_comp[q.competency or "—"] = by_comp.get(q.competency or "—", 0) + 1
    print("\n  Competency breakdown:")
    for c, n in sorted(by_comp.items()):
        print(f"    {c}: {n} question(s)")

    # ── Write outputs ─────────────────────────────────────────────────────
    out_dir = Path(docx_path).parent
    print()

    student_path = out_dir / "student_exam.html"
    student_path.write_text(build_student_html(questions), encoding="utf-8")
    print(f"  Student exam   : {student_path}")

    teacher_path = out_dir / "teacher_report.html"
    teacher_path.write_text(build_teacher_html(questions), encoding="utf-8")
    print(f"  Teacher report : {teacher_path}")

    json_path = out_dir / "questions_data.json"
    export_json(questions, str(json_path))
    print(f"  JSON data      : {json_path}")

    print("\n  Done.\n")


if __name__ == "__main__":
    main()
