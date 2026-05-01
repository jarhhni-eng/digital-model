"""
Repère orthonormé (O, I, J) generator — used by Q2 so that students can
place points and represent a line.

The figure is produced with matplotlib and saved as PNG. If matplotlib is
unavailable, `make_repere()` silently returns None and the renderer will
display a plain HTML grid instead.
"""
from __future__ import annotations
from pathlib import Path
from typing import Optional


def make_repere(
    out_path: str,
    x_range: tuple[int, int] = (-6, 6),
    y_range: tuple[int, int] = (-6, 6),
    title: str = "Repère orthonormé (O, I, J)",
) -> Optional[str]:
    """
    Produce a clean orthonormal frame with:
      * x and y axes (arrows)
      * origin O
      * unit points I(1, 0) and J(0, 1)
      * a unit grid
    Returns the saved PNG path, or None if matplotlib is missing.
    """
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
    except ImportError:
        return None

    out = Path(out_path)
    out.parent.mkdir(parents=True, exist_ok=True)

    fig, ax = plt.subplots(figsize=(5, 5), dpi=150)
    xmin, xmax = x_range
    ymin, ymax = y_range

    # Grid
    ax.set_xticks(range(xmin, xmax + 1))
    ax.set_yticks(range(ymin, ymax + 1))
    ax.grid(True, which="both", color="#e5e7eb", linewidth=0.7)

    # Axes as arrows
    ax.axhline(0, color="#111", linewidth=0.9)
    ax.axvline(0, color="#111", linewidth=0.9)
    ax.annotate("", xy=(xmax, 0), xytext=(xmax - 0.6, 0),
                arrowprops=dict(arrowstyle="->", color="#111"))
    ax.annotate("", xy=(0, ymax), xytext=(0, ymax - 0.6),
                arrowprops=dict(arrowstyle="->", color="#111"))

    # Points O, I, J
    ax.plot(0, 0, "o", color="#111")
    ax.text(-0.35, -0.35, "O", fontsize=12, fontweight="bold")
    ax.plot(1, 0, "o", color="#4f46e5")
    ax.text(1.05, -0.35, "I", fontsize=11, color="#4f46e5", fontweight="bold")
    ax.plot(0, 1, "o", color="#16a34a")
    ax.text(-0.35, 1.05, "J", fontsize=11, color="#16a34a", fontweight="bold")

    # Axis labels
    ax.text(xmax - 0.25, -0.6, "x", fontsize=11)
    ax.text(-0.6, ymax - 0.25, "y", fontsize=11)

    ax.set_xlim(xmin, xmax)
    ax.set_ylim(ymin, ymax)
    ax.set_aspect("equal")
    ax.set_title(title, fontsize=10)

    # Hide outer spines for a clean look
    for side in ("top", "right", "left", "bottom"):
        ax.spines[side].set_visible(False)

    fig.tight_layout()
    fig.savefig(out, bbox_inches="tight")
    plt.close(fig)
    return str(out)
