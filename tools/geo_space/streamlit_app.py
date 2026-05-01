"""Streamlit interface for the Geometry-in-Space cognitive assessment.

Run with:
    streamlit run tools/geo_space/streamlit_app.py

Features
--------
* One question per screen (Next / Previous / "Je ne sais pas")
* KaTeX math rendering via st.markdown(..., unsafe_allow_html=True)
  with the official KaTeX CDN (auto-render extension)
* Optional shuffle of questions and answers
* Optional countdown timer per question
* Progress bar
* Hides skill (C1/C2/C3) and truth markers from the UI
* Final score + per-skill analytics + CSV export
"""

from __future__ import annotations
import csv
import io
import random
import time
from dataclasses import asdict
from pathlib import Path

import streamlit as st

from .dataset import QUESTIONS
from .models import StudentAnswer
from .scoring import grade, summarize
from .docx_export import export_student_docx

# ─── KaTeX rendering ────────────────────────────────────────────────────────
KATEX_HEAD = """
<link rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<script defer
        src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
<script defer
        src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"
        onload="renderMathInElement(document.body,{
            delimiters:[
                {left:'$$',right:'$$',display:true},
                {left:'$',right:'$',display:false},
                {left:'\\\\(',right:'\\\\)',display:false},
                {left:'\\\\[',right:'\\\\]',display:true}
            ],
            throwOnError:false
        });"></script>
"""


def latex_md(text: str) -> None:
    """Render a string with $...$ / \\(...\\) math via KaTeX in Streamlit."""
    st.markdown(KATEX_HEAD + text, unsafe_allow_html=True)


# ─── Session state setup ────────────────────────────────────────────────────
def init_state() -> None:
    defaults = {
        "started": False,
        "questions": list(QUESTIONS),
        "answers": {},  # code -> StudentAnswer
        "current": 0,
        "shuffle_q": False,
        "shuffle_a": False,
        "timer_s": 0,         # 0 = disabled
        "q_started_at": None,
        "submitted": False,
    }
    for k, v in defaults.items():
        st.session_state.setdefault(k, v)


def start_test() -> None:
    qs = list(QUESTIONS)
    if st.session_state.shuffle_q:
        random.shuffle(qs)

    if st.session_state.shuffle_a:
        for q in qs:
            order = list(range(len(q.choices)))
            random.shuffle(order)
            q.choices = [q.choices[i] for i in order]

    st.session_state.questions = qs
    st.session_state.answers = {}
    st.session_state.current = 0
    st.session_state.started = True
    st.session_state.submitted = False
    st.session_state.q_started_at = time.time()


# ─── Welcome screen ─────────────────────────────────────────────────────────
def render_welcome() -> None:
    st.title("Géométrie dans l'espace — Test interactif")
    st.markdown(
        "Bienvenue dans ce test cognitif sur la **géométrie dans l'espace**. "
        "Chaque question est présentée individuellement, avec une option « Je "
        "ne sais pas » et un bouton de validation. Aucun retour en arrière "
        "n'est obligatoire — vous pouvez naviguer librement."
    )

    with st.expander("Options"):
        st.session_state.shuffle_q = st.checkbox("Mélanger les questions",
                                                 value=False)
        st.session_state.shuffle_a = st.checkbox("Mélanger les réponses",
                                                 value=False)
        st.session_state.timer_s = st.number_input(
            "Minuteur par question (secondes ; 0 = désactivé)",
            min_value=0, max_value=600, value=0, step=10,
        )

    cols = st.columns(2)
    if cols[0].button("🚀 Commencer le test", type="primary"):
        start_test()
        st.rerun()

    if cols[1].button("📄 Exporter la version Word (élève)"):
        out = Path("geo_space_student.docx")
        export_student_docx(QUESTIONS, out)
        with open(out, "rb") as fh:
            st.download_button(
                "Télécharger geo_space_student.docx",
                data=fh.read(),
                file_name=out.name,
                mime=("application/vnd.openxmlformats-officedocument."
                      "wordprocessingml.document"),
            )


