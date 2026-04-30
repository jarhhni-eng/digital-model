"""
Streamlit UI — Produit scalaire & Géométrie analytique.

Run:
    streamlit run tools/produit_scalaire/streamlit_app.py

Features
--------
- One question per screen, with progress bar and Précédent / Suivant.
- LaTeX / KaTeX rendering through Streamlit's built-in math support
  (``$...$`` and ``\\(...\\)`` are both honoured by `st.markdown`).
- Multi-correct items: rendered as checkboxes; single-correct as radios.
- "Je ne sais pas" toggle on every scoreable item.
- Special split-screen layout for Partie II (figure on the left,
  question + answers on the right).
- End-of-test results: total + breakdown by Type / Lesson / Skill, plus a
  per-question table for the teacher view.
"""
from __future__ import annotations
from pathlib import Path

import streamlit as st

from .dataset import build_dataset
from .models import (
    LESSONS,
    QUESTION_TYPES,
    Question,
    SKILLS,
    StudentAnswer,
)
from .scoring import grade, summarize


# ─── Page configuration ────────────────────────────────────────────────────
st.set_page_config(
    page_title="Produit scalaire — Évaluation",
    page_icon="📐",
    layout="wide",
)


# ─── Session-state bootstrap ───────────────────────────────────────────────
def _init_state() -> None:
    if "questions" not in st.session_state:
        st.session_state.questions = build_dataset()
    if "idx" not in st.session_state:
        st.session_state.idx = 0
    if "answers" not in st.session_state:
        st.session_state.answers = {}  # qid -> StudentAnswer
    if "submitted" not in st.session_state:
        st.session_state.submitted = False
    if "mode" not in st.session_state:
        st.session_state.mode = "student"  # or "teacher"


_init_state()


# ─── Helpers ───────────────────────────────────────────────────────────────
def _correct_count(q: Question) -> int:
    return sum(1 for c in q.choices if c.is_correct)


def _render_stem(q: Question) -> None:
    """Streamlit's markdown handles ``$...$`` and ``\\(...\\)`` math."""
    st.markdown(f"**{q.id}**", help=f"T{q.type_code} · {QUESTION_TYPES[q.type_code]}")
    st.markdown(q.stem)


def _render_figure(q: Question) -> None:
    if not q.image:
        return
    p = Path(q.image)
    if not p.is_absolute():
        # try relative to tools/produit_scalaire
        candidates = [
            Path(__file__).parent / q.image,
            Path.cwd() / q.image,
        ]
        for c in candidates:
            if c.exists():
                p = c
                break
    if p.exists():
        st.image(str(p), use_container_width=True)
    else:
        st.info(f"📎 Figure attendue : `{q.image}` (à déposer dans `tools/produit_scalaire/{q.image}`)")


def _capture_answer(q: Question, key_prefix: str) -> StudentAnswer:
    """Render the input widgets and return the current answer."""
    prev = st.session_state.answers.get(q.id, StudentAnswer(question_id=q.id))

    if not q.choices:
        # Open-ended item.
        free = st.text_area(
            "Votre réponse",
            value=prev.free_text or "",
            key=f"{key_prefix}-free-{q.id}",
            height=140,
        )
        dont = st.checkbox(
            "Je ne sais pas",
            value=prev.dont_know,
            key=f"{key_prefix}-dk-{q.id}",
        )
        return StudentAnswer(
            question_id=q.id,
            selected_letters=[],
            free_text=free,
            dont_know=dont,
        )

    multi = _correct_count(q) > 1
    letters = [c.letter for c in q.choices]
    labels = {c.letter: f"**{c.letter}.** {c.text}" for c in q.choices}

    selected: list[str] = []
    if multi:
        st.caption("Plusieurs réponses peuvent être correctes — cochez toutes les bonnes options.")
        for letter in letters:
            checked = st.checkbox(
                labels[letter],
                value=(letter in prev.selected_letters),
                key=f"{key_prefix}-cb-{q.id}-{letter}",
            )
            if checked:
                selected.append(letter)
    else:
        # single-choice radio
        options = ["—"] + letters
        default_index = (
            letters.index(prev.selected_letters[0]) + 1
            if prev.selected_letters and prev.selected_letters[0] in letters
            else 0
        )
        choice = st.radio(
            "Réponse",
            options,
            index=default_index,
            format_func=lambda v: "— (aucune)" if v == "—" else labels[v],
            key=f"{key_prefix}-radio-{q.id}",
        )
        if choice != "—":
            selected = [choice]

    dont = st.checkbox(
        "Je ne sais pas",
        value=prev.dont_know,
        key=f"{key_prefix}-dk-{q.id}",
    )
    return StudentAnswer(
        question_id=q.id,
        selected_letters=selected,
        dont_know=dont,
    )


def _save_answer(ans: StudentAnswer) -> None:
    st.session_state.answers[ans.question_id] = ans


