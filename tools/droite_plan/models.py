"""
Data models for the "Droite dans le plan" assessment system.

A Question carries:
  - id            : normalized code, e.g. "T1-D2-Q2"
  - type_code     : 1 (cours), 2 (construction), 3 (raisonnement)
  - lesson_code   : 2  (droite dans le plan)
  - skill         : "C1" | "C2" | None
  - stem          : question text (LaTeX between $...$)
  - choices       : list[Choice]
  - image         : optional path to an attached figure / repère
  - expected_text : optional reference correction for open items
"""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional


QUESTION_TYPES = {
    1: "Questions du cours",
    2: "Questions de la construction",
    3: "Questions de raisonnement",
}

SKILLS = {
    "C1": "Traduction des concepts et propriétés de la géométrie affine et "
          "vectorielle à l'aide des coordonnées.",
    "C2": "Utilisation de l'outil analytique (colinéarité, alignement, "
          "projection, distance, …).",
}


@dataclass
class Choice:
    """One option of a multiple-choice question."""
    letter: str           # "A" / "B" / "C" / "D"
    text: str             # rendered content (LaTeX allowed inside $...$)
    is_correct: bool      # hidden from the student view


@dataclass
class Question:
    id: str                                 # e.g. "T1-D2-Q2"
    number: int                             # original 1..N index
    type_code: int                          # 1 | 2 | 3
    lesson_code: int                        # 2  (droite dans le plan)
    skill: Optional[str]                    # "C1" | "C2" | None
    stem: str                               # main wording
    choices: list[Choice] = field(default_factory=list)
    image: Optional[str] = None             # relative path, e.g. "images/q2_repere.png"
    expected_text: Optional[str] = None     # free-form expected answer
    is_diagnostic: bool = False             # Q1 self-report → not scored

    @property
    def type_label(self) -> str:
        return QUESTION_TYPES.get(self.type_code, "?")


@dataclass
class StudentAnswer:
    question_id: str
    selected_letter: Optional[str] = None   # MCQ answer
    free_text: Optional[str] = None         # open answer


@dataclass
class GradedAnswer:
    question_id: str
    type_code: int
    skill: Optional[str]
    score: int            # 0 or 1
    max_score: int        # usually 1 (0 for diagnostic)
    correct_letter: Optional[str]
    selected_letter: Optional[str]
