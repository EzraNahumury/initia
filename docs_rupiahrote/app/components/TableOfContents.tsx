"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const pathname = usePathname();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState("");

  // Re-extract headings whenever the page changes
  useEffect(() => {
    // Small delay to let the new page content render
    const timer = setTimeout(() => {
      const article = document.querySelector("article");
      if (!article) { setHeadings([]); return; }

      const elements = article.querySelectorAll("h2, h3");
      const items: Heading[] = [];

      elements.forEach((el) => {
        if (!el.id) {
          el.id = el.textContent?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") ?? "";
        }
        items.push({
          id: el.id,
          text: el.textContent ?? "",
          level: el.tagName === "H2" ? 2 : 3,
        });
      });

      setHeadings(items);
      setActiveId(items[0]?.id ?? "");
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Track active heading via IntersectionObserver
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav className="hidden xl:block w-[200px] shrink-0 sticky top-20 h-fit max-h-[calc(100vh-6rem)] overflow-y-auto pr-4">
      <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">On this page</h4>
      <ul className="space-y-1 border-l border-border">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`block text-xs leading-relaxed transition-colors border-l-2 -ml-px ${
                h.level === 3 ? "pl-5" : "pl-3"
              } ${
                activeId === h.id
                  ? "border-purple-light text-purple-light font-medium"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
