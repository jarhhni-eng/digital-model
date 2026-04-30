"""Scoring & analytics for Geometry-in-Space.

Scoring rules
-------------
* Single-correct (one true choice)  : selecting exactly that choice → 1 point.
* Multi-correct  (≥2 true choices)  : selecting *exactly* the set of correct
                                       choices (no missing, no extra) → 1 point.
* Anything else (incorrect, empty,
  "Je ne sais pas", or the diagnostic
  question)                          : 0 point.

The diagnostic ("Mesure 1") is recorded but excluded from the final score.
"""

from __future__ import annotations
from collections import defaultdict
from typing import Iterable, List

from .models import Question, StudentAnswer, GradedAnswer, SKILLS


def grade(question: Question, answer: StudentAnswer) -> GradedAnswer:
    correct_set = set(question.correct_indices)
    selected_set = set(answer.selected)

    if question.is_diagnostic or answer.dont_know or not answer.selected:
        is_correct = False
    else:
        is_correct = selected_set == correct_set

    return GradedAnswer(
        code=question.code,
        selected=sorted(answer.selected),
        correct_indices=sorted(correct_set),
        is_correct=is_correct,
        points=1 if is_correct else 0,
        skill=question.skill,
        dont_know=answer.dont_know,
    )


def summarize(questions: List[Question], graded: Iterable[GradedAnswer]) -> dict:
    """Aggregate score, per-skill score, and weak/strong items."""
    graded = list(graded)
    by_code = {q.code: q for q in questions}

    scorable = [g for g in graded if not by_code[g.code].is_diagnostic]
    total = len(scorable)
    correct = sum(g.points for g in scorable)

    skill_total: dict[str, int] = defaultdict(int)
    skill_correct: dict[str, int] = defaultdict(int)
    for g in scorable:
        if g.skill is None:
            continue
        skill_total[g.skill] += 1
        skill_correct[g.skill] += g.points

    weakest = sorted(
        ((s, skill_correct[s], skill_total[s]) for s in skill_total),
        key=lambda x: (x[1] / x[2]) if x[2] else 1.0,
    )

    return {
        "correct": correct,
        "total": total,
        "score_pct": round((correct / total) * 100, 1) if total else 0.0,
        "by_skill": {
            s: {
                "correct": skill_correct[s],
                "total": skill_total[s],
                "pct": round((skill_correct[s] / skill_total[s]) * 100, 1)
                       if skill_total[s] else 0.0,
                "label": SKILLS.get(s, ""),
            }
            for s in sorted(skill_total)
        },
        "weakest_skill": weakest[0][0] if weakest else None,
        "incorrect_codes": [g.code for g in scorable if not g.is_correct],
    }
