"""Geometry-in-Space — interactive cognitive assessment toolkit.

Submodules
----------
models      : dataclasses for Question / Choice / GradedAnswer.
dataset     : canonical QUESTIONS list (Q1..Q18 + auto-eval).
docx_parser : tolerant parser for .docx inputs.
docx_export : emit a clean student version (no truth markers, no skills).
scoring     : grade(), summarize(), per-skill insights.
streamlit_app : run with `streamlit run -m tools.geo_space.streamlit_app`
                (or `streamlit run tools/geo_space/streamlit_app.py`).
"""

from .models import (
    Question, Choice, StudentAnswer, GradedAnswer,
    QUESTION_TYPES, SKILLS,
)
from .dataset import QUESTIONS, GROUP, LESSON
from .scoring import grade, summarize

__all__ = [
    "Question", "Choice", "StudentAnswer", "GradedAnswer",
    "QUESTION_TYPES", "SKILLS",
    "QUESTIONS", "GROUP", "LESSON",
    "grade", "summarize",
]
