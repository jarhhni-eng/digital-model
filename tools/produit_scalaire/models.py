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
    selected_letter: Optional[str] = None   # for MCQ
    free_text: Optional[str] = None         # for open items


@dataclass
class GradedAnswer:
    question_id: str
    type_code: int
    skill: Optional[str]
    score: int            # 0 or 1
    max_score: int        # usually 1 (0 for diagnostic)
    correct_letter: Optional[str]
    selected_letter: Optional[str]
