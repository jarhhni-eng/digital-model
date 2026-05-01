"""
Scoring and analytics.

Rules (per spec):
  correct        → 1
  incorrect      → 0
  no answer      → 0
  "I don't know" → 0

Diagnostic items (Q1) are excluded from the score and stats.
Multi-correct questions accept any of the correct letters.
"""
from __future__ import annotations
from collections import defaultdict
from dataclasses import asdict
from typing import Iterable

from .models import GradedAnswer, Question, StudentAnswer, QUESTION_TYPES, SKILLS


def _correct_letters(q: Question) -> set[str]:
    return {c.letter for c in q.choices if c.is_correct}


def grade(
    questions: Iterable[Question],
    answers: dict[str, StudentAnswer],
) -> list[GradedAnswer]:
    """Return one GradedAnswer per scoreable question."""
    graded: list[GradedAnswer] = []
    for q in questions:
        if q.is_diagnostic:
            continue
        correct = _correct_letters(q)
        if not correct:
            # Open-answer item — skipped (requires manual teacher review).
            continue
        ans = answers.get(q.id)
        picked = ans.selected_letter if ans else None
        score = 1 if picked in correct else 0
        graded.append(GradedAnswer(
            question_id=q.id,
            type_code=q.type_code,
            skill=q.skill,
            score=score,
            max_score=1,
            correct_letter=",".join(sorted(correct)),
            selected_letter=picked,
        ))
    return graded


def _pct(score: int, mx: int) -> int:
    return round(100 * score / mx) if mx else 0


def summarize(graded: list[GradedAnswer]) -> dict:
    """
    Aggregate stats by total, type, lesson and skill, and produce
    plain-French pedagogical insights (weakness detection).
    """
    total_score = sum(g.score for g in graded)
    total_max = sum(g.max_score for g in graded)

    by_type: dict[int, dict] = defaultdict(lambda: {"score": 0, "max": 0, "label": ""})
    by_skill: dict[str, dict] = defaultdict(lambda: {"score": 0, "max": 0})

    for g in graded:
        t = by_type[g.type_code]
        t["score"] += g.score
        t["max"] += g.max_score
        t["label"] = QUESTION_TYPES.get(g.type_code, "?")

        key = g.skill or "—"
        s = by_skill[key]
        s["score"] += g.score
        s["max"] += g.max_score

    # Pedagogical insights
    insights: list[str] = []
    for skill, row in by_skill.items():
        if skill in ("—", None):
            continue
        pct = _pct(row["score"], row["max"])
        if pct < 50:
            label = SKILLS.get(skill, skill)
            insights.append(
                f"Difficultés marquées en {skill} ({pct}%). Capacité : {label}"
            )
    for code, row in by_type.items():
        pct = _pct(row["score"], row["max"])
        if pct < 50:
            insights.append(
                f"Partie {code} ({row['label']}) faible : {row['score']}/{row['max']} ({pct}%)"
            )
    if not insights and total_max > 0 and _pct(total_score, total_max) >= 80:
        insights.append("Maîtrise globale satisfaisante — continuer sur des cas plus complexes.")

    return {
        "total": {
            "score": total_score,
            "max": total_max,
            "percent": _pct(total_score, total_max),
        },
        "by_type": {
            str(k): {**v, "percent": _pct(v["score"], v["max"])} for k, v in by_type.items()
        },
        "by_skill": {
            k: {**v, "percent": _pct(v["score"], v["max"])} for k, v in by_skill.items()
        },
        "by_lesson": {
            "D2": {
                "score": total_score,
                "max": total_max,
                "percent": _pct(total_score, total_max),
            }
        },
        "insights": insights,
        "details": [asdict(g) for g in graded],
    }
