"""
Word (.docx) → Question list, table-oriented parser.

Document structure recognized:
  * Section titles above tables indicate the question type:
      "Questions du cours"          → Type 1
      "Questions de la construction" → Type 2
      "Questions de raisonnement"   → Type 3
  * Each table holds one or more questions in a tolerant layout:
      header row with "Q<n>" + question text
      four answer rows (letters A..D), each possibly ending with
      "(correct)" / "(true)" / "(vrai)" or "(false)" / "(faux)".
  * Inline tag "[C1]" or "[C2]" sets the competency.
  * Embedded images are saved to `image_dir` and attached in order to
    the questions that follow them.

Also supports flat paragraph layouts (same as produit_scalaire parser) as
a fallback when no tables are found.
"""
from __future__ import annotations
import os
import re
from pathlib import Path
from typing import Optional

from .models import Question, Choice


# ── Regexes ──────────────────────────────────────────────────────────────────
_Q_HEADER = re.compile(r"^\s*(?:Q|Question\s*)(\d+)\s*[:\.\)-]?\s*(.*)$", re.IGNORECASE)
_CHOICE = re.compile(r"^\s*([A-D])\s*[\.\)\-]\s*(.*)$")
_CORRECT_TAG = re.compile(r"\(?\s*(?:correct|true|vrai)\s*\)?\s*$", re.IGNORECASE)
_WRONG_TAG = re.compile(r"\(?\s*(?:false|faux|incorrect)\s*\)?\s*$", re.IGNORECASE)
_SKILL_TAG = re.compile(r"\[(C[12])\]", re.IGNORECASE)
_TYPE_TAG = re.compile(r"\[T([123])\]", re.IGNORECASE)

# Map section titles to type codes
_SECTION_MAP = {
    "questions du cours": 1,
    "questions de la construction": 2,
    "questions de construction": 2,
    "questions de raisonnement": 3,
}


def _section_type(text: str) -> Optional[int]:
    norm = re.sub(r"\s+", " ", text).strip().lower()
    for title, code in _SECTION_MAP.items():
        if title in norm:
            return code
    return None


def _strip_tags(text: str) -> str:
    text = _CORRECT_TAG.sub("", text)
    text = _WRONG_TAG.sub("", text)
    text = _SKILL_TAG.sub("", text)
    text = _TYPE_TAG.sub("", text)
    return text.strip(" \t\r\n:-.")


def _is_correct(text: str) -> bool:
    return bool(_CORRECT_TAG.search(text))


def _extract_images(doc, out_dir: Path) -> list[str]:
    """Save every embedded image and return paths in doc order."""
    out_dir.mkdir(parents=True, exist_ok=True)
    saved: list[str] = []
    for rel_id, rel in doc.part.rels.items():
        if "image" in rel.reltype:
            blob = rel.target_part.blob
            ext = os.path.splitext(rel.target_ref)[1] or ".png"
            path = out_dir / f"img_{len(saved)+1}{ext}"
            path.write_bytes(blob)
            saved.append(str(path))
    return saved


def _finalize_question(questions: list[Question], q: Optional[Question]):
    if q is not None and (q.stem or q.choices):
        questions.append(q)


def parse_docx(path: str, image_dir: str = "images") -> list[Question]:
    """
    Parse a .docx file into Question objects.

    The parser walks the document body in order, tracking the last seen
    section heading (to deduce type_code) and pulling text from both
    paragraphs and table cells.
    """
    try:
        from docx import Document
    except ImportError as e:
        raise ImportError("python-docx is required — `pip install python-docx`") from e

    doc = Document(path)
    images = _extract_images(doc, Path(image_dir))
    img_cursor = 0

    questions: list[Question] = []
    current: Optional[Question] = None
    current_type: int = 1  # default to "cours"

    def process_line(line: str):
        nonlocal current, img_cursor
        raw = line.rstrip()
        if not raw.strip():
            return
        # Section banner?
        st = _section_type(raw)
        if st is not None and not _Q_HEADER.match(raw):
            nonlocal_current_type(st)
            return
        # Question header?
        m = _Q_HEADER.match(raw)
        if m:
            _finalize_question(questions, current)
            qnum = int(m.group(1))
            rest = m.group(2)
            skill_m = _SKILL_TAG.search(rest)
            type_m = _TYPE_TAG.search(rest)
            current = Question(
                id="",
                number=qnum,
                type_code=int(type_m.group(1)) if type_m else current_type,
                lesson_code=2,
                skill=skill_m.group(1).upper() if skill_m else None,
                stem=_strip_tags(rest),
            )
            if img_cursor < len(images):
                current.image = images[img_cursor]
                img_cursor += 1
            return
        if current is None:
            return
        # Choice line?
        cm = _CHOICE.match(raw)
        if cm:
            letter = cm.group(1).upper()
            body = cm.group(2)
            current.choices.append(Choice(
                letter=letter,
                text=_strip_tags(body),
                is_correct=_is_correct(body),
            ))
            return
        # Otherwise append to stem (keeps inline LaTeX intact).
        current.stem = f"{current.stem} {_strip_tags(raw)}".strip()

    def nonlocal_current_type(v: int):
        nonlocal current_type
        current_type = v

    # Walk paragraphs and tables in document order.
    body = doc.element.body
    for child in body.iterchildren():
        tag = child.tag.split("}", 1)[-1]
        if tag == "p":
            # Resolve to a real Paragraph for clean text extraction
            from docx.text.paragraph import Paragraph
            p = Paragraph(child, doc)
            process_line(p.text)
        elif tag == "tbl":
            from docx.table import Table
            t = Table(child, doc)
            # Look above the table for a section banner
            for row in t.rows:
                for cell in row.cells:
                    for para in cell.paragraphs:
                        process_line(para.text)

    _finalize_question(questions, current)

    # Assign normalized ids. Flag Q1 as diagnostic when no option is correct.
    for q in questions:
        q.id = f"T{q.type_code}-D{q.lesson_code}-Q{q.number}"
        if q.number == 1 and not any(c.is_correct for c in q.choices):
            q.is_diagnostic = True

    return questions
