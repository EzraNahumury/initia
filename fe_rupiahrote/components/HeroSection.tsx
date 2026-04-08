"use client";

import dynamic from "next/dynamic";

const Radar = dynamic(() => import("./Radar"), { ssr: false });

/* Space stars */
const STARS: { x: string; y: string; s: number; dur: number; del: number; opacity: number }[] = [
  { x: "2%",  y: "8%",   s: 1, dur: 4,  del: 0,    opacity: 0.3 },
  { x: "7%",  y: "22%",  s: 1, dur: 5,  del: 1.2,  opacity: 0.4 },
  { x: "11%", y: "60%",  s: 1, dur: 3,  del: 0.5,  opacity: 0.2 },
  { x: "14%", y: "85%",  s: 1, dur: 6,  del: 2,    opacity: 0.35 },
  { x: "18%", y: "12%",  s: 1, dur: 4,  del: 3.5,  opacity: 0.25 },
  { x: "23%", y: "42%",  s: 1, dur: 5,  del: 0.8,  opacity: 0.4 },
  { x: "27%", y: "72%",  s: 1, dur: 3,  del: 2.5,  opacity: 0.3 },
  { x: "32%", y: "18%",  s: 1, dur: 6,  del: 1,    opacity: 0.2 },
  { x: "36%", y: "55%",  s: 1, dur: 4,  del: 4,    opacity: 0.35 },
  { x: "40%", y: "90%",  s: 1, dur: 5,  del: 0.3,  opacity: 0.25 },
  { x: "44%", y: "30%",  s: 1, dur: 3,  del: 2,    opacity: 0.4 },
  { x: "48%", y: "65%",  s: 1, dur: 6,  del: 1.5,  opacity: 0.3 },
  { x: "53%", y: "10%",  s: 1, dur: 4,  del: 3,    opacity: 0.2 },
  { x: "57%", y: "78%",  s: 1, dur: 5,  del: 0.7,  opacity: 0.35 },
  { x: "62%", y: "48%",  s: 1, dur: 3,  del: 2.8,  opacity: 0.4 },
  { x: "66%", y: "15%",  s: 1, dur: 6,  del: 1.3,  opacity: 0.25 },
  { x: "71%", y: "82%",  s: 1, dur: 4,  del: 4.5,  opacity: 0.3 },
  { x: "76%", y: "38%",  s: 1, dur: 5,  del: 0.2,  opacity: 0.2 },
  { x: "81%", y: "62%",  s: 1, dur: 3,  del: 3.2,  opacity: 0.35 },
  { x: "86%", y: "25%",  s: 1, dur: 6,  del: 1.8,  opacity: 0.4 },
  { x: "91%", y: "70%",  s: 1, dur: 4,  del: 0.6,  opacity: 0.25 },
  { x: "95%", y: "45%",  s: 1, dur: 5,  del: 2.3,  opacity: 0.3 },
  { x: "4%",  y: "50%",  s: 1, dur: 3,  del: 3.8,  opacity: 0.2 },
  { x: "9%",  y: "92%",  s: 1, dur: 6,  del: 0.9,  opacity: 0.35 },
  { x: "3%",  y: "35%",  s: 1.5, dur: 5,  del: 0,    opacity: 0.5 },
  { x: "10%", y: "70%",  s: 1.5, dur: 4,  del: 1.5,  opacity: 0.6 },
  { x: "16%", y: "20%",  s: 1.5, dur: 6,  del: 3,    opacity: 0.45 },
  { x: "21%", y: "88%",  s: 1.5, dur: 3,  del: 0.4,  opacity: 0.55 },
  { x: "30%", y: "40%",  s: 1.5, dur: 5,  del: 2.2,  opacity: 0.5 },
  { x: "38%", y: "75%",  s: 1.5, dur: 4,  del: 1,    opacity: 0.6 },
  { x: "45%", y: "15%",  s: 1.5, dur: 6,  del: 3.5,  opacity: 0.45 },
  { x: "52%", y: "55%",  s: 1.5, dur: 3,  del: 0.8,  opacity: 0.55 },
  { x: "60%", y: "85%",  s: 1.5, dur: 5,  del: 2.7,  opacity: 0.5 },
  { x: "68%", y: "32%",  s: 1.5, dur: 4,  del: 1.2,  opacity: 0.6 },
  { x: "74%", y: "58%",  s: 1.5, dur: 6,  del: 4,    opacity: 0.45 },
  { x: "83%", y: "18%",  s: 1.5, dur: 3,  del: 0.3,  opacity: 0.55 },
  { x: "89%", y: "80%",  s: 1.5, dur: 5,  del: 2,    opacity: 0.5 },
  { x: "94%", y: "52%",  s: 1.5, dur: 4,  del: 1.7,  opacity: 0.6 },
  { x: "6%",  y: "45%",  s: 2, dur: 6,  del: 0,    opacity: 0.7 },
  { x: "15%", y: "28%",  s: 2, dur: 5,  del: 2,    opacity: 0.6 },
  { x: "25%", y: "80%",  s: 2, dur: 4,  del: 1,    opacity: 0.65 },
  { x: "35%", y: "10%",  s: 2, dur: 6,  del: 3,    opacity: 0.7 },
  { x: "50%", y: "42%",  s: 2, dur: 5,  del: 0.5,  opacity: 0.6 },
  { x: "58%", y: "68%",  s: 2, dur: 4,  del: 2.5,  opacity: 0.65 },
  { x: "72%", y: "22%",  s: 2, dur: 6,  del: 1.5,  opacity: 0.7 },
  { x: "85%", y: "50%",  s: 2, dur: 5,  del: 3.5,  opacity: 0.6 },
  { x: "93%", y: "88%",  s: 2, dur: 4,  del: 0.8,  opacity: 0.65 },
  { x: "20%", y: "55%",  s: 2.5, dur: 7,  del: 0,    opacity: 0.8 },
  { x: "42%", y: "25%",  s: 2.5, dur: 6,  del: 1.5,  opacity: 0.75 },
  { x: "65%", y: "75%",  s: 2.5, dur: 5,  del: 3,    opacity: 0.8 },
  { x: "80%", y: "40%",  s: 2.5, dur: 7,  del: 0.5,  opacity: 0.75 },
  { x: "55%", y: "92%",  s: 2.5, dur: 6,  del: 2,    opacity: 0.8 },
];

