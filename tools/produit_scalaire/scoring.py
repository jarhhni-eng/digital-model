"""
Scoring and statistics for a set of student answers.

Rules:
  full match (set of selected letters == set of correct letters) → 1.0
  non-empty subset of correct letters with no wrong picks         → 0.5 (partial)
  any wrong letter, or no answer, or "Je ne sais pas"             → 0.0

Diagnostic items (Q1) are excluded from scoring and stats.
Open-ended items (no choices marked correct, only `expected_text`) are skipped
by automatic grading and surfaced for manual review by the teacher.
"""
from __future__ import annotations
from collections import defaultdict
from dataclasses import asdict
from typing import Iterable

from .models import (
    GradedAnswer,
    LESSONS,
    QUESTION_TYPES,
    Question,
    SKILLS,
    StudentAnswer,
)


def _correct_letters(q: Question) -> set[str]:
    return {c.letter for c in q.choices if c.is_correct}


def _grade_one(q: Question, ans: StudentAnswer | None, partial: bool) -> GradedAnswer | None:
    correct = _correct_letters(q)
    if not correct:
        return None  # open-answer; manual review

    picked: list[str] = []
    dont_know = False
    if ans is not None:
        picked = list(ans.selected_letters)
        dont_know = ans.dont_know

    picked_set = set(picked)
    score = 0.0
    if dont_know or not picked_set:
        score = 0.0
    elif picked_set == correct:
        score = 1.0
    elif partial and picked_set.issubset(correct) and picked_set:
        score = 0.5
    else:
        score = 0.0

    return GradedAnswer(
        question_id=q.id,
        type_code=q.type_code,
        lesson_code=q.lesson_code,
        skill=q.skill,
        score=score,
        max_score=1.0,
        correct_letters=sorted(correct),
        selected_letters=sorted(picked_set),
        dont_know=dont_know,
    )


def grade(
    questions: Iterable[Question],
    answers: dict[str, StudentAnswer],
    partial: bool = True,
) -> list[GradedAnswer]:
    """Return one GradedAnswer per automatically-scoreable question."""
    graded: list[GradedAnswer] = []
    for q in questions:
        if q.is_diagnostic:
            continue
        g = _grade_one(q, answers.get(q.id), partial=partial)
        if g is not None:
            graded.append(g)
    return graded


def summarize(graded: list[GradedAnswer]) -> dict:
    """Aggregate stats by total, type, skill and lesson."""
    total_score = sum(g.score for g in graded)
    total_max = sum(g.max_score for g in graded)

    by_type: dict[int, dict] = defaultdict(lambda: {"score": 0.0, "max": 0.0, "label": ""})
    by_skill: dict[str, dict] = defaultdict(lambda: {"score": 0.0, "max": 0.0, "label": ""})
    by_lesson: dict[int, dict] = defaultdict(lambda: {"score": 0.0, "max": 0.0, "label": ""})

    for g in graded:
        t = by_type[g.type_code]
        t["score"] += g.score
        t["max"] += g.max_score
        t["label"] = QUESTION_TYPES.get(g.type_code, "?")

        key = g.skill or "—"
        s = by_skill[key]
        s["score"] += g.score
        s["max"] += g.max_score
        s["label"] = SKILLS.get(g.skill or "", "")

        l = by_lesson[g.lesson_code]
        l["score"] += g.score
        l["max"] += g.max_score
        l["label"] = LESSONS.get(g.lesson_code, "?")

    def pct(score: float, mx: float) -> int:
        return round(100 * score / mx) if mx else 0

    return {
        "total": {
            "score": round(total_score, 2),
            "max": round(total_max, 2),
            "percent": pct(total_score, total_max),
        },
        "by_type": {
            str(k): {**v, "percent": pct(v["score"], v["max"])} for k, v in by_type.items()
        },
        "by_skill": {
            k: {**v, "percent": pct(v["score"], v["max"])} for k, v in by_skill.items()
        },
        "by_lesson": {
            f"D{k}": {**v, "percent": pct(v["score"], v["max"])} for k, v in by_lesson.items()
        },
        "details": [asdict(g) for g in graded],
    }
