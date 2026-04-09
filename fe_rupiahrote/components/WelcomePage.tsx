"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const FaultyTerminal = dynamic(
  () => import("./FaultyTerminal").then((m) => m.FaultyTerminal),
  { ssr: false }
);

const FEATURES = [
  { title: "Smart Routing", desc: "Automatically finds the cheapest and fastest swap path across Initia." },
  { title: "Limit Orders", desc: "Set your target price — executes automatically when the market hits it." },
  { title: "Batch Swap", desc: "Rebalance your portfolio in a single transaction. One click, multiple swaps." },
  { title: "Bridge", desc: "Move tokens between Initia L1 and RupiahRoute appchain seamlessly." },
  { title: "Near-Zero Gas", desc: "Powered by Initia's appchain — gas fees so low they're practically free." },
];

export function WelcomePage({ onEnter }: { onEnter: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

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

        {/* Logo pulse */}
        <div className="w-28 h-28 mx-auto mb-8 rounded-3xl bg-purple/10 border border-purple/30 flex items-center justify-center animate-[pulseOpacity_3s_ease-in-out_infinite]">
          <img src="/logo/logo.png" alt="RupiahRoute" className="w-20 h-20 rounded-2xl object-cover" />
        </div>

        <h1
          className="text-base md:text-lg font-bold uppercase tracking-wider mb-4"
          style={{
            fontFamily: "var(--font-pixel)",
            color: "#e0d0ff",
            textShadow: "0 0 20px rgba(159,41,255,0.5)",
          }}
        >
          RupiahRoute
        </h1>

        <p className="text-[12px] text-purple-light font-medium mb-8 uppercase tracking-widest">
          Smart DeFi Router on Initia
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
