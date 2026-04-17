"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { CORE_TOKENS } from "@/lib/contract";

const FaultyTerminal = dynamic(
  () => import("./FaultyTerminal").then((m) => m.FaultyTerminal),
  { ssr: false }
);

const ROUTED_TOKENS = CORE_TOKENS.map((t) => ({
  symbol: t.symbol,
  logo: t.logoURI ?? t.icon,
}));

const FEATURES = [
  { title: "Smart Routing", desc: "Automatically finds the cheapest and fastest swap path across Initia." },
  { title: "Limit Orders", desc: "Set your target price — executes automatically when the market hits it." },
  { title: "Batch Swap", desc: "Rebalance your portfolio in a single transaction. One click, multiple swaps." },
  { title: "Bridge", desc: "Move tokens between Initia L1 and RupiahRoute appchain seamlessly." },
  { title: ".init Usernames", desc: "Send to human-readable .init names — no copy-pasting 0x addresses." },
  { title: "Near-Zero Gas", desc: "Powered by Initia's appchain — gas fees so low they're practically free." },
];

export function WelcomePage({ onEnter }: { onEnter: () => void }) {
  const [visible, setVisible] = useState(false);
  const [tokenIdx, setTokenIdx] = useState(0);
  const midSwapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    // Preload every token logo so src swaps are instantaneous (no fetch flash).
    ROUTED_TOKENS.forEach(({ logo }) => {
      const img = new window.Image();
      img.src = logo;
    });
    // First mid-cycle swap happens at 2s (when coin first arrives behind Initia logo).
    // Subsequent swaps are driven by onAnimationIteration so they stay synced with CSS.
    midSwapTimer.current = setTimeout(() => {
      setTokenIdx((i) => (i + 1) % ROUTED_TOKENS.length);
    }, 2000);
    return () => {
      if (midSwapTimer.current) clearTimeout(midSwapTimer.current);
    };
  }, []);

  // Runs each time the CSS animation loops (coin is behind logo A at this moment).
  const handleIteration = () => {
    setTokenIdx((i) => (i + 1) % ROUTED_TOKENS.length);
    if (midSwapTimer.current) clearTimeout(midSwapTimer.current);
    midSwapTimer.current = setTimeout(() => {
      setTokenIdx((i) => (i + 1) % ROUTED_TOKENS.length);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "#0a0a1a" }}>

      {/* Terminal background — dimmed so content stays readable */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.15 }}>
        <FaultyTerminal
          tint="#9f29ff"
          scale={1}
          gridMul={[2, 1]}
          digitSize={1.5}
          timeScale={0.2}
          scanlineIntensity={0.2}
          glitchAmount={1}
          flickerAmount={0.4}
          noiseAmp={1.5}
          chromaticAberration={0}
          curvature={0}
          brightness={1}
          mouseReact={false}
          pageLoadAnimation={true}
          dither={0}
        />
      </div>
      {/* Radial vignette — darkens edges, focuses center */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 55% at 50% 50%, transparent 20%, rgba(10,10,26,0.85) 80%)" }} />

      {/* Content */}
      <div className={`relative z-10 max-w-[780px] px-8 text-center transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

        {/* Hackathon badge */}
        <div className="inline-flex items-center mb-6 px-3 py-1.5 rounded-full border border-purple/30 bg-purple/5">
          <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-purple-light">
            Initia Hackathon · 2026
          </span>
        </div>

        {/* Co-brand logos with routing beam (coin travels BEHIND the logos) */}
        <div className="relative flex items-center w-fit mx-auto mb-8">
          {/* Traveling token — sits on z-0 so logo tiles (z-10) occlude it at each endpoint */}
          <div
            onAnimationIteration={handleIteration}
            className="absolute top-1/2 z-0 w-6 h-6 rounded-full bg-white/95 ring-1 ring-purple-light/60 flex items-center justify-center overflow-hidden animate-[routeBeam_4s_ease-in-out_infinite]"
            style={{
              boxShadow: "0 0 12px 2px rgba(159,41,255,0.9), 0 0 24px 4px rgba(159,41,255,0.4)",
            }}
          >
            <img
              src={ROUTED_TOKENS[tokenIdx].logo}
              alt={ROUTED_TOKENS[tokenIdx].symbol}
              className="w-5 h-5 rounded-full object-contain"
            />
          </div>

          <div className="relative z-10 w-20 h-20 rounded-2xl bg-[#0a0a1a] border border-purple/30 flex items-center justify-center">
            <div className="logo-circle w-14 h-14 p-2">
              <img src="/logo/mascotIconOnly.png" alt="RupiahRouter" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Beam lane: connection line only */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            <div
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px animate-[beamGlow_4s_ease-in-out_infinite]"
              style={{
                background:
                  "linear-gradient(to right, transparent 0%, rgba(159,41,255,0.6) 20%, rgba(159,41,255,0.6) 80%, transparent 100%)",
              }}
            />
          </div>

          <div className="relative z-10 w-20 h-20 rounded-2xl bg-[#0a0a1a] border border-purple/30 flex items-center justify-center">
            <img src="/chains/initia-favicon.svg" alt="Initia" className="w-14 h-14" />
          </div>
        </div>

        <h1
          className="text-base md:text-lg font-bold uppercase tracking-wider mb-4"
          style={{
            fontFamily: "var(--font-pixel)",
            color: "#e0d0ff",
            textShadow: "0 0 20px rgba(159,41,255,0.5)",
          }}
        >
          Rupiah Router
        </h1>

        <p className="text-[12px] text-purple-light font-medium mb-8 uppercase tracking-widest">
          Built for Initia MiniEVM
        </p>

        <p className="text-[10px] text-text-muted leading-relaxed max-w-[520px] mx-auto mb-10">
          The smartest way to swap, bridge, and manage your tokens on Initia.
          One interface, best rates, near-zero gas — powered by appchain technology.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`group relative rounded-xl border border-purple/20 bg-purple/5 px-4 py-3 text-left max-w-[210px] transition-all duration-500 hover:border-purple/40 hover:bg-purple/10 cursor-default ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: `${300 + i * 100}ms` }}
            >
              <div className="text-[8px] font-bold text-purple-light mb-1">{f.title}</div>
              <div className="text-[7px] text-text-muted leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onEnter}
          className={`px-10 py-4 rounded-xl bg-purple text-white text-[11px] font-bold uppercase tracking-wider hover:bg-purple-light glow-purple transition-all duration-500 cursor-pointer active:scale-95 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{
            transitionDelay: "800ms",
            textShadow: "1px 1px 0 rgba(0,0,0,0.4)",
          }}
        >
          Start Routing
        </button>

        <p className={`text-[8px] text-text-muted mt-5 transition-all duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "1000ms" }}>
          Connect your wallet inside to start swapping
        </p>
      </div>
    </div>
  );
}
