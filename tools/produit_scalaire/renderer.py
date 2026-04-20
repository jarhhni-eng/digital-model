"""
HTML renderers for the student and teacher views.

LaTeX is rendered client-side by MathJax (CDN). All math inside questions
uses `$...$` delimiters — nothing else is reformatted.
"""
from __future__ import annotations
import html
import json
from pathlib import Path

from .models import Question, QUESTION_TYPES


_MATHJAX = """
<script>
  window.MathJax = {
    tex: { inlineMath: [['$', '$'], ['\\\\(', '\\\\)']] },
    svg: { fontCache: 'global' }
  };
</script>
<script async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
"""

_CSS = """
<style>
  :root { --accent:#4f46e5; --ok:#16a34a; --bad:#dc2626; --muted:#6b7280; }
  *{box-sizing:border-box} body{font-family:system-ui,sans-serif;margin:0;background:#f9fafb;color:#111}
  header{background:#fff;border-bottom:1px solid #e5e7eb;padding:16px 24px}
  header h1{margin:0;font-size:1.1rem} header .sub{color:var(--muted);font-size:.85rem}
  main{max-width:780px;margin:0 auto;padding:24px}
  .card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:16px;box-shadow:0 1px 2px rgba(0,0,0,.03)}
  .qid{font-size:.75rem;color:var(--muted);letter-spacing:.05em;text-transform:uppercase}
  .stem{margin:8px 0 12px;font-size:1.02rem}
  .choice{display:block;padding:10px 12px;border:1px solid #e5e7eb;border-radius:8px;margin:6px 0;cursor:pointer}
  .choice:hover{border-color:var(--accent)}
  .choice.correct{border-color:var(--ok);background:#f0fdf4}
  .choice.wrong{border-color:var(--bad);background:#fef2f2}
  .badge{display:inline-block;font-size:.7rem;padding:2px 8px;border-radius:999px;border:1px solid currentColor;margin-right:6px}
  .b-skill{color:var(--accent)} .b-type{color:#b45309} .b-ok{color:var(--ok)} .b-bad{color:var(--bad)}
  img.figure{max-width:100%;border-radius:8px;margin:8px 0;border:1px solid #e5e7eb}
  .nav{display:flex;justify-content:space-between;margin-top:16px}
  button{background:var(--accent);color:#fff;border:0;padding:8px 16px;border-radius:8px;cursor:pointer}
  button:disabled{opacity:.4;cursor:not-allowed}
  .stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px}
  .stat{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:12px;text-align:center}
  .stat .v{font-size:1.6rem;font-weight:700;color:var(--accent)}
  .stat .l{font-size:.75rem;color:var(--muted);margin-top:4px}
  .meta{font-size:.8rem;color:var(--muted);margin-top:6px}
  details{margin-top:8px} details summary{cursor:pointer;color:var(--muted);font-size:.85rem}
</style>
"""


def _img_tag(q: Question) -> str:
    if not q.image:
        return ""
    return f'<img class="figure" src="{html.escape(q.image)}" alt="Figure Q{q.number}">'


