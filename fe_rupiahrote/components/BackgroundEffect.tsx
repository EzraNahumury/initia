"use client";

import dynamic from "next/dynamic";

const FaultyTerminal = dynamic(
  () => import("./FaultyTerminal").then((m) => m.FaultyTerminal),
  { ssr: false }
);

export function BackgroundEffect() {
  return (
    <div
      className="fixed inset-0 z-0"
      aria-hidden
      style={{ opacity: 0.35 }}
    >
      <FaultyTerminal
        tint="#9f29ff"
        scale={1}
        gridMul={[2, 1]}
        digitSize={1.5}
        timeScale={0.25}
        scanlineIntensity={0.25}
        glitchAmount={1}
        flickerAmount={0.6}
        noiseAmp={1.5}
        chromaticAberration={0}
        curvature={0}
        brightness={1}
        mouseReact={false}
        pageLoadAnimation={true}
        dither={0}
      />
    </div>
  );
}
