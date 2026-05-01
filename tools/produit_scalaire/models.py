"""
Data models for the Produit Scalaire assessment system.

Each Question carries:
  - id            : normalized code, e.g. "T1-D1-Q2"
  - type_code     : 1 (cours), 2 (construction), 3 (raisonnement)
  - lesson_code   : integer id of the lesson inside the domain (1 here)
  - skill         : one of {"C1","C2","C3", None}
  - stem          : the question text (LaTeX allowed, surrounded by $...$)
  - choices       : list[Choice]
  - image         : optional path to an extracted image
  - expected_text : for open/short-answer items (Q6-Q8, Q11.2, Q12)
"""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional


QUESTION_TYPES = {
    1: "Questions du cours",
    2: "Questions de construction",
    3: "Questions de raisonnement",
}

LESSONS = {
    1: "Produit scalaire",
    2: "Géométrie analytique",
}

# Internal taxonomy — never shown to the student.
SKILLS = {
    "C1": "Connaître la définition et les propriétés du produit scalaire",
    "C2": "Lire et calculer dans un repère / visualisation",
    "C3": "Théorèmes (Al-Kashi, médiane) et raisonnement métrique",
    "C4": "Cercles : équations, centre et rayon",
    "C5": "Géométrie analytique : droites, distances, projections",
    "C6": "Angles, cosinus et applications",
}


@dataclass
class Choice:
    """One option of a multiple-choice question."""
    letter: str           # "A", "B", "C", "D"
    text: str             # rendered content (LaTeX allowed inside $...$)
    is_correct: bool      # hidden from the student view


@dataclass
class Question:
    id: str                                 # e.g. "T1-D1-Q2"
    number: int                             # original 1..12 index
    type_code: int                          # 1 | 2 | 3
    lesson_code: int                        # 1 (produit scalaire)
    skill: Optional[str]                    # "C1" | "C2" | "C3" | None
    stem: str                               # main wording
    choices: list[Choice] = field(default_factory=list)
    image: Optional[str] = None             # relative path, e.g. "images/q6.png"
    expected_text: Optional[str] = None     # free-form expected answer
    is_diagnostic: bool = False             # Q1 is self-report, not scored

    @property
    def type_label(self) -> str:
        return QUESTION_TYPES.get(self.type_code, "?")


@dataclass
class StudentAnswer:
    question_id: str
    # Multi-select friendly. Single-MCQ → list of length 1 (or empty).
    selected_letters: list[str] = field(default_factory=list)
    free_text: Optional[str] = None
    dont_know: bool = False

    # ─ Backwards-compat shim for the older single-letter API ─
    @property
    def selected_letter(self) -> Optional[str]:
        return self.selected_letters[0] if self.selected_letters else None


@dataclass
class GradedAnswer:
    question_id: str
    type_code: int
    lesson_code: int
    skill: Optional[str]
    score: float          # 0, 0.5 (partial), or 1
    max_score: float
    correct_letters: list[str]
    selected_letters: list[str]
    dont_know: bool = False