# ─── Sidebar ───────────────────────────────────────────────────────────────
with st.sidebar:
    st.title("📐 Produit scalaire")
    st.caption("1ère Bac · Sciences")
    st.markdown("---")

    qs = st.session_state.questions
    n = len(qs)
    answered = sum(
        1 for q in qs
        if not q.is_diagnostic and (
            (a := st.session_state.answers.get(q.id))
            and (a.selected_letters or a.free_text or a.dont_know)
        )
    )
    st.progress((st.session_state.idx + 1) / n, text=f"Question {st.session_state.idx + 1} / {n}")
    st.metric("Réponses fournies", f"{answered} / {n - 1}")

    st.markdown("---")
    st.subheader("Navigation rapide")
    cols = st.columns(4)
    for i, q in enumerate(qs):
        with cols[i % 4]:
            label = f"{i + 1}"
            if st.button(label, key=f"nav-{q.id}", use_container_width=True):
                st.session_state.idx = i
                st.rerun()

    st.markdown("---")
    if st.button("🔄 Recommencer", use_container_width=True):
        for k in list(st.session_state.keys()):
            del st.session_state[k]
        st.rerun()


# ─── Main view ─────────────────────────────────────────────────────────────
def _view_question() -> None:
    q: Question = st.session_state.questions[st.session_state.idx]

    type_label = QUESTION_TYPES[q.type_code]
    lesson_label = LESSONS[q.lesson_code]

    st.markdown(
        f"#### Partie {['I', 'II', 'III'][q.type_code - 1]} — {type_label}"
    )
    st.caption(f"Leçon : {lesson_label}")

    # Special split layout for Partie II (visualisation / construction)
    if q.type_code == 2 and q.image:
        left, right = st.columns([5, 6], gap="large")
        with left:
            _render_figure(q)
        with right:
            _render_stem(q)
            ans = _capture_answer(q, key_prefix="p2")
    else:
        _render_stem(q)
        if q.image:
            _render_figure(q)
        ans = _capture_answer(q, key_prefix="std")

    _save_answer(ans)

    st.markdown("---")
    nav1, nav2, nav3 = st.columns([1, 1, 2])
    with nav1:
        if st.button("⬅️ Précédent", disabled=st.session_state.idx == 0, use_container_width=True):
            st.session_state.idx -= 1
            st.rerun()
    with nav2:
        is_last = st.session_state.idx == len(st.session_state.questions) - 1
        if not is_last:
            if st.button("Suivant ➡️", use_container_width=True, type="primary"):
                st.session_state.idx += 1
                st.rerun()
        else:
            if st.button("✅ Terminer", use_container_width=True, type="primary"):
                st.session_state.submitted = True
                st.rerun()


def _view_results() -> None:
    qs = st.session_state.questions
    graded = grade(qs, st.session_state.answers, partial=True)
    stats = summarize(graded)

    st.title("Résultats")
    total = stats["total"]
    c1, c2, c3 = st.columns(3)
    c1.metric("Score total", f"{total['score']} / {total['max']}")
    c2.metric("Pourcentage", f"{total['percent']} %")
    c3.metric("Items évalués", len(graded))

    st.markdown("### Par type de question")
    for k, v in stats["by_type"].items():
        st.write(f"**T{k} — {v['label']}** : {v['score']}/{v['max']} ({v['percent']} %)")
        st.progress(v["percent"] / 100)

    st.markdown("### Par leçon")
    for k, v in stats["by_lesson"].items():
        st.write(f"**{k} — {v['label']}** : {v['score']}/{v['max']} ({v['percent']} %)")
        st.progress(v["percent"] / 100)

    st.markdown("### Par compétence")
    for k, v in stats["by_skill"].items():
        sk_lbl = SKILLS.get(k, "")
        st.write(f"**{k}** — {sk_lbl}  ·  {v['score']}/{v['max']} ({v['percent']} %)")
        st.progress(v["percent"] / 100)

    with st.expander("Détail par question (vue enseignant)"):
        rows = []
        for g in graded:
            rows.append({
                "Question": g.question_id,
                "Type": f"T{g.type_code}",
                "Leçon": f"D{g.lesson_code}",
                "Compétence": g.skill or "—",
                "Score": g.score,
                "Bonnes réponses": ", ".join(g.correct_letters),
                "Réponses élève": ", ".join(g.selected_letters) if g.selected_letters else ("Je ne sais pas" if g.dont_know else "—"),
            })
        st.dataframe(rows, use_container_width=True, hide_index=True)

    st.markdown("---")
    if st.button("↩️ Revenir à l'évaluation"):
        st.session_state.submitted = False
        st.rerun()


# ─── Routing ───────────────────────────────────────────────────────────────
if st.session_state.submitted:
    _view_results()
else:
    _view_question()
