"use client";

import { useEffect, useState, useMemo } from "react";
import { Command } from "cmdk";
import Fuse from "fuse.js";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { NAV } from "../lib/nav";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(true);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onOpenChange]);

  const flatItems = useMemo(() => {
    return NAV.flatMap(group => group.items.map(item => ({ ...item, group: group.label })));
  }, []);

  const fuse = useMemo(() => new Fuse(flatItems, {
    keys: ["title", "group"],
    threshold: 0.4
  }), [flatItems]);

  const results = useMemo(() => {
    if (!query) return flatItems;
    return fuse.search(query).map(r => r.item);
  }, [query, fuse, flatItems]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-background/80 backdrop-blur-sm px-4" onClick={() => onOpenChange(false)}>
      <div 
        className="w-full max-w-lg bg-card border border-border shadow-2xl rounded-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Global Command Menu" shouldFilter={false}>
          <div className="flex items-center px-4 border-b border-border text-foreground">
            <Search className="w-5 h-5 opacity-50 shrink-0 mr-3" />
            <Command.Input 
              autoFocus
              value={query}
              onValueChange={setQuery}
              className="w-full bg-transparent h-14 outline-none placeholder-muted text-sm"
              placeholder="Search documentation..." 
            />
            <div className="text-[10px] bg-muted/20 text-muted px-1.5 py-0.5 rounded ml-2 shrink-0 border border-border/50">ESC</div>
          </div>

          <Command.List className="max-h-[60vh] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted">No results found.</Command.Empty>
            
            {results.map((item) => (
              <Command.Item
                key={item.href}
                value={item.title}
                onSelect={() => {
                  onOpenChange(false);
                  router.push(item.href);
                }}
                className="flex flex-col px-3 py-2 cursor-pointer rounded-lg aria-selected:bg-purple/10 aria-selected:text-purple-light text-foreground text-sm hover:bg-purple/10 hover:text-purple-light transition-colors"
              >
                <span>{item.title}</span>
                <span className="text-[10px] text-muted aria-selected:text-purple/70">{item.group}</span>
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