/* Blockchain particles */
const PARTICLES = [
  { x: "5%",  y: "15%", s: 3,  dur: 7,  del: 0,   type: "dot",   color: "bg-blue-400" },
  { x: "15%", y: "75%", s: 2,  dur: 9,  del: 1,   type: "dot",   color: "bg-violet-400" },
  { x: "28%", y: "35%", s: 2,  dur: 6,  del: 2.5, type: "dot",   color: "bg-cyan-400" },
  { x: "42%", y: "80%", s: 3,  dur: 8,  del: 0.5, type: "dot",   color: "bg-blue-300" },
  { x: "55%", y: "20%", s: 2,  dur: 10, del: 3,   type: "dot",   color: "bg-indigo-400" },
  { x: "70%", y: "65%", s: 3,  dur: 7,  del: 1.5, type: "dot",   color: "bg-purple-400" },
  { x: "82%", y: "30%", s: 2,  dur: 8,  del: 4,   type: "dot",   color: "bg-cyan-300" },
  { x: "92%", y: "78%", s: 2,  dur: 6,  del: 2,   type: "dot",   color: "bg-blue-400" },
  { x: "35%", y: "55%", s: 2,  dur: 11, del: 3.5, type: "dot",   color: "bg-violet-300" },
  { x: "62%", y: "45%", s: 3,  dur: 9,  del: 1,   type: "dot",   color: "bg-indigo-300" },
  { x: "12%", y: "50%", s: 6,  dur: 12, del: 0,   type: "block", color: "border-blue-400/30" },
  { x: "48%", y: "12%", s: 5,  dur: 10, del: 2,   type: "block", color: "border-violet-400/30" },
  { x: "75%", y: "82%", s: 5,  dur: 14, del: 1,   type: "block", color: "border-cyan-400/30" },
  { x: "88%", y: "45%", s: 6,  dur: 11, del: 3,   type: "block", color: "border-indigo-400/30" },
  { x: "22%", y: "88%", s: 5,  dur: 9,  del: 4,   type: "block", color: "border-purple-400/30" },
  { x: "8%",  y: "40%", s: 10, dur: 15, del: 0,   type: "ring",  color: "border-blue-500/10" },
  { x: "50%", y: "70%", s: 8,  dur: 12, del: 2,   type: "ring",  color: "border-violet-500/10" },
  { x: "80%", y: "15%", s: 10, dur: 18, del: 1,   type: "ring",  color: "border-cyan-500/10" },
];


