"""Canonical Geometry-in-Space dataset.

Mirrors the Q1 → Q18 questions from the source `.docx` (plus a diagnostic
self-assessment "Mesure 1"). Skill labels (C1/C2/C3) and per-choice truth
markers are stored here — but the Streamlit UI hides them.

Naming convention: G{group}-D{lesson}-Q{number}.
Example: G1-D3-Q5.
"""

from __future__ import annotations
from .models import Question, Choice

# Group / lesson identifiers used to build the canonical code.
GROUP = 1
LESSON = 3

def _code(n: int | str) -> str:
    return f"G{GROUP}-D{LESSON}-Q{n}"


QUESTIONS: list[Question] = [
    # ── Diagnostic (Mesure 1) ───────────────────────────────────────────────
    Question(
        code=_code(0),
        number=0,
        skill=None,
        type_code=1,
        text=(
            "Est-ce que tu trouves une difficulté dans la reconnaissance "
            "des formes géométriques 3D dans l'espace ?"
        ),
        choices=[Choice("Oui"), Choice("Non")],
        is_diagnostic=True,
    ),

    # ── Q1 ──────────────────────────────────────────────────────────────────
    Question(
        code=_code(1), number=1, skill="C1", type_code=1,
        text=(
            r"Par trois points $A$, $B$, $C$ non alignés de l'espace $(E)$ "
            r"passe :"
        ),
        choices=[
            Choice(r"un plan et un seul, noté $(ABC)$", correct=True),
            Choice(r"deux plans"),
            Choice(r"trois plans différents"),
        ],
    ),

    # ── Q2 ──────────────────────────────────────────────────────────────────
    Question(
        code=_code(2), number=2, skill="C1", type_code=1,
        text=(
            r"$A$ et $B$ sont deux points distincts d'un plan $(P)$. "
            r"Alors la droite $(AB)$ :"
        ),
        choices=[
            Choice(r"est incluse dans le plan $(P)$", correct=True),
            Choice(r"est orthogonale au plan $(P)$"),
            Choice(r"est parallèle au plan $(P)$", correct=True),
        ],
        is_multi=True,
    ),

    # ── Q3 ──────────────────────────────────────────────────────────────────
    Question(
        code=_code(3), number=3, skill="C2", type_code=1,
        text=(
            r"$(P)$ et $(P')$ sont deux plans distincts. Si $A$ est commun "
            r"aux deux plans, alors :"
        ),
        choices=[
            Choice(r"$(P)$ et $(P')$ se coupent suivant une droite passant "
                   r"par $A$", correct=True),
            Choice(r"$(P)$ et $(P')$ se coupent en $A$ uniquement"),
        ],
    ),

    # ── Q4 ──────────────────────────────────────────────────────────────────
    Question(
        code=_code(4), number=4, skill="C2", type_code=1,
        text=(
            r"Si $(D)$ et $(D')$ sont parallèles et $(\Delta)$ est parallèle "
            r"à l'une d'elles, alors :"
        ),
        choices=[
            Choice(r"$(\Delta)$ est parallèle à l'autre", correct=True),
            Choice(r"$(\Delta)$ est perpendiculaire à l'autre"),
            Choice(r"$(\Delta)$ est sécante à l'autre"),
        ],
    ),

    # ── Q5 ──────────────────────────────────────────────────────────────────
    Question(
        code=_code(5), number=5, skill="C2", type_code=1,
        text=(
            r"Si $(\Delta)$ est parallèle à $(D)$ et à $(D')$, alors :"
        ),
        choices=[
            Choice(r"$(D)$ et $(D')$ sont parallèles", correct=True),
            Choice(r"$(D)$ et $(D')$ ne sont pas parallèles"),
            Choice(r"$(D)$ et $(D')$ sont perpendiculaires"),
        ],
    ),

    # ── Q6 — figure ─────────────────────────────────────────────────────────
    Question(
        code=_code(6), number=6, skill="C1", type_code=1,
        text=(
            r"Si deux plans sont parallèles, quelle figure représente "
            r"correctement cette propriété ?"
        ),
        choices=[
            Choice(r"Figure 1", correct=True),
            Choice(r"Figure 2"),
            Choice(r"Figure 3"),
        ],
        figure_path="figures/q6_two_parallel_planes.png",
    ),

    # ── Q7 ──────────────────────────────────────────────────────────────────
    Question(
        code=_code(7), number=7, skill="C2", type_code=1,
        text=(
            r"Une droite $(D)$ est parallèle à un plan $(P)$ si :"
        ),
        choices=[
            Choice(r"$(D)$ est parallèle à toute droite du plan $(P)$",
                   correct=True),
            Choice(r"$(D)$ est parallèle à une seule droite du plan $(P)$"),
            Choice(r"$(D)$ est incluse dans le plan $(P)$", correct=True),
        ],
        is_multi=True,
    ),

    # ── Q8 ──────────────────────────────────────────────────────────────────
    Question(
        code=_code(8), number=8, skill="C2", type_code=1,
        text=(
            r"Si deux plans $(P)$ et $(P')$ sont parallèles :"
        ),
        choices=[
            Choice(r"toute droite qui coupe $(P)$ coupe $(P')$",
                   correct=True),
            Choice(r"toute droite orthogonale à $(P)$ est orthogonale à "
                   r"$(P')$", correct=True),
            Choice(r"toute droite ne coupe que $(P)$"),
        ],
        is_multi=True,
    ),

    # ── Q9 — figure ─────────────────────────────────────────────────────────
    Question(
        code=_code(9), number=9, skill="C2", type_code=2,
        text=(
            r"Deux plans parallèles coupés par un troisième plan déterminent "
            r"deux droites parallèles. Quelles figures représentent "
            r"correctement la propriété ?"
        ),
        choices=[
            Choice(r"Figure 1", correct=True),
            Choice(r"Figure 2", correct=True),
            Choice(r"Figure 3"),
        ],
        is_multi=True,
        figure_path="figures/q9_secant_plane.png",
    ),

    # ── Q10 ─────────────────────────────────────────────────────────────────
    Question(
        code=_code(10), number=10, skill="C3", type_code=2,
        text=(
            r"Si une droite $(D)$ est parallèle à deux plans sécants suivant "
            r"$(\Delta)$, alors $(D)$ est :"
        ),
        choices=[
            Choice(r"parallèle à $(\Delta)$", correct=True),
            Choice(r"perpendiculaire à $(\Delta)$"),
            Choice(r"sécante à $(\Delta)$"),
        ],
    ),

    # ── Q11 ─────────────────────────────────────────────────────────────────
    Question(
        code=_code(11), number=11, skill="C2", type_code=2,
        text=(
            r"Si deux droites sont orthogonales :"
        ),
        choices=[
            Choice(r"toute droite parallèle à l'une est orthogonale à "
                   r"l'autre", correct=True),
            Choice(r"toute droite parallèle à l'une est parallèle à l'autre"),
            Choice(r"toute droite parallèle à l'une est sécante à l'autre"),
        ],
    ),

    # ── Q12 ─────────────────────────────────────────────────────────────────
    Question(
        code=_code(12), number=12, skill="C2", type_code=2,
        text=(
            r"Si deux droites sont parallèles et $(\Delta)$ est orthogonale "
            r"à l'une d'elles, alors $(\Delta)$ est :"
        ),
        choices=[
            Choice(r"parallèle à l'autre"),
            Choice(r"orthogonale à l'autre", correct=True),
            Choice(r"orthogonale à une seule"),
        ],
    ),

    # ── Q13 ─────────────────────────────────────────────────────────────────
    Question(
        code=_code(13), number=13, skill="C3", type_code=3,
        text=(
            r"Position relative possible de deux droites $(D)$ et $(D')$ "
            r"de l'espace :"
        ),
        choices=[
            Choice(r"sécantes", correct=True),
            Choice(r"coplanaires", correct=True),
            Choice(r"incluses l'une dans l'autre"),
        ],
        is_multi=True,
    ),

    # ── Q14 ─────────────────────────────────────────────────────────────────
    Question(
        code=_code(14), number=14, skill="C3", type_code=3,
        text=(
            r"Position relative entre une droite $(D)$ et un plan $(P)$ : "
            r"$(D)$ est parallèle à $(P)$ si :"
        ),
        choices=[
            Choice(r"elles sont parallèles entre elles"),
            Choice(r"elles sont incluses"),
            Choice(r"$(D)$ est parallèle à toute droite du plan $(P)$",
                   correct=True),
        ],
    ),

    # ── Q15 ─────────────────────────────────────────────────────────────────
    Question(
        code=_code(15), number=15, skill="C3", type_code=3,
        text=(
            r"Si $(D) \perp (P)$ et $(D')$ est une droite incluse dans "
            r"$(P)$, alors :"
        ),
        choices=[
            Choice(r"$(D)$ et $(D')$ sont parallèles"),
            Choice(r"$(D)$ et $(D')$ sont orthogonales", correct=True),
            Choice(r"$(D)$ est orthogonale à toute droite de $(P)$",
                   correct=True),
        ],
        is_multi=True,
    ),

    # ── Q16 ─────────────────────────────────────────────────────────────────
    Question(
        code=_code(16), number=16, skill="C3", type_code=3,
        text=(
            r"Position relative d'une droite $(D)$ et d'un plan $(P)$ "
            r"sécants :"
        ),
        choices=[
            Choice(r"$(D)$ coupe $(P)$ en un point", correct=True),
            Choice(r"$I$ est l'intersection de $(D)$ et $(P)$",
                   correct=True),
            Choice(r"$(D)$ est orthogonale à $(P)$"),
        ],
        is_multi=True,
    ),

    # ── Q17 ─────────────────────────────────────────────────────────────────
    Question(
        code=_code(17), number=17, skill="C3", type_code=3,
        text=(
            r"Si deux plans $(P)$ et $(P')$ sont parallèles :"
        ),
        choices=[
            Choice(r"$(P) \parallel (P')$", correct=True),
            Choice(r"toute droite de $(P')$ est parallèle à $(P)$",
                   correct=True),
            Choice(r"l'orthogonalité des droites est conservée",
                   correct=True),
        ],
        is_multi=True,
    ),

    # ── Q18 — figure ────────────────────────────────────────────────────────
    Question(
        code=_code(18), number=18, skill="C1", type_code=3,
        text=(
            r"D'après la figure ci-dessous, la position relative de $(D)$ "
            r"et $(P)$ est :"
        ),
        choices=[
            Choice(r"$(D) \parallel (P)$", correct=True),
            Choice(r"$(D) \subset (P)$"),
            Choice(r"$(D)$ et $(P)$ sont sécants"),
        ],
        figure_path="figures/q18_line_parallel_plane.png",
    ),
]
