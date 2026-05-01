"""
Embedded dataset for the "Droite dans le plan" lesson.

Used as a deterministic fallback when no .docx is provided and as the
source of truth for correct answers, skill tags and question types.

Question id convention: T{type}-D{lesson}-Q{n}
  type   : 1 cours, 2 construction, 3 raisonnement
  lesson : 2  (droite dans le plan)

Test context (from spec):
  (Δ): 2x - 3y + 2 = 0
  A(2, -3)
"""
from __future__ import annotations
from .models import Question, Choice


LESSON_CODE = 2  # droite dans le plan


def _mcq(items: list[tuple[str, str, bool]]) -> list[Choice]:
    return [Choice(letter=l, text=t, is_correct=c) for l, t, c in items]


def build_dataset(repere_image: str | None = None) -> list[Question]:
    """Return the canonical questions for the lesson."""
    questions: list[Question] = []

    # ─── Partie I — Cours (Q1..Q5) ──────────────────────────────────────────

    # Q1 — diagnostic self-report (not scored)
    questions.append(Question(
        id="T1-D2-Q1", number=1, type_code=1, lesson_code=LESSON_CODE,
        skill=None, is_diagnostic=True,
        stem=r"À quel degré te rappelles-tu la leçon « Droite dans le plan » ?",
        choices=_mcq([
            ("A", r"J'ai tout oublié", False),
            ("B", r"Je me rappelle quelques parties", False),
            ("C", r"Je me rappelle bien", False),
            ("D", r"Je me rappelle tout", False),
        ]),
    ))

    # Q2 — uses a repère orthonormé for the student to plot / represent a line
    q2 = Question(
        id="T1-D2-Q2", number=2, type_code=1, lesson_code=LESSON_CODE, skill="C1",
        stem=(r"Dans le repère orthonormé $(O, \vec{i}, \vec{j})$ ci-dessous, "
              r"placer les points $A(2,\,-3)$, $B(-1,\,0)$ et $C(0,\,2)$, "
              r"puis tracer la droite $(\Delta)$ d'équation $2x - 3y + 2 = 0$."),
        image=repere_image,  # repère PNG generated at runtime
        expected_text=(r"Points correctement placés sur la grille ; la droite $(\Delta)$ "
                       r"passe par $(-1, 0)$ et $(2, 2)$ (pente $\tfrac{2}{3}$)."),
    )
    questions.append(q2)

    # Q3 — équation cartésienne (4 choices)
    questions.append(Question(
        id="T1-D2-Q3", number=3, type_code=1, lesson_code=LESSON_CODE, skill="C1",
        stem=(r"Toute droite du plan admet une équation cartésienne de la forme :"),
        choices=_mcq([
            ("A", r"$ax + by + c = 0$ avec $(a,b) \neq (0,0)$", True),
            ("B", r"$y = ax^2 + bx + c$", False),
            ("C", r"$ax + by = 0$ uniquement", False),
            ("D", r"$\dfrac{x}{a} + \dfrac{y}{b} = 1$ uniquement", False),
        ]),
    ))

    # Q4 — vecteur directeur
    questions.append(Question(
        id="T1-D2-Q4", number=4, type_code=1, lesson_code=LESSON_CODE, skill="C1",
        stem=(r"Un vecteur directeur de la droite d'équation $ax + by + c = 0$ est :"),
        choices=_mcq([
            ("A", r"$\vec{u}(-b,\,a)$", True),
            ("B", r"$\vec{u}(a,\,b)$", False),
            ("C", r"$\vec{u}(b,\,a)$", False),
            ("D", r"$\vec{u}(a,\,-b)$", False),
        ]),
    ))

    # Q5 — coefficient directeur (pente)
    questions.append(Question(
        id="T1-D2-Q5", number=5, type_code=1, lesson_code=LESSON_CODE, skill="C1",
        stem=(r"Si $b \neq 0$, le coefficient directeur (pente) de la droite d'équation "
              r"$ax + by + c = 0$ est :"),
        choices=_mcq([
            ("A", r"$m = -\dfrac{a}{b}$", True),
            ("B", r"$m = \dfrac{a}{b}$", False),
            ("C", r"$m = -\dfrac{b}{a}$", False),
            ("D", r"$m = \dfrac{b}{a}$", False),
        ]),
    ))

    # ─── Partie II — Construction (Q6..Q8) ──────────────────────────────────

    # Q6 — équation réduite de (Δ): 2x - 3y + 2 = 0
    questions.append(Question(
        id="T2-D2-Q6", number=6, type_code=2, lesson_code=LESSON_CODE, skill="C1",
        stem=r"Mettre la droite $(\Delta)$ : $2x - 3y + 2 = 0$ sous forme réduite $y = mx + p$ :",
        choices=_mcq([
            ("A", r"$y = \dfrac{2}{3}x + \dfrac{2}{3}$", True),
            ("B", r"$y = \dfrac{3}{2}x + 1$", False),
            ("C", r"$y = -\dfrac{2}{3}x + \dfrac{2}{3}$", False),
            ("D", r"$y = \dfrac{2}{3}x - \dfrac{2}{3}$", False),
        ]),
    ))

    # Q7 — vecteur directeur / normal de (Δ)
    questions.append(Question(
        id="T2-D2-Q7", number=7, type_code=2, lesson_code=LESSON_CODE, skill="C1",
        stem=(r"Pour $(\Delta)$ : $2x - 3y + 2 = 0$, un vecteur directeur $\vec{u}$ et un "
              r"vecteur normal $\vec{n}$ sont :"),
        choices=_mcq([
            ("A", r"$\vec{u}(3,\,2)$ et $\vec{n}(2,\,-3)$", True),
            ("B", r"$\vec{u}(2,\,-3)$ et $\vec{n}(3,\,2)$", False),
            ("C", r"$\vec{u}(-2,\,3)$ et $\vec{n}(3,\,2)$", False),
            ("D", r"$\vec{u}(2,\,3)$ et $\vec{n}(-3,\,2)$", False),
        ]),
    ))

    # Q8 — équation d'une droite passant par A(2,-3) de pente 2/3
    questions.append(Question(
        id="T2-D2-Q8", number=8, type_code=2, lesson_code=LESSON_CODE, skill="C1",
        stem=(r"Équation de la droite passant par $A(2,\,-3)$ et de coefficient directeur "
              r"$m = \tfrac{2}{3}$ :"),
        choices=_mcq([
            ("A", r"$y = \dfrac{2}{3}x - \dfrac{13}{3}$", True),
            ("B", r"$y = \dfrac{2}{3}x - 3$", False),
            ("C", r"$y = \dfrac{2}{3}x + \dfrac{13}{3}$", False),
            ("D", r"$y = -\dfrac{2}{3}x - \dfrac{13}{3}$", False),
        ]),
    ))

    # ─── Partie III — Raisonnement (Q9..Q12) ────────────────────────────────

    # Q9 — le point A(2,-3) appartient-il à (Δ) ?
    questions.append(Question(
        id="T3-D2-Q9", number=9, type_code=3, lesson_code=LESSON_CODE, skill="C2",
        stem=(r"Le point $A(2,\,-3)$ appartient-il à la droite $(\Delta)$ d'équation "
              r"$2x - 3y + 2 = 0$ ?"),
        choices=_mcq([
            ("A", r"Oui, car $2(2) - 3(-3) + 2 = 15 \neq 0$", False),
            ("B", r"Non, car $2(2) - 3(-3) + 2 = 15 \neq 0$", True),
            ("C", r"Oui, car $A$ a une abscisse positive", False),
            ("D", r"On ne peut pas conclure", False),
        ]),
    ))

    # Q10 — colinéarité / parallélisme
    questions.append(Question(
        id="T3-D2-Q10", number=10, type_code=3, lesson_code=LESSON_CODE, skill="C2",
        stem=(r"Parmi les droites suivantes, laquelle est parallèle à $(\Delta)$ : "
              r"$2x - 3y + 2 = 0$ ?"),
        choices=_mcq([
            ("A", r"$4x - 6y + 7 = 0$", True),
            ("B", r"$3x + 2y - 1 = 0$", False),
            ("C", r"$2x + 3y + 2 = 0$", False),
            ("D", r"$x - y + 1 = 0$", False),
        ]),
    ))

    # Q11 — droite perpendiculaire à (Δ) passant par A(2,-3)
    questions.append(Question(
        id="T3-D2-Q11", number=11, type_code=3, lesson_code=LESSON_CODE, skill="C2",
        stem=(r"Équation de la droite $(\Delta')$ passant par $A(2,\,-3)$ et perpendiculaire "
              r"à $(\Delta)$ : $2x - 3y + 2 = 0$ :"),
        choices=_mcq([
            ("A", r"$3x + 2y = 0$", True),
            ("B", r"$2x - 3y - 13 = 0$", False),
            ("C", r"$3x - 2y - 12 = 0$", False),
            ("D", r"$2x + 3y + 5 = 0$", False),
        ]),
    ))

    # Q12 — distance du point A(2,-3) à la droite (Δ)
    questions.append(Question(
        id="T3-D2-Q12", number=12, type_code=3, lesson_code=LESSON_CODE, skill="C2",
        stem=(r"Distance du point $A(2,\,-3)$ à la droite $(\Delta)$ : $2x - 3y + 2 = 0$, "
              r"donnée par $d(A, \Delta) = \dfrac{|2x_A - 3y_A + 2|}{\sqrt{2^2 + 3^2}}$ :"),
        choices=_mcq([
            ("A", r"$d = \dfrac{15}{\sqrt{13}} = \dfrac{15\sqrt{13}}{13}$", True),
            ("B", r"$d = \dfrac{15}{\sqrt{5}}$", False),
            ("C", r"$d = \dfrac{13}{\sqrt{15}}$", False),
            ("D", r"$d = 15$", False),
        ]),
        expected_text=(r"$d(A, \Delta) = \dfrac{|2\cdot 2 - 3\cdot(-3) + 2|}{\sqrt{13}} "
                       r"= \dfrac{15}{\sqrt{13}} = \dfrac{15\sqrt{13}}{13}$"),
    ))

    return questions
