"""CLI entry point for the Geometry-in-Space toolkit.

Examples
--------
    # Parse a docx and print extracted questions:
    python -m tools.geo_space.main --docx input.docx

    # Export the clean student version (no skills, no truth markers):
    python -m tools.geo_space.main --export-student out/student.docx

    # Grade a JSON of student answers:
    python -m tools.geo_space.main --answers answers.json
"""

from __future__ import annotations
import argparse
import json
from pathlib import Path

from .dataset import QUESTIONS
from .docx_parser import parse_docx
from .docx_export import export_student_docx
from .models import StudentAnswer
from .scoring import grade, summarize


def main() -> None:
    ap = argparse.ArgumentParser(
        description="Geometry-in-Space — extract / export / grade.")
    ap.add_argument("--docx", help="Parse a Word file and dump questions to stdout.")
    ap.add_argument("--export-student", help="Write a clean student .docx.")
    ap.add_argument("--answers", help="Path to a JSON dict {code: {selected:[..], dont_know:bool}}.")
    args = ap.parse_args()

    if args.docx:
        questions = parse_docx(args.docx)
        for q in questions:
            print(f"{q.code}  [{q.skill or '—'}]  {q.text}")
            for i, c in enumerate(q.choices):
                mark = "✓" if c.correct else " "
                print(f"   {mark} {chr(ord('A') + i)}. {c.text}")
            print()

    if args.export_student:
        path = export_student_docx(QUESTIONS, args.export_student)
        print(f"Wrote {path}")

    if args.answers:
        with open(args.answers, encoding="utf-8") as fh:
            raw = json.load(fh)
        by_code = {q.code: q for q in QUESTIONS}
        graded = []
        for code, payload in raw.items():
            if code not in by_code:
                continue
            ans = StudentAnswer(
                code=code,
                selected=list(payload.get("selected", [])),
                dont_know=bool(payload.get("dont_know", False)),
            )
            graded.append(grade(by_code[code], ans))
        summary = summarize(QUESTIONS, graded)
        print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