def render_student(questions: list[Question], out_path: str) -> str:
    """
    One-question-per-screen HTML. Labels (true/false) and skills are hidden.
    Uses JS to navigate and POST nothing — answers stay in memory.
    """
    payload = []
    for q in questions:
        payload.append({
            "id": q.id,
            "number": q.number,
            "stem": q.stem,
            "image": q.image,
            "choices": [{"letter": c.letter, "text": c.text} for c in q.choices],
            "expected_free_text": bool(q.expected_text and not q.choices),
        })

    body = f"""
    <header>
      <h1>Évaluation — Produit scalaire</h1>
      <div class="sub">Une question à la fois. Répondez puis cliquez sur « Suivant ».</div>
    </header>
    <main>
      <div id="progress" class="meta"></div>
      <div id="qcard" class="card"></div>
      <div class="nav">
        <button id="prev">Précédent</button>
        <button id="next">Suivant</button>
      </div>
      <div id="done" style="display:none" class="card">
        <h3>Terminé ✅</h3>
        <p>Vos réponses ont été enregistrées localement.</p>
        <pre id="summary" style="background:#f3f4f6;padding:12px;border-radius:8px;overflow:auto"></pre>
      </div>
    </main>
    <script>
      const QUESTIONS = {json.dumps(payload, ensure_ascii=False)};
      const answers = {{}};
      let i = 0;
      const card = document.getElementById('qcard');
      const prog = document.getElementById('progress');
      const btnPrev = document.getElementById('prev');
      const btnNext = document.getElementById('next');

      function render() {{
        const q = QUESTIONS[i];
        prog.textContent = `Question ${{i+1}} / ${{QUESTIONS.length}}`;
        const img = q.image ? `<img class="figure" src="${{q.image}}" alt="">` : '';
        const choices = q.choices.map(c => `
          <label class="choice">
            <input type="radio" name="ans" value="${{c.letter}}" ${{answers[q.id]===c.letter?'checked':''}}>
            <strong>${{c.letter}}.</strong> ${{c.text}}
          </label>`).join('');
        const freeBox = q.expected_free_text ? `
          <textarea rows="4" style="width:100%;padding:8px;border:1px solid #e5e7eb;border-radius:8px"
            placeholder="Votre réponse…">${{answers[q.id+':text']||''}}</textarea>` : '';
        card.innerHTML = `
          <div class="qid">${{q.id}}</div>
          <div class="stem">${{q.stem}}</div>
          ${{img}}
          ${{choices}}
          ${{freeBox}}`;
        card.querySelectorAll('input[name=ans]').forEach(r => r.onchange = e => answers[q.id] = e.target.value);
        const ta = card.querySelector('textarea');
        if (ta) ta.oninput = e => answers[q.id+':text'] = e.target.value;
        btnPrev.disabled = i === 0;
        btnNext.textContent = i === QUESTIONS.length - 1 ? 'Terminer' : 'Suivant';
        if (window.MathJax) MathJax.typesetPromise([card]);
      }}

      btnPrev.onclick = () => {{ if (i > 0) {{ i--; render(); }} }};
      btnNext.onclick = () => {{
        if (i < QUESTIONS.length - 1) {{ i++; render(); }}
        else {{
          document.querySelector('main > .card').style.display = 'none';
          document.querySelector('.nav').style.display = 'none';
          prog.style.display = 'none';
          document.getElementById('done').style.display = 'block';
          document.getElementById('summary').textContent = JSON.stringify(answers, null, 2);
        }}
      }};
      render();
    </script>
    """

    html_doc = f"<!doctype html><html lang='fr'><head><meta charset='utf-8'><title>Évaluation — Produit scalaire</title>{_MATHJAX}{_CSS}</head><body>{body}</body></html>"
    Path(out_path).write_text(html_doc, encoding="utf-8")
    return out_path


def render_teacher(questions: list[Question], stats: dict, out_path: str) -> str:
    """
    Teacher view: all questions with correct answers, skills, types, and
    aggregated analytics at the top.
    """
    def choice_html(q: Question) -> str:
        if not q.choices:
            exp = q.expected_text or "—"
            return f"<div class='meta'>Réponse attendue : {exp}</div>"
        rows = []
        for c in q.choices:
            klass = "correct" if c.is_correct else ""
            tag = "<span class='badge b-ok'>correct</span>" if c.is_correct else ""
            rows.append(f"<div class='choice {klass}'>{tag}<strong>{c.letter}.</strong> {c.text}</div>")
        return "".join(rows)

    cards = []
    for q in questions:
        skill = f"<span class='badge b-skill'>{q.skill}</span>" if q.skill else ""
        tlabel = html.escape(QUESTION_TYPES.get(q.type_code, "?"))
        type_badge = f"<span class='badge b-type'>T{q.type_code} — {tlabel}</span>"
        diag = "<span class='badge'>Diagnostique</span>" if q.is_diagnostic else ""
        cards.append(f"""
          <div class="card">
            <div class="qid">{q.id} · Question {q.number}</div>
            <div style="margin:6px 0">{skill}{type_badge}{diag}</div>
            <div class="stem">{q.stem}</div>
            {_img_tag(q)}
            {choice_html(q)}
            {"<details><summary>Correction détaillée</summary><div class='meta'>" + html.escape(q.expected_text) + "</div></details>" if q.expected_text else ""}
          </div>
        """)

    # Stats block
    total = stats["total"]
    type_rows = "".join(
        f"<div class='stat'><div class='v'>{v['percent']}%</div>"
        f"<div class='l'>T{k} · {v['label']}<br>{v['score']}/{v['max']}</div></div>"
        for k, v in stats["by_type"].items()
    )
    skill_rows = "".join(
        f"<div class='stat'><div class='v'>{v['percent']}%</div>"
        f"<div class='l'>Compétence {k}<br>{v['score']}/{v['max']}</div></div>"
        for k, v in stats["by_skill"].items()
    )

    analytics = f"""
      <div class="card">
        <h2 style="margin-top:0">Analytique</h2>
        <div class="stat-grid">
          <div class="stat"><div class="v">{total['percent']}%</div><div class="l">Score total<br>{total['score']}/{total['max']}</div></div>
          {type_rows}
          {skill_rows}
        </div>
      </div>
    """

    body = f"""
      <header>
        <h1>Vue enseignant — Produit scalaire</h1>
        <div class="sub">Bonnes réponses, compétences, type de question et analytique.</div>
      </header>
      <main>
        {analytics}
        {"".join(cards)}
      </main>
    """

    html_doc = f"<!doctype html><html lang='fr'><head><meta charset='utf-8'><title>Enseignant — Produit scalaire</title>{_MATHJAX}{_CSS}</head><body>{body}</body></html>"
    Path(out_path).write_text(html_doc, encoding="utf-8")
    return out_path