# ─── Question screen ────────────────────────────────────────────────────────
def render_question() -> None:
    qs = st.session_state.questions
    idx = st.session_state.current
    q = qs[idx]

    # Header & progress
    st.progress((idx + 1) / len(qs))
    st.caption(f"Question {idx + 1} / {len(qs)}  ·  Code {q.code}")

    if q.is_diagnostic:
        st.info("Auto-évaluation (non comptée dans le score).")

    # Stem
    latex_md(f"### {q.text}")

    # Figure
    if q.figure_path:
        fig = Path(__file__).parent / q.figure_path
        if fig.exists():
            st.image(str(fig), use_column_width=True)
        else:
            st.warning(f"Figure manquante : {q.figure_path}")

    # Choices
    prev = st.session_state.answers.get(q.code, StudentAnswer(code=q.code))
    selected: list[int] = []
    if q.is_multi or q.is_diagnostic:
        for i, c in enumerate(q.choices):
            checked = i in prev.selected
            if st.checkbox(
                f"{chr(ord('A') + i)}. {c.text}",
                value=checked,
                key=f"{q.code}-c{i}",
            ):
                selected.append(i)
    else:
        labels = [f"{chr(ord('A') + i)}. {c.text}" for i, c in enumerate(q.choices)]
        default = prev.selected[0] if prev.selected else None
        chosen = st.radio(
            "Réponse :",
            options=list(range(len(labels))),
            format_func=lambda i: labels[i],
            index=default if default is not None else 0,
            key=f"{q.code}-radio",
        )
        if not prev.selected:
            chosen = None  # don't auto-select unless the student picks
        if chosen is not None:
            selected = [chosen]

    # Don't-know toggle
    dont_know = st.checkbox("🤷 Je ne sais pas", value=prev.dont_know,
                            key=f"{q.code}-dk")

    # Persist on every interaction
    st.session_state.answers[q.code] = StudentAnswer(
        code=q.code,
        selected=selected if not dont_know else [],
        dont_know=dont_know,
        response_time_s=time.time() - (st.session_state.q_started_at or time.time()),
    )

    # Timer
    if st.session_state.timer_s > 0 and st.session_state.q_started_at:
        elapsed = time.time() - st.session_state.q_started_at
        remaining = max(0, st.session_state.timer_s - int(elapsed))
        st.caption(f"⏱ Temps restant : {remaining}s")
        if remaining == 0:
            _go_next()

    # Navigation
    cols = st.columns([1, 1, 1, 1])
    if cols[0].button("⬅ Précédent", disabled=idx == 0):
        _go_prev()
    if cols[1].button("Suivant ➡", disabled=idx >= len(qs) - 1):
        _go_next()
    if cols[3].button("✅ Terminer", type="primary"):
        st.session_state.submitted = True
        st.rerun()


def _go_prev() -> None:
    st.session_state.current = max(0, st.session_state.current - 1)
    st.session_state.q_started_at = time.time()
    st.rerun()


def _go_next() -> None:
    n = len(st.session_state.questions)
    st.session_state.current = min(n - 1, st.session_state.current + 1)
    st.session_state.q_started_at = time.time()
    st.rerun()


# ─── Results screen ─────────────────────────────────────────────────────────
def render_results() -> None:
    qs = st.session_state.questions
    by_code = {q.code: q for q in qs}
    graded = [
        grade(by_code[code], ans)
        for code, ans in st.session_state.answers.items()
    ]
    summary = summarize(qs, graded)

    st.title("Résultats")
    cols = st.columns(3)
    cols[0].metric("Score", f"{summary['correct']} / {summary['total']}")
    cols[1].metric("Pourcentage", f"{summary['score_pct']}%")
    cols[2].metric("Compétence la plus faible",
                   summary["weakest_skill"] or "—")

    st.subheader("Performance par compétence")
    for skill, info in summary["by_skill"].items():
        st.write(
            f"**{skill}** ({info['label']}) — "
            f"{info['correct']} / {info['total']} ({info['pct']}%)"
        )
        st.progress(info["pct"] / 100)

    st.subheader("Détail des questions incorrectes")
    if summary["incorrect_codes"]:
        st.write(", ".join(summary["incorrect_codes"]))
    else:
        st.success("🎉 Toutes les questions sont correctes !")

    # CSV export
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["code", "selected", "correct_indices", "points",
                "skill", "dont_know"])
    for g in graded:
        w.writerow([g.code, ";".join(map(str, g.selected)),
                    ";".join(map(str, g.correct_indices)),
                    g.points, g.skill or "", g.dont_know])
    st.download_button(
        "📥 Exporter les résultats (CSV)",
        data=buf.getvalue(),
        file_name="geo_space_results.csv",
        mime="text/csv",
    )

    if st.button("🔁 Recommencer"):
        st.session_state.started = False
        st.session_state.submitted = False
        st.rerun()


# ─── Main entry point ───────────────────────────────────────────────────────
def main() -> None:
    st.set_page_config(page_title="Géométrie dans l'espace",
                       page_icon="🧊", layout="centered")
    init_state()

    if not st.session_state.started:
        render_welcome()
    elif st.session_state.submitted:
        render_results()
    else:
        render_question()


if __name__ == "__main__":
    main()
