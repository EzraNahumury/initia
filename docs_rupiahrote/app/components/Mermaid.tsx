"use client";

import { useEffect, useRef, useState } from "react";

export function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState("");

  useEffect(() => {
    let cancelled = false;
    import("mermaid").then((mod) => {
      const mermaid = mod.default;
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        themeVariables: {
          primaryColor: "#1a1a3a",
          primaryTextColor: "#f0f0ff",
          primaryBorderColor: "#9f29ff",
          lineColor: "#8888aa",
          secondaryColor: "#12122a",
          tertiaryColor: "#0f0f23",
          fontFamily: "var(--font-geist-sans), sans-serif",
          fontSize: "13px",
          nodeBorder: "#9f29ff",
          mainBkg: "#1a1a3a",
          clusterBkg: "#0f0f23",
          clusterBorder: "rgba(139,92,246,0.3)",
          titleColor: "#f0f0ff",
          edgeLabelBackground: "#12122a",
        },
      });
      const id = `mermaid-${Math.random().toString(36).slice(2)}`;
      mermaid.render(id, chart).then(({ svg: rendered }) => {
        if (!cancelled) setSvg(rendered);
      });
    });
    return () => { cancelled = true; };
  }, [chart]);

  if (!svg) {
    return <div className="h-32 rounded-xl bg-card border border-border flex items-center justify-center text-sm text-muted">Loading diagram...</div>;
  }

  return (
    <div
      ref={ref}
      className="my-6 rounded-xl bg-card border border-border p-4 overflow-x-auto [&_svg]:mx-auto [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
