"""
Canonical dataset — Produit scalaire & Géométrie analytique (1ère Bac).

27 questions répartis en :
  Partie I  (Type 1) : Q1 → Q9   — Questions du cours
  Partie II (Type 2) : Q10 → Q17 — Visualisation / Construction
  Partie III(Type 3) : Q18 → Q27 — Raisonnement déductif

Code convention : T{type}-D{lesson}-Q{n}
  type   : 1 (cours), 2 (construction), 3 (raisonnement)
  lesson : 1 (produit scalaire), 2 (géométrie analytique)

Skills (C1 → C6) and per-choice truth markers are stored here but the
student-facing UI hides them.
"""
from __future__ import annotations
from .models import Question, Choice


def _mcq(rows: list[tuple[str, str, bool]]) -> list[Choice]:
    return [Choice(letter=l, text=t, is_correct=c) for l, t, c in rows]


def _q(
    n: int, type_code: int, lesson_code: int, skill: str | None,
    stem: str, choices: list[Choice] | None = None,
    image: str | None = None, expected_text: str | None = None,
    is_diagnostic: bool = False,
) -> Question:
    return Question(
        id=f"T{type_code}-D{lesson_code}-Q{n}",
        number=n, type_code=type_code, lesson_code=lesson_code, skill=skill,
        stem=stem,
        choices=choices or [],
        image=image,
        expected_text=expected_text,
        is_diagnostic=is_diagnostic,
    )


