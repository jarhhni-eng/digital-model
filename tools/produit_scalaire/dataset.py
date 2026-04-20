"""
Embedded dataset for the "Produit scalaire" lesson (Q1..Q12).

Used as a deterministic fallback when no .docx is provided, and as the
source of truth for correct answers, skill tags and question types.

Question id convention: T{type}-D{lesson}-Q{n}
  type   : 1 cours, 2 construction, 3 raisonnement
  lesson : 1  (produit scalaire)
"""
from __future__ import annotations
from .models import Question, Choice


LESSON_CODE = 1  # produit scalaire


def _mcq(letters_and_correct: list[tuple[str, str, bool]]) -> list[Choice]:
    return [Choice(letter=l, text=t, is_correct=c) for l, t, c in letters_and_correct]


def build_dataset() -> list[Question]:
    """Return the 12 canonical questions with skills, types and answers."""
    questions: list[Question] = []

    # Q1 — diagnostic self-report (not scored)
    questions.append(Question(
        id="T1-D1-Q1", number=1, type_code=1, lesson_code=LESSON_CODE,
        skill=None, is_diagnostic=True,
        stem=r"À quel degré te rappelles-tu la leçon du produit scalaire ?",
        choices=_mcq([
            ("A", r"J'ai tout oublié", False),
            ("B", r"Je me rappelle quelques parties", False),
            ("C", r"Je me rappelle bien", False),
            ("D", r"Je me rappelle tout", False),
        ]),
    ))

    # Q2 — définition du produit scalaire
    questions.append(Question(
        id="T1-D1-Q2", number=2, type_code=1, lesson_code=LESSON_CODE, skill="C1",
        stem=r"Le produit scalaire de deux vecteurs $\vec{U}$ et $\vec{V}$ est :",
        choices=_mcq([
            ("A", r"$\|\vec{U}\| \cdot \|\vec{V}\| \cdot \cos(\widehat{(\vec{U}, \vec{V})})$", True),
            ("B", r"$\|\vec{U}\| \cdot \|\vec{V}\| \cdot \sin(\widehat{(\vec{U}, \vec{V})})$", False),
            ("C", r"$\|\vec{U}\| \cdot \|\vec{V}\| \cdot \tan(\widehat{(\vec{U}, \vec{V})})$", False),
            ("D", r"J'ai oublié", False),
        ]),
    ))

    # Q3 — orthogonalité
    questions.append(Question(
        id="T1-D1-Q3", number=3, type_code=1, lesson_code=LESSON_CODE, skill="C1",
        stem=r"Deux vecteurs $\vec{U}$ et $\vec{V}$ sont orthogonaux si :",
        choices=_mcq([
            ("A", r"$\vec{U} \cdot \vec{V} = 0$", True),
            ("B", r"$\vec{U} \cdot \vec{V} = \vec{0}$", False),
            ("C", r"$\vec{U}$ et $\vec{V}$ sont nuls", False),
            ("D", r"J'ai oublié", False),
        ]),
    ))

    # Q4 — Al-Kashi (multi-correct: A and B)
    questions.append(Question(
        id="T1-D1-Q4", number=4, type_code=1, lesson_code=LESSON_CODE, skill="C3",
        stem=r"Théorème d'Al-Kashi — quels que soient les points $A, B, C$ :",
        choices=_mcq([
            ("A", r"$BC^2 = AB^2 + AC^2 - 2\, \vec{AB} \cdot \vec{AC}$", True),
            ("B", r"$AB^2 = CB^2 + CA^2 - 2\, \vec{CB} \cdot \vec{CA}$", True),
            ("C", r"J'ai oublié", False),
        ]),
    ))

    # Q5 — théorème de la médiane
    questions.append(Question(
        id="T1-D1-Q5", number=5, type_code=1, lesson_code=LESSON_CODE, skill="C3",
        stem=r"Soit $ABC$ un triangle et $D$ le milieu de $[BC]$ :",
        choices=_mcq([
            ("A", r"$AB^2 + AC^2 = \frac{1}{2}BC^2 + 2AD^2$", True),
            ("B", r"$AC^2 + BC^2 = \frac{1}{2}AB^2 + 2BD^2$", False),
            ("C", r"J'ai oublié", False),
        ]),
    ))

    # Q6 — lecture de coordonnées (construction)
    questions.append(Question(
        id="T2-D1-Q6", number=6, type_code=2, lesson_code=LESSON_CODE, skill="C1",
        stem=(r"Dans la figure 2, déterminer les coordonnées des points "
              r"$B(\ ;\ )$, $C(\ ;\ )$, $D(\ ;\ )$, $E(\ ;\ )$, $F(\ ;\ )$, $G(\ ;\ )$."),
        image="images/q6_figure2.png",
        expected_text=r"B, C, D, E, F, G — coordonnées lues sur la figure 2.",
    ))

    # Q7 — coordonnées de vecteurs
    questions.append(Question(
        id="T2-D1-Q7", number=7, type_code=2, lesson_code=LESSON_CODE, skill="C1",
        stem=r"Déterminer les coordonnées des vecteurs $\vec{U}, \vec{V}, \vec{a}, \vec{W}$ :",
        expected_text=r"$\vec{U}(4,4)$, $\vec{V}(2,0)$, $\vec{a}(3,2)$, $\vec{W}(1,3)$",
    ))

    # Q8 — normes
    questions.append(Question(
        id="T2-D1-Q8", number=8, type_code=2, lesson_code=LESSON_CODE, skill="C1",
        stem=(r"Calculer les normes $\|\vec{U}\|, \|\vec{V}\|, \|\vec{W}\|, \|\vec{a}\|$ "
              r"avec $\|\vec{U}\| = \sqrt{(x_B - x_O)^2 + (y_B - y_O)^2}$."),
        expected_text=(r"$\|\vec{U}\| = \sqrt{32} = 4\sqrt{2}$, "
                       r"$\|\vec{V}\| = 2$, $\|\vec{W}\| = \sqrt{10}$, "
                       r"$\|\vec{a}\| = \sqrt{13}$"),
    ))

    # Q9 — produit scalaire géométrique
    questions.append(Question(
        id="T3-D1-Q9", number=9, type_code=3, lesson_code=LESSON_CODE, skill="C2",
        stem=r"Calculer $\vec{U} \cdot \vec{V} = \|\vec{OB}\| \cdot \|\vec{OC}\| \cdot \cos(\widehat{(\vec{OB}, \vec{OC})})$ :",
        choices=_mcq([
            ("A", r"$8$", True),
            ("B", r"$-8$", False),
            ("C", r"$10$", False),
        ]),
    ))

    # Q10 — produit scalaire analytique
    questions.append(Question(
        id="T3-D1-Q10", number=10, type_code=3, lesson_code=LESSON_CODE, skill="C2",
        stem=r"Produit scalaire analytique : $\vec{a} \cdot \vec{W} = ?$",
        choices=_mcq([
            ("A", r"$8$", True),
            ("B", r"$-8$", False),
            ("C", r"$9$", False),
        ]),
    ))

    # Q11 — Al-Kashi appliqué (raisonnement) — TCM: cos + produit scalaire
    questions.append(Question(
        id="T3-D1-Q11", number=11, type_code=3, lesson_code=LESSON_CODE, skill="C3",
        stem=(r"Soit $ABC$ un triangle tel que $AB = 6$, $AC = 5$, $BC = 7$. "
              r"Vérifier que $\cos(\widehat{BAC}) = \frac{1}{5}$, puis calculer $\vec{AB} \cdot \vec{AC}$."),
        choices=_mcq([
            ("A", r"$\cos(\widehat{BAC}) = \dfrac{1}{5}$ \; et \; $\vec{AB}\cdot\vec{AC}=6$", True),
            ("B", r"$\cos(\widehat{BAC}) = \dfrac{2}{5}$ \; et \; $\vec{AB}\cdot\vec{AC}=12$", False),
            ("C", r"$\cos(\widehat{BAC}) = -\dfrac{1}{5}$ \; et \; $\vec{AB}\cdot\vec{AC}=-6$", False),
        ]),
        expected_text=r"$\vec{AB}\cdot\vec{AC} = AB \cdot AC \cdot \cos(\widehat{BAC}) = 6 \cdot 5 \cdot \tfrac{1}{5} = 6$",
    ))

    # Q12 — déduction
    questions.append(Question(
        id="T3-D1-Q12", number=12, type_code=3, lesson_code=LESSON_CODE, skill="C3",
        stem=r"Déduire $\vec{BA} \cdot \vec{BC}$.",
        image="images/q12_figure.png",
        choices=_mcq([
            ("A", r"$\vec{BA}\cdot\vec{BC} = \dfrac{AB^2 + BC^2 - AC^2}{2} = \dfrac{36+49-25}{2} = 30$", True),
            ("B", r"$\vec{BA}\cdot\vec{BC} = 15$", False),
            ("C", r"$\vec{BA}\cdot\vec{BC} = -30$", False),
        ]),
        expected_text=r"$\vec{BA}\cdot\vec{BC} = 30$ (via Al-Kashi appliqué en $B$).",
    ))

    return questions
