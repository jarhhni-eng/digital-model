"""
CLI entry point.

Usage:
  python -m tools.produit_scalaire.main --docx path/to/file.docx
  python -m tools.produit_scalaire.main                  # uses embedded dataset
  python -m tools.produit_scalaire.main --answers answers.json

Outputs (in ./output):
  - student.html   one-question-per-screen exam
  - teacher.html   answers + skills + analytics
  - stats.json     machine-readable scoring summary
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path

from .dataset import build_dataset
from .models import StudentAnswer
from .renderer import render_student, render_teacher
from .scoring import grade, summarize


def load_questions(docx_path: str | None):
    if docx_path:
        try:
            from .docx_parser import parse_docx
            qs = parse_docx(docx_path, image_dir="tools/produit_scalaire/output/images")
            if qs:
                return qs
            print("[warn] parser returned no questions — falling back to embedded dataset")
        except Exception as e:
            print(f"[warn] docx parse failed ({e}) — falling back to embedded dataset")
    return build_dataset()


def load_answers(path: str | None) -> dict[str, StudentAnswer]:
    """answers.json formats accepted (both work):
        {"T1-D1-Q2": "A"}                            (single-letter shortcut)
        {"T1-D1-Q2": ["A", "C"]}                     (multi-select list)
        {"T1-D1-Q2": {"selected": ["A"], "dont_know": false, "free_text": null}}
    """
    if not path:
        return {}
    raw = json.loads(Path(path).read_text(encoding="utf-8"))
    out: dict[str, StudentAnswer] = {}
    for qid, val in raw.items():
        if isinstance(val, str):
            out[qid] = StudentAnswer(question_id=qid, selected_letters=[val])
        elif isinstance(val, list):
            out[qid] = StudentAnswer(question_id=qid, selected_letters=list(val))
        elif isinstance(val, dict):
            out[qid] = StudentAnswer(
                question_id=qid,
                selected_letters=list(val.get("selected", []) or []),
                free_text=val.get("free_text"),
                dont_know=bool(val.get("dont_know", False)),
            )
    return out


def main():
    ap = argparse.ArgumentParser(description="Produit scalaire assessment builder")
    ap.add_argument("--docx", help="Path to a .docx source file")
    ap.add_argument("--answers", help="Path to a JSON file of student answers")
    ap.add_argument("--out", default="tools/produit_scalaire/output", help="Output directory")
    args = ap.parse_args()

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    questions = load_questions(args.docx)
    answers = load_answers(args.answers)
    graded = grade(questions, answers)
    stats = summarize(graded)

    student_path = render_student(questions, str(out_dir / "student.html"))
    teacher_path = render_teacher(questions, stats, str(out_dir / "teacher.html"))
    (out_dir / "stats.json").write_text(json.dumps(stats, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"[ok] {len(questions)} questions loaded")
    print(f"[ok] Student view : {student_path}")
    print(f"[ok] Teacher view : {teacher_path}")
    print(f"[ok] Stats        : {out_dir / 'stats.json'}")
    if graded:
        t = stats["total"]
        print(f"  Score: {t['score']}/{t['max']} ({t['percent']}%)")


if __name__ == "__main__":
    main()
