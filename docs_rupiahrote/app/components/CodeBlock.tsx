"use client";

import { useState } from "react";
import { Highlight, themes } from "prism-react-renderer";
import { Copy, Check } from "lucide-react";

interface CodeBlockProps {
  children: string;
  language?: string;
}

export function CodeBlock({ children, language = "bash" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const code = children.trim();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl overflow-hidden mb-5 border border-border" style={{ background: "var(--card)" }}>
      {/* Title bar / Controls */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-black/20">
        <div className="flex items-center gap-1.5 opacity-50">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-lg bg-black/20 hover:bg-white/10 text-muted hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
          aria-label="Copy code"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Code Content */}
      <Highlight theme={themes.okaidia} code={code} language={language}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre 
            className={`p-4 overflow-x-auto text-[13px] leading-[1.6] font-mono ${className} m-0 bg-transparent rounded-none border-none`}
            style={{ ...style, backgroundColor: "transparent" }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
