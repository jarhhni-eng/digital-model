'use client'

/**
 * Layered aurora + orbs + drifting grid. Motion respects prefers-reduced-motion via CSS.
 */
export function HeroAnimatedBackdrop() {
  return (
    <div className="landing-motion pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#030712]" />

      <div
        className="landing-backdrop-aurora absolute -left-[55%] -top-[55%] h-[210%] w-[210%] opacity-[0.85] mix-blend-screen"
        style={{
          background: `conic-gradient(
            from 200deg at 45% 42%,
            rgba(56, 189, 248, 0.14) 0deg,
            rgba(20, 184, 166, 0.12) 72deg,
            rgba(99, 102, 241, 0.1) 160deg,
            rgba(251, 191, 36, 0.07) 240deg,
            rgba(56, 189, 248, 0.12) 360deg
          )`,
        }}
      />

      <div
        className="landing-backdrop-float-a absolute -right-[40%] top-[5%] h-[85vmax] w-[85vmax] rounded-full bg-sky-500/[0.12] blur-[120px]"
      />
      <div
        className="landing-backdrop-float-b absolute -left-[35%] bottom-[-10%] h-[75vmax] w-[75vmax] rounded-full bg-teal-400/[0.1] blur-[110px]"
      />
      <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2">
        <div className="landing-backdrop-pulse h-[min(90vw,720px)] w-[min(90vw,720px)] rounded-full bg-indigo-500/[0.08] blur-[130px]" />
      </div>

      <div
        className="landing-backdrop-grid absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.35] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_72%_58%_at_50%_42%,transparent_0%,rgba(3,7,18,0.88)_72%,#030712_100%)]" />
    </div>
  )
}