def build_dataset() -> list[Question]:
    qs: list[Question] = []

    # ═══ Partie I — Cours ════════════════════════════════════════════════════
    qs.append(_q(
        1, 1, 1, None,
        r"À quel degré te rappelles-tu la leçon du produit scalaire ?",
        _mcq([
            ("A", r"J'ai tout oublié", False),
            ("B", r"Je me rappelle quelques parties", False),
            ("C", r"Je me rappelle bien", False),
            ("D", r"Je me rappelle tout", False),
        ]),
        is_diagnostic=True,
    ))

    qs.append(_q(
        2, 1, 1, "C1",
        r"Le produit scalaire de $\vec{U}(a,c)$ et $\vec{V}(b,d)$ est :",
        _mcq([
            ("A", r"$\|\vec{U}\|\,\|\vec{V}\|\cos(\widehat{(\vec{U},\vec{V})})$", True),
            ("B", r"$\|\vec{U}\|\,\|\vec{V}\|\sin(\widehat{(\vec{U},\vec{V})})$", False),
            ("C", r"$ab + cd$", True),
            ("D", r"J'ai oublié", False),
        ]),
    ))

    qs.append(_q(
        3, 1, 1, "C1",
        r"Si l'un des vecteurs $\vec{U}$, $\vec{V}$ est nul :",
        _mcq([
            ("A", r"$\vec{U} \cdot \vec{V} = 0$", True),
            ("B", r"$\vec{U} \cdot \vec{V} = \vec{0}$", False),
            ("C", r"$\vec{U}$ et $\vec{V}$ sont orthogonaux", False),
            ("D", r"J'ai oublié", False),
        ]),
    ))

    qs.append(_q(
        4, 1, 1, "C1",
        r"Si $\vec{U} \perp \vec{V}$, alors :",
        _mcq([
            ("A", r"$\vec{U} \cdot \vec{V} = 0$", True),
            ("B", r"$\vec{U} \cdot \vec{V} = \vec{0}$", False),
            ("C", r"$\vec{U}$ ou $\vec{V}$ est nul", False),
            ("D", r"J'ai oublié", False),
        ]),
    ))

    qs.append(_q(
        5, 1, 1, "C3",
        r"Théorème d'Al-Kashi — quelles formules sont correctes ?",
        _mcq([
            ("A", r"$BC^2 = AB^2 + AC^2 - 2\,\vec{AB}\cdot\vec{AC}$", True),
            ("B", r"$AB^2 = CB^2 + CA^2 - 2\,\vec{CB}\cdot\vec{CA}$", True),
            ("C", r"J'ai oublié", False),
        ]),
    ))

    qs.append(_q(
        6, 1, 1, "C3",
        r"Soit $I$ milieu de $[BC]$. Théorème de la médiane :",
        _mcq([
            ("A", r"$AB^2 + AC^2 = \tfrac{1}{2}BC^2 + 2AI^2$", True),
            ("B", r"$AC^2 + BC^2 = \tfrac{1}{2}AB^2 + 2BI^2$", False),
            ("C", r"J'ai oublié", False),
        ]),
    ))

    qs.append(_q(
        7, 1, 1, "C1",
        r"Soient $\vec{U}(a,b)$ et $\vec{V}(c,d)$. Alors $\det(\vec{U},\vec{V}) =$",
        _mcq([
            ("A", r"$ac - bd$", False),
            ("B", r"$ab - bc$", False),
            ("C", r"$ad - bc$", True),
        ]),
    ))

    qs.append(_q(
        8, 1, 2, "C1",
        r"$M(x,y)$ appartient au cercle de centre $\Omega(x_0,y_0)$ et de rayon 3 ssi :",
        _mcq([
            ("A", r"$(x-x_0)^2 + (y-y_0)^2 = 3$", False),
            ("B", r"$(x-x_0)^2 + (y-y_0)^2 = 9$", True),
            ("C", r"$x^2 + y^2 = 2x + 2y + 9$", False),
            ("D", r"J'ai oublié", False),
        ]),
    ))

    qs.append(_q(
        9, 1, 2, "C1",
        r"Distance entre $\Omega(3,4)$ et la droite d'équation $ax+by+c=0$ :",
        _mcq([
            ("A", r"$\dfrac{|4a+3b+c|}{\sqrt{a^2+b^2}}$", False),
            ("B", r"$\dfrac{|3a+4b+c|}{\sqrt{a^2+c^2}}$", False),
            ("C", r"$\dfrac{|3a+4b+c|}{\sqrt{a^2+b^2}}$", True),
            ("D", r"J'ai oublié", False),
        ]),
    ))

    # ═══ Partie II — Visualisation / Construction ═══════════════════════════
    qs.append(_q(
        10, 2, 2, "C2",
        r"Lire les coordonnées des points sur la figure : $B,\ C,\ D,\ E,\ F$.",
        image="figures/q10_points.png",
        expected_text=r"$B(4,4)$, $C(3,0)$, $D(9,3)$, $E(10,6)$, $F(12,5)$",
    ))

    qs.append(_q(
        11, 2, 1, "C2",
        r"Lire les coordonnées des vecteurs $\vec{U},\ \vec{V},\ \vec{a},\ \vec{w}$.",
        image="figures/q11_vectors.png",
        expected_text=r"$\vec{U}(4,4)$, $\vec{V}(2,0)$, $\vec{a}(3,2)$, $\vec{w}(1,3)$",
    ))

    qs.append(_q(
        12, 2, 1, "C2",
        r"Calculer $\vec{U}\cdot\vec{V}$ à partir des coordonnées lues sur la figure :",
        _mcq([
            ("A", r"$8$", True),
            ("B", r"$-8$", False),
            ("C", r"$10$", False),
        ]),
        image="figures/q11_vectors.png",
    ))

    qs.append(_q(
        13, 2, 1, "C6",
        r"Calculer $\cos(\widehat{(\vec{a},\vec{w})})$ :",
        _mcq([
            ("A", r"$\dfrac{9}{\sqrt{34}}$", True),
            ("B", r"$\dfrac{9\sqrt{34}}{34}$", False),
            ("C", r"$\dfrac{3}{\sqrt{34}}$", False),
        ]),
        image="figures/q11_vectors.png",
    ))

    qs.append(_q(
        14, 2, 2, "C5",
        r"Équation de la droite $(BC)$ :",
        _mcq([
            ("A", r"$x - y = 0$", True),
            ("B", r"$x + y = 0$", False),
            ("C", r"$x - 2y = 0$", False),
        ]),
        image="figures/q10_points.png",
    ))

    qs.append(_q(
        15, 2, 1, "C6",
        r"Calculer $\vec{a}\cdot\vec{w}$ :",
        _mcq([
            ("A", r"$8$", False),
            ("B", r"$-8$", False),
            ("C", r"$9$", True),
        ]),
        image="figures/q11_vectors.png",
    ))

    qs.append(_q(
        16, 2, 2, "C5",
        r"Vecteur directeur de la droite $(EF)$ :",
        _mcq([
            ("A", r"$(1,3)$", False),
            ("B", r"$(3,2)$", False),
            ("C", r"$(2,0)$", False),
            ("D", r"$(2,-1)$", True),  # construction-corrected
        ]),
        image="figures/q10_points.png",
    ))

    qs.append(_q(
        17, 2, 2, "C5",
        r"Tracer la droite d'équation $x + y - 1 = 0$.",
        expected_text=r"Droite passant par $(1,0)$ et $(0,1)$, pente $-1$.",
    ))

    # ═══ Partie III — Raisonnement déductif ═════════════════════════════════
    # Données : Δ : 2x − 3y + 2 = 0,  A(2, −3)
    qs.append(_q(
        18, 3, 2, "C5",
        (r"On considère $\Delta:\ 2x - 3y + 2 = 0$ et $A(2,-3)$. "
         r"Compléter le tableau de valeurs de $\Delta$ pour $x \in \{-1,0,1,2\}$."),
        expected_text=(r"$x = -1 \Rightarrow y = 0$ ; $x = 0 \Rightarrow y = \tfrac{2}{3}$ ; "
                       r"$x = 1 \Rightarrow y = \tfrac{4}{3}$ ; $x = 2 \Rightarrow y = 2$."),
    ))

    qs.append(_q(
        19, 3, 2, "C5",
        r"Tracer la droite $\Delta:\ 2x - 3y + 2 = 0$ dans un repère orthonormé.",
        expected_text=r"Droite de pente $\tfrac{2}{3}$, passant par $(-1,0)$ et $(2,2)$.",
    ))

    qs.append(_q(
        20, 3, 2, "C5",
        r"Distance de $A(2,-3)$ à $\Delta:\ 2x - 3y + 2 = 0$ :",
        _mcq([
            ("A", r"$\dfrac{15}{\sqrt{13}}$", True),
            ("B", r"$\dfrac{13}{\sqrt{15}}$", False),
            ("C", r"$\dfrac{15\sqrt{13}}{13}$", True),
            ("D", r"Je ne sais pas", False),
        ]),
    ))

    qs.append(_q(
        21, 3, 2, "C5",
        r"Équation de la droite passant par l'origine et perpendiculaire à $\Delta$ :",
        _mcq([
            ("A", r"$x + 2y = 0$", False),
            ("B", r"$3x + 2y = 0$", True),
            ("C", r"$y = -\tfrac{3}{2}$", False),
            ("D", r"Je ne sais pas", False),
        ]),
    ))

    qs.append(_q(
        22, 3, 2, "C5",
        r"Représentation paramétrique de $\Delta$ passant par $(2,2)$ :",
        _mcq([
            ("A", r"$\begin{cases}x = 2 + 3t \\ y = 3 + 2t\end{cases}$", False),
            ("B", r"$\begin{cases}x = 2 + 3t \\ y = 2 + 2t\end{cases}$", True),
            ("C", r"$\begin{cases}x = 3 + 3t \\ y = 2 + 2t\end{cases}$", False),
            ("D", r"Je ne sais pas", False),
        ]),
    ))

    qs.append(_q(
        23, 3, 2, "C5",
        r"Coordonnées du projeté orthogonal $H$ de $A(2,-3)$ sur $\Delta$ :",
        _mcq([
            ("A", r"$(6/13,\,-4/13)$", False),
            ("B", r"$(-4/13,\,-6/13)$", False),
            ("C", r"$(-4/13,\,6/13)$", True),
            ("D", r"Je ne sais pas", False),
        ]),
    ))

    qs.append(_q(
        24, 3, 2, "C5",
        r"Déterminer le symétrique $A'$ de $A$ par rapport à $\Delta$.",
        expected_text=r"$A' = 2H - A$ avec $H(-4/13,\,6/13)$, soit $A'(-34/13,\,51/13)$.",
    ))

    qs.append(_q(
        25, 3, 2, "C4",
        r"Cercle de centre $\Omega(2,-1)$ et de rayon $5$. Quelles équations le décrivent ?",
        _mcq([
            ("A", r"$(x-2)^2 + (y+1)^2 = 25$", True),
            ("B", r"$x^2 + y^2 - 4x + 2y - 20 = 0$", True),
            ("C", r"$(x+2)^2 + (y-1)^2 = 25$", False),
        ]),
    ))

    qs.append(_q(
        26, 3, 2, "C4",
        r"Soit le cercle $x^2 + y^2 + 4x - 4y - 8 = 0$. Centre et rayon :",
        _mcq([
            ("A", r"centre $(2,-2)$, rayon $4$", False),
            ("B", r"centre $(-2,2)$, rayon $4$", True),
            ("C", r"centre $(2,-2)$, rayon $16$", False),
            ("D", r"Je ne sais pas", False),
        ]),
    ))

    qs.append(_q(
        27, 3, 2, "C3",
        r"Cercle de diamètre $[AB]$ avec $A(-3,2)$ et $B(5,2)$. Équation :",
        _mcq([
            ("A", r"$x^2 + y^2 - 2x + 4y - 16 = 0$", False),
            ("B", r"$x^2 + y^2 - 2x + 2y - 21 = 0$", False),
            ("C", r"$x^2 + y^2 - 2x - 4y - 11 = 0$", True),
            ("D", r"$x^2 + y^2 - 2x + 4y - 21 = 0$", False),
        ]),
    ))

    return qs