export function HeroSection() {
  return (
    <div className="max-w-6xl mx-auto px-6 pt-10 pb-24">
      <div className="rounded-3xl bg-neutral-950 p-10 md:p-14 relative overflow-hidden min-h-[340px]">

        {/* ── Radar background ── */}
        <div className="absolute inset-0">
          <Radar
            speed={1}
            scale={0.5}
            ringCount={10}
            spokeCount={10}
            ringThickness={0.05}
            spokeThickness={0.01}
            sweepSpeed={1}
            sweepWidth={2}
            sweepLobes={1}
            color="#9f29ff"
            backgroundColor="#000000"
            falloff={2}
            brightness={1}
            enableMouseInteraction
            mouseInfluence={0.1}
          />
        </div>

        {/* ── Space stars ── */}
        {STARS.map((star, i) => (
          <div
            key={`star-${i}`}
            className="absolute rounded-full bg-white z-[1]"
            style={{
              left: star.x,
              top: star.y,
              width: star.s,
              height: star.s,
              opacity: star.opacity,
              animation: `twinkle ${star.dur}s ease-in-out infinite ${star.del}s, driftSlow ${star.dur + 4}s ease-in-out infinite ${star.del}s`,
            }}
          />
        ))}

        {/* ── Blockchain particles ── */}
        {PARTICLES.map((p, i) => (
          <div
            key={`p-${i}`}
            className="absolute z-[1]"
            style={{ left: p.x, top: p.y }}
          >
            {p.type === "dot" && (
              <div
                className={`rounded-full ${p.color} opacity-40`}
                style={{
                  width: p.s,
                  height: p.s,
                  animation: `particleFloat ${p.dur}s ease-in-out infinite ${p.del}s`,
                }}
              />
            )}
            {p.type === "block" && (
              <div
                className={`border ${p.color} rounded-sm`}
                style={{
                  width: p.s,
                  height: p.s,
                  animation: `particleFloat ${p.dur}s ease-in-out infinite ${p.del}s, spinSlow ${p.dur * 2}s linear infinite ${p.del}s`,
                }}
              />
            )}
            {p.type === "ring" && (
              <div
                className={`border ${p.color} rounded-full`}
                style={{
                  width: p.s,
                  height: p.s,
                  animation: `particleFloat ${p.dur}s ease-in-out infinite ${p.del}s`,
                }}
              />
            )}
          </div>
        ))}

        {/* ── Network lines ── */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.05] z-[1]" xmlns="http://www.w3.org/2000/svg">
          <line x1="8%" y1="25%" x2="30%" y2="65%" stroke="white" strokeWidth="0.5" className="animate-[pulseOpacity_4s_ease-in-out_infinite]" />
          <line x1="30%" y1="65%" x2="55%" y2="20%" stroke="white" strokeWidth="0.5" className="animate-[pulseOpacity_4s_ease-in-out_infinite_1s]" />
          <line x1="55%" y1="20%" x2="80%" y2="55%" stroke="white" strokeWidth="0.5" className="animate-[pulseOpacity_4s_ease-in-out_infinite_2s]" />
          <line x1="80%" y1="55%" x2="95%" y2="30%" stroke="white" strokeWidth="0.5" className="animate-[pulseOpacity_5s_ease-in-out_infinite_0.5s]" />
        </svg>

        {/* ── Right side: Logo with orbiting chain logos ── */}
        <div className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 z-[2] hidden md:block"
          style={{ width: 280, height: 280 }}>
          {/* Center logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="/logo/logo.png"
              alt="RupiahRoute"
              className="w-56 h-56 object-contain"
              style={{
                filter: "drop-shadow(0 0 20px rgba(159,41,255,0.4)) drop-shadow(0 0 40px rgba(159,41,255,0.2))",
              }}
            />
          </div>

        </div>

        {/* ── Text content ── */}
        <div className="relative z-10 max-w-lg">
          <h1 className="text-xl md:text-2xl text-white leading-tight uppercase" style={{ fontFamily: "var(--font-pixel)" }}>
            Smart DeFi Router
            <br />
            on Initia
          </h1>
          <p className="text-neutral-400 text-[15px] mt-4 leading-relaxed max-w-md">
            Otomatis temukan jalur swap tercepat dan termurah di seluruh ekosistem Initia. Satu klik, route terbaik.
          </p>
          <a
            href="/docs"
            className="group inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-lg bg-white/10 hover:bg-purple-600/30 border border-white/10 hover:border-purple-500/50 text-white text-sm font-medium transition-all duration-300 hover:shadow-[0_0_20px_rgba(159,41,255,0.3)]"
          >
            <span className="transition-transform duration-300 group-hover:translate-x-0.5">Documentation</span>
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </a>
        </div>
      </div>
    </div>
  );
}
