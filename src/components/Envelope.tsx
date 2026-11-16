"use client";

import { useEffect, useRef, useState } from "react";

type Stage = "closed" | "opening" | "letter" | "leaving";

export default function Envelope({ onOpen, onDone }: { onOpen?: () => void; onDone: () => void }) {
  const [stage, setStage] = useState<Stage>("closed");
  const timers = useRef<number[]>([]);

  // Lock page scroll while the envelope is on screen.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    return () => {
      document.body.style.overflow = prev;
      timers.current.forEach(t => window.clearTimeout(t));
    };
  }, []);

  const open = () => {
    if (stage !== "closed") return;
    onOpen?.();
    setStage("opening");
    timers.current.push(
      window.setTimeout(() => setStage("letter"), 850),
      window.setTimeout(() => setStage("leaving"), 3000),
      window.setTimeout(onDone, 3900),
    );
  };

  return (
    <div className={`env-screen is-${stage}`} role="dialog" aria-modal="true" aria-label="Wedding invitation envelope">
      <div className="env-sparkles" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => <span key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i * 0.7) % 6}s`, animationDuration: `${6 + (i % 5)}s` }}>✦</span>)}
      </div>

      <p className="env-kicker">You are cordially invited</p>
      <h1 className="env-title">Aarav <em>&</em> Ananya</h1>

      <div className="env-wrap">
        <div className="envelope">
          <div className="env-back" />

          <div className="env-letter">
            <div className="env-letter-inner">
              <span className="env-letter-flower">❀</span>
              <p>Together with our families</p>
              <strong>Aarav <i>&</i> Ananya</strong>
              <div className="gold-rule"><span>✧</span></div>
              <small>12 · 12 · 2026 · Dhaka</small>
            </div>
          </div>

          <svg className="env-pocket" viewBox="0 0 300 200" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="envSide" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#6e2233" />
                <stop offset="1" stopColor="#4a1121" />
              </linearGradient>
              <linearGradient id="envBottom" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#7a2a3b" />
                <stop offset="1" stopColor="#521322" />
              </linearGradient>
            </defs>
            <polygon points="0,0 150,108 0,200" fill="url(#envSide)" />
            <polygon points="300,0 150,108 300,200" fill="url(#envSide)" />
            <polygon points="0,200 150,92 300,200" fill="url(#envBottom)" />
            <polyline points="0,200 150,92 300,200" fill="none" stroke="#d6b36a" strokeOpacity=".7" vectorEffect="non-scaling-stroke" />
            <rect x="0" y="0" width="300" height="200" fill="none" stroke="#d6b36a" strokeOpacity=".9" vectorEffect="non-scaling-stroke" />
          </svg>

          <div className="env-flap" aria-hidden="true">
            <svg viewBox="0 0 300 115" preserveAspectRatio="none">
              <defs>
                <linearGradient id="envFlap" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#5e1828" />
                  <stop offset="1" stopColor="#82303f" />
                </linearGradient>
              </defs>
              <polygon points="0,0 300,0 150,115" fill="url(#envFlap)" />
              <polyline points="0,0 150,115 300,0" fill="none" stroke="#d6b36a" strokeOpacity=".9" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>

          <button className="env-seal" onClick={open} aria-label="Open the invitation">
            <span>A<i>&</i>A</span>
          </button>
        </div>
      </div>

      <p className="env-hint">{stage === "closed" ? "Tap the seal to open" : "With love…"}</p>
    </div>
  );
}
