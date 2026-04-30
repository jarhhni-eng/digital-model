"""
CLI entry point.

Usage:
  python -m tools.droite_plan.main --docx path/to/file.docx
  python -m tools.droite_plan.main                        # uses embedded dataset
  python -m tools.droite_plan.main --answers answers.json

Outputs (in ./tools/droite_plan/output):
  - student.html   one-question-per-screen exam
  - teacher.html   answers + skills + analytics
  - stats.json     machine-readable scoring summary
  - dataset.json   structured dataset for downstream platforms
  - images/        extracted or generated figures (e.g. Q2 repère)
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path

from .dataset import build_dataset
from .models import StudentAnswer
from .renderer import render_student, render_teacher, export_dataset_json
from .repere import make_repere
from .scoring import grade, summarize


def load_questions(docx_path: str | None, images_dir: Path):
    """
    Try the .docx parser first; fall back to the embedded dataset on any
    failure. The embedded dataset generates Q2's repère at runtime.
    """
    if docx_path:
        try:
            from .docx_parser import parse_docx
            qs = parse_docx(docx_path, image_dir=str(images_dir))
            if qs:
                return qs
            print("[warn] parser returned no questions — falling back to embedded dataset")
        except Exception as e:
            print(f"[warn] docx parse failed ({e}) — falling back to embedded dataset")

    # Generate Q2 repère programmatically.
    repere_path = make_repere(str(images_dir / "q2_repere.png"))
    if not repere_path:
        print("[warn] matplotlib unavailable — Q2 will be rendered without a figure")
    return build_dataset(repere_image=repere_path)


def load_answers(path: str | None) -> dict[str, StudentAnswer]:
    """
    answers.json format:
      { "T1-D2-Q3": "A", "T3-D2-Q12": "A", ... }
    """
    if not path:
        return {}
    raw = json.loads(Path(path).read_text(encoding="utf-8"))
    return {
        qid: StudentAnswer(question_id=qid, selected_letter=letter)
        for qid, letter in raw.items()
    }


def main():
    ap = argparse.ArgumentParser(description="Droite dans le plan — assessment builder")
    ap.add_argument("--docx", help="Path to a .docx source file")
    ap.add_argument("--answers", help="Path to a JSON file of student answers")
    ap.add_argument("--out", default="tools/droite_plan/output", help="Output directory")
    args = ap.parse_args()

    out_dir = Path(args.out)
    images_dir = out_dir / "images"
    out_dir.mkdir(parents=True, exist_ok=True)
    images_dir.mkdir(parents=True, exist_ok=True)

    questions = load_questions(args.docx, images_dir)
    answers = load_answers(args.answers)
    graded = grade(questions, answers)
    stats = summarize(graded)

    student_path = render_student(questions, str(out_dir / "student.html"))
    teacher_path = render_teacher(questions, stats, str(out_dir / "teacher.html"))
    dataset_path = export_dataset_json(questions, str(out_dir / "dataset.json"))
    (out_dir / "stats.json").write_text(
        json.dumps(stats, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    print(f"[ok] {len(questions)} questions loaded")
    print(f"[ok] Student view : {student_path}")
    print(f"[ok] Teacher view : {teacher_path}")
    print(f"[ok] Dataset JSON : {dataset_path}")
    print(f"[ok] Stats JSON   : {out_dir / 'stats.json'}")
    if graded:
        t = stats["total"]
        print(f"  Score: {t['score']}/{t['max']} ({t['percent']}%)")
        for ins in stats.get("insights", []):
            print(f"  • {ins}")


if __name__ == "__main__":
    main()
