"""
Word (.docx) → Question list.

The parser is tolerant of authoring variations. It recognises:

  * Question headers starting with "Q<n>" or "Question <n>".
  * Answer lines starting with "A.", "B.", "C.", "D." (or "A)", "A -").
  * The "(true)" / "(false)" trailing tag that marks the correct option.
  * Inline skill tags like "[C1]", "[C3]" — otherwise `None`.
  * Embedded images: every inline shape is saved to `images/` and the
    *first* image following a question header is attached to that question.

Question type is inferred from numbering rules matching the pedagogical
context of this lesson (Q1-Q5 cours, Q6-Q8 construction, Q9-Q12
raisonnement) but can be overridden by a `[T2]` tag.

If python-docx is not installed or no .docx is passed, callers should
fall back to `dataset.build_dataset()`.
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
_CORRECT_TAG = re.compile(r"\((?:true|vrai)\)\s*$", re.IGNORECASE)
_WRONG_TAG = re.compile(r"\((?:false|faux)\)\s*$", re.IGNORECASE)
_SKILL_TAG = re.compile(r"\[(C[123])\]", re.IGNORECASE)
_TYPE_TAG = re.compile(r"\[T([123])\]", re.IGNORECASE)


def _infer_type(qnum: int) -> int:
    if qnum <= 5:
        return 1
    if qnum <= 8:
        return 2
    return 3


def _strip_tags(text: str) -> str:
    text = _CORRECT_TAG.sub("", text)
    text = _WRONG_TAG.sub("", text)
    text = _SKILL_TAG.sub("", text)
    text = _TYPE_TAG.sub("", text)
    return text.strip()


def _extract_images(doc, out_dir: Path) -> list[str]:
    """Save every embedded image to out_dir and return their paths in order."""
    out_dir.mkdir(parents=True, exist_ok=True)
    saved: list[str] = []
    rels = doc.part.rels
    for rel_id, rel in rels.items():
        if "image" in rel.reltype:
            blob = rel.target_part.blob
            ext = os.path.splitext(rel.target_ref)[1] or ".png"
            path = out_dir / f"img_{len(saved)+1}{ext}"
            path.write_bytes(blob)
            saved.append(str(path))
    return saved


def parse_docx(path: str, image_dir: str = "images") -> list[Question]:
    """
    Parse a .docx file into Question objects.

    Raises ImportError if python-docx is missing. On any parse error the
    caller is expected to fall back to the embedded dataset.
    """
    try:
        from docx import Document  # python-docx
    except ImportError as e:
        raise ImportError("python-docx is required — `pip install python-docx`") from e

    doc = Document(path)
    image_paths = _extract_images(doc, Path(image_dir))
    img_cursor = 0

    questions: list[Question] = []
    current: Optional[Question] = None

    def finalize():
        if current is not None:
            questions.append(current)

    for para in doc.paragraphs:
        raw = para.text.rstrip()
        if not raw.strip():
            continue

        m = _Q_HEADER.match(raw)
        if m:
            finalize()
            qnum = int(m.group(1))
            rest = m.group(2)

            skill_m = _SKILL_TAG.search(rest)
            type_m = _TYPE_TAG.search(rest)

            current = Question(
                id="",                       # set at the end
                number=qnum,
                type_code=int(type_m.group(1)) if type_m else _infer_type(qnum),
                lesson_code=1,
                skill=skill_m.group(1).upper() if skill_m else None,
                stem=_strip_tags(rest),
            )
            # Attach next available image (if any) to each question eagerly.
            if img_cursor < len(image_paths):
                current.image = image_paths[img_cursor]
                img_cursor += 1
            continue

        if current is None:
            continue

        cm = _CHOICE.match(raw)
        if cm:
            letter = cm.group(1).upper()
            body = cm.group(2)
            is_correct = bool(_CORRECT_TAG.search(body))
            current.choices.append(Choice(
                letter=letter,
                text=_strip_tags(body),
                is_correct=is_correct,
            ))
            continue

        # Continuation line: append to stem (keeps LaTeX intact).
        current.stem = f"{current.stem} {_strip_tags(raw)}".strip()

    finalize()

    # Assign normalized ids and flag Q1 as diagnostic if it has no correct answer.
    for q in questions:
        q.id = f"T{q.type_code}-D{q.lesson_code}-Q{q.number}"
        if q.number == 1 and not any(c.is_correct for c in q.choices):
            q.is_diagnostic = True

    return questions
