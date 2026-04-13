"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NAV } from "../lib/nav";
import { useMemo } from "react";

export function PageNavigation() {
  const pathname = usePathname();

  const { prev, next } = useMemo(() => {
    const flatItems = NAV.flatMap(group => group.items);
    const currentIndex = flatItems.findIndex(item => item.href === pathname);
    
    if (currentIndex === -1) return { prev: null, next: null };
    
    return {
      prev: currentIndex > 0 ? flatItems[currentIndex - 1] : null,
      next: currentIndex < flatItems.length - 1 ? flatItems[currentIndex + 1] : null,
    };
  }, [pathname]);

  if (!prev && !next) return null;

  return (
    <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
      {prev ? (
        <Link 
          href={prev.href} 
          className="flex flex-col items-start px-4 py-3 rounded-xl border border-border bg-card/40 hover:bg-card/80 hover:border-purple/30 transition-colors w-full sm:w-[48%]"
        >
          <span className="text-xs text-muted mb-1 flex items-center gap-1">
            <ChevronLeft className="w-3 h-3" /> Previous
          </span>
          <span className="text-sm font-medium text-purple-light">{prev.title}</span>
        </Link>
      ) : <div className="w-full sm:w-[48%]" />}
      
      {next ? (
        <Link 
          href={next.href} 
          className="flex flex-col items-end px-4 py-3 rounded-xl border border-border bg-card/40 hover:bg-card/80 hover:border-purple/30 transition-colors w-full sm:w-[48%] text-right"
        >
          <span className="text-xs text-muted mb-1 flex items-center gap-1">
            Next <ChevronRight className="w-3 h-3" />
          </span>
          <span className="text-sm font-medium text-purple-light">{next.title}</span>
        </Link>
      ) : <div className="w-full sm:w-[48%]" />}
    </div>
  );
}
