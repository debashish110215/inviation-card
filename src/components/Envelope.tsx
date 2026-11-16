"use client";

import { useEffect, useRef, useState } from "react";

type Stage = "closed" | "opening" | "letter" | "leaving";

/* ---------- static decorative geometry (computed once) ---------- */

// Wax seal outline: a circle with an irregular, melted edge.
const SEAL_PATH = (() => {
  const pts: string[] = [];
  const n = 48;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = 46 + Math.sin(a * 7) * 2.2 + Math.sin(a * 13 + 1.3) * 1.4 + Math.cos(a * 3) * 1.1;
    pts.push(`${(50 + Math.cos(a) * r).toFixed(2)},${(50 + Math.sin(a) * r).toFixed(2)}`);
  }
  return `M${pts.join(" L")} Z`;
})();

// Marigold garland tile: one swag plus half a hanging strand at each edge, repeated across the top.
const GARLAND_BG = (() => {
  const W = 220, H = 96, flowers: string[] = [];
  const marigold = (x: number, y: number, r: number, i: number) => {
    const c = i % 3 === 0 ? "#f7c948" : i % 3 === 1 ? "#f29a1f" : "#f5b22d";
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${c}"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="none" stroke="#b8650f" stroke-width=".8" stroke-dasharray="1.6 1.4" opacity=".7"/><circle cx="${(x - r * .3).toFixed(1)}" cy="${(y - r * .3).toFixed(1)}" r="${(r * .35).toFixed(1)}" fill="#fff3c4" opacity=".55"/>`;
  };
  // swag along a quadratic curve
  for (let i = 0; i <= 18; i++) {
    const t = i / 18, x = W * t, y = 6 + 4 * 46 * t * (1 - t);
    flowers.push(marigold(x, y, 6.5, i));
    if (i % 3 === 1) flowers.push(`<ellipse cx="${x.toFixed(1)}" cy="${(y + 7).toFixed(1)}" rx="2.4" ry="5" fill="#4f7a3a" transform="rotate(${(t - .5) * 60} ${x.toFixed(1)} ${(y + 7).toFixed(1)})"/>`);
  }
  // hanging strands at both edges (halves join into one strand between tiles)
  for (const x of [0, W]) {
    for (let j = 1; j <= 6; j++) flowers.push(marigold(x, 6 + j * 11, j === 6 ? 4.5 : 5.5, j + 1));
    flowers.push(`<path d="M${x - 3} ${80} L${x + 3} ${80} L${x} ${92} Z" fill="#d6b36a"/>`);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><path d="M0 4 H${W}" stroke="#d6b36a" stroke-width="1.5"/>${flowers.join("")}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
})();

// Ambient + burst petals: deterministic so server and client render identically.
const petals = (count: number, seed: number) =>
  Array.from({ length: count }, (_, i) => {
    const k = (i * 7919 + seed * 104729) % 1000;
    return {
      left: `${(i * 61 + seed * 13) % 100}%`,
      delay: `${((k % 70) / 10).toFixed(1)}s`,
      duration: `${(7 + (k % 50) / 10).toFixed(1)}s`,
      size: 9 + (k % 8),
      hue: i % 3 === 0 ? "marigold" : "rose",
      drift: `${(k % 2 ? 1 : -1) * (20 + (k % 60))}px`,
    };
  });
const AMBIENT_PETALS = petals(12, 1);
const BURST_PETALS = petals(30, 7).map((p, i) => ({ ...p, delay: `${(i % 10) * 0.06}s`, duration: `${(2.6 + (i % 6) * 0.35).toFixed(2)}s` }));

function Flourish({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
        <path d="M6 114 V26 Q6 6 26 6 H114" />
        <path d="M14 114 V34 Q14 14 34 14 H114" opacity=".45" />
        <path d="M24 88 C24 52 52 24 88 24" opacity=".8" />
        <path d="M34 62 c2 -14 18 -20 26 -10 c6 8 -2 16 -9 12 c-5 -3 -2 -9 2 -8" />
        <path d="M62 34 c-14 2 -20 18 -10 26" />
        <path d="M24 100 c8 -2 12 -8 10 -16" opacity=".7" />
        <path d="M100 24 c-2 8 -8 12 -16 10" opacity=".7" />
      </g>
      <circle cx="26" cy="26" r="4.5" fill="currentColor" />
      <circle cx="26" cy="26" r="8" fill="none" stroke="currentColor" strokeWidth=".8" opacity=".6" />
    </svg>
  );
}

export default function Envelope({ onOpen, onDone }: { onOpen?: () => void; onDone: () => void }) {
  const [stage, setStage] = useState<Stage>("closed");
  const timers = useRef<number[]>([]);

  // Lock page scroll while the envelope is on screen.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    const pending = timers.current;
    return () => {
      document.body.style.overflow = prev;
      pending.forEach(t => window.clearTimeout(t));
    };
  }, []);

  const open = () => {
    if (stage !== "closed") return;
    onOpen?.();
    setStage("opening");
    timers.current.push(
      window.setTimeout(() => setStage("letter"), 1250),
      window.setTimeout(() => setStage("leaving"), 3700),
      window.setTimeout(onDone, 4600),
    );
  };

  return (
    <div className={`env-screen is-${stage}`} role="dialog" aria-modal="true" aria-label="Wedding invitation envelope">
      <div className="env-pattern" aria-hidden="true" />
      <div className="env-garland" aria-hidden="true" style={{ backgroundImage: GARLAND_BG }} />
      <Flourish className="env-corner env-corner-bl" />
      <Flourish className="env-corner env-corner-br" />

      <div className="env-sparkles" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => <span key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i * 0.7) % 6}s`, animationDuration: `${6 + (i % 5)}s` }}>✦</span>)}
      </div>

      <div className="env-petals" aria-hidden="true">
        {AMBIENT_PETALS.map((p, i) => <i key={i} className={`petal ${p.hue}`} style={{ left: p.left, width: p.size, height: p.size * 1.3, animationDelay: p.delay, animationDuration: p.duration, ["--drift" as string]: p.drift }} />)}
        {stage !== "closed" && BURST_PETALS.map((p, i) => <i key={`b${i}`} className={`petal burst ${p.hue}`} style={{ left: p.left, width: p.size, height: p.size * 1.3, animationDelay: p.delay, animationDuration: p.duration, ["--drift" as string]: p.drift }} />)}
      </div>

      <p className="env-kicker"><span>❦</span> You are cordially invited <span>❦</span></p>
      <h1 className="env-title">Aarav <em>&</em> Ananya</h1>

      <div className="env-wrap">
        <div className="env-rays" aria-hidden="true" />
        <div className="envelope">
          <div className="env-back" />

          <div className="env-letter">
            <div className="env-letter-inner">
              <Flourish className="letter-corner tl" />
              <Flourish className="letter-corner tr" />
              <span className="env-letter-flower">❀</span>
              <p>Together with our families</p>
              <strong>Aarav <i>&</i> Ananya</strong>
              <div className="gold-rule"><span>✧</span></div>
              <small>12 · 12 · 2026 · Dhaka</small>
            </div>
          </div>

          <svg className="env-pocket" viewBox="0 0 300 200" aria-hidden="true">
            <defs>
              <linearGradient id="envSide" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#6e2233" />
                <stop offset="1" stopColor="#4a1121" />
              </linearGradient>
              <linearGradient id="envSideR" x1="1" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#64202f" />
                <stop offset="1" stopColor="#43101e" />
              </linearGradient>
              <linearGradient id="envBottom" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#7d2c3d" />
                <stop offset="1" stopColor="#541424" />
              </linearGradient>
              <filter id="envPaper" x="0" y="0" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="4" />
                <feColorMatrix values="0 0 0 0 1  0 0 0 0 .9  0 0 0 0 .8  0 0 0 .08 0" />
                <feComposite in2="SourceGraphic" operator="in" />
              </filter>
            </defs>
            <polygon points="0,0 150,108 0,200" fill="url(#envSide)" />
            <polygon points="300,0 150,108 300,200" fill="url(#envSideR)" />
            <polygon points="0,200 150,92 300,200" fill="url(#envBottom)" />
            <rect width="300" height="200" filter="url(#envPaper)" />
            {/* gold foil detailing */}
            <polyline points="0,200 150,92 300,200" fill="none" stroke="#d6b36a" strokeOpacity=".75" strokeWidth=".8" />
            <polyline points="14,200 150,102 286,200" fill="none" stroke="#d6b36a" strokeOpacity=".35" strokeWidth=".6" strokeDasharray="2 2" />
            <rect x=".5" y=".5" width="299" height="199" fill="none" stroke="#d6b36a" strokeOpacity=".9" />
            <rect x="6" y="6" width="288" height="188" fill="none" stroke="#d6b36a" strokeOpacity=".35" strokeWidth=".6" />
            <g fill="#d6b36a" opacity=".85">
              <path d="M10 194 l6 -6 l6 6 l-6 -2 z" /><path d="M290 194 l-6 -6 l-6 6 l6 -2 z" />
            </g>
            <text x="150" y="168" textAnchor="middle" className="env-address">for our dearest guest</text>
            <path d="M118 176 q16 6 32 0 q16 -6 32 0" fill="none" stroke="#d6b36a" strokeOpacity=".6" strokeWidth=".7" />
          </svg>

          <div className="env-flap" aria-hidden="true">
            <svg className="flap-face flap-front" viewBox="0 0 300 115">
              <defs>
                <linearGradient id="envFlap" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#5e1828" />
                  <stop offset="1" stopColor="#86323f" />
                </linearGradient>
              </defs>
              <polygon points="0,0 300,0 150,115" fill="url(#envFlap)" />
              <polygon points="0,0 300,0 150,115" filter="url(#envPaper)" />
              <polyline points="0,0 150,115 300,0" fill="none" stroke="#d6b36a" strokeOpacity=".9" />
              <polyline points="22,6 150,103 278,6" fill="none" stroke="#d6b36a" strokeOpacity=".4" strokeWidth=".6" strokeDasharray="2 2" />
            </svg>
            <svg className="flap-face flap-back" viewBox="0 0 300 115">
              <defs>
                <pattern id="envLiner" width="18" height="18" patternUnits="userSpaceOnUse">
                  <rect width="18" height="18" fill="#efe2c9" />
                  <path d="M9 2 C12 6 12 12 9 16 C6 12 6 6 9 2 Z M2 9 C6 6 12 6 16 9 C12 12 6 12 2 9 Z" fill="#c9a65b" opacity=".45" />
                  <circle cx="9" cy="9" r="1.4" fill="#a8803f" />
                </pattern>
              </defs>
              <polygon points="0,0 300,0 150,115" fill="url(#envLiner)" />
              <polyline points="0,0 150,115 300,0" fill="none" stroke="#c9a65b" />
            </svg>
          </div>

          <div className="env-ribbon env-ribbon-l" aria-hidden="true" />
          <div className="env-ribbon env-ribbon-r" aria-hidden="true" />

          <button className="env-seal" onClick={open} aria-label="Open the invitation">
            <span className="seal-tail seal-tail-l" aria-hidden="true" />
            <span className="seal-tail seal-tail-r" aria-hidden="true" />
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <defs>
                <radialGradient id="wax" cx=".35" cy=".3" r=".8">
                  <stop offset="0" stopColor="#d2364c" />
                  <stop offset=".55" stopColor="#9c1a2e" />
                  <stop offset="1" stopColor="#5e0b19" />
                </radialGradient>
                <linearGradient id="foil" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#f6e2a4" />
                  <stop offset=".5" stopColor="#d6b36a" />
                  <stop offset="1" stopColor="#a87d35" />
                </linearGradient>
              </defs>
              <path d={SEAL_PATH} fill="url(#wax)" />
              <circle cx="50" cy="50" r="34" fill="none" stroke="#6d0f1f" strokeWidth="3" opacity=".55" />
              <circle cx="50" cy="50" r="34" fill="none" stroke="url(#foil)" strokeWidth="1.2" />
              <circle cx="50" cy="50" r="29" fill="none" stroke="url(#foil)" strokeWidth=".6" strokeDasharray="1.5 2.5" />
              <text x="50" y="57" textAnchor="middle" className="seal-mono" fill="url(#foil)">A&amp;A</text>
              <ellipse cx="36" cy="30" rx="10" ry="5" fill="#fff" opacity=".18" transform="rotate(-30 36 30)" />
            </svg>
          </button>
        </div>
      </div>

      <p className="env-hint">{stage === "closed" ? <><span className="hint-dot" />Tap the seal to open</> : "With love…"}</p>
    </div>
  );
}
