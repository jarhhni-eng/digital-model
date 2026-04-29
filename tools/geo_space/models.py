"""Data models for the Geometry-in-Space test.

Skills (C1, C2, C3) and per-choice truth markers are kept in the model but
are NEVER displayed to the student — only used for grading and analytics.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Optional

# ─── Skill taxonomy (internal only) ─────────────────────────────────────────
SKILLS = {
    "C1": "Reconnaître et représenter des parties de l'espace sur le plan",
    "C2": "Appréhender les cas de similarité et insimilarité entre les "
          "propriétés du plan et de l'espace",
    "C3": "Utiliser les propriétés de la géométrie de l'espace dans la "
          "résolution de problèmes",
}

QUESTION_TYPES = {
    1: "Cours",          # Partie I
    2: "Construction",   # Partie II
    3: "Raisonnement",   # Partie III
}


@dataclass
class Choice:
    """One answer choice. `correct` is hidden from the student UI."""
    text: str            # may contain LaTeX like $ \parallel $ or \( ... \)
    correct: bool = False


@dataclass
class Question:
    code: str                           # canonical id, e.g. "G1-D3-Q5"
    number: int                         # 1..N within the section
    skill: Optional[str]                # "C1" / "C2" / "C3" / None for auto-eval
    type_code: int                      # 1, 2, 3
    text: str                           # rendered with KaTeX in the UI
    choices: List[Choice] = field(default_factory=list)
    figure_path: Optional[str] = None   # png/svg next to the docx
    is_diagnostic: bool = False         # auto-evaluation only — no scoring
    is_multi: bool = False              # several choices may be true

    @property
    def correct_indices(self) -> List[int]:
        return [i for i, c in enumerate(self.choices) if c.correct]


@dataclass
class StudentAnswer:
    code: str
    selected: List[int] = field(default_factory=list)
    dont_know: bool = False
    response_time_s: Optional[float] = None


@dataclass
class GradedAnswer:
    code: str
    selected: List[int]
    correct_indices: List[int]
    is_correct: bool
    points: int            # 0 or 1 per scoring rules
    skill: Optional[str]
    dont_know: bool
