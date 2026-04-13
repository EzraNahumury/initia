"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { NAV } from "../lib/nav";
import { useMemo } from "react";

export function Breadcrumbs() {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    if (pathname === "/") return null;
    
    for (const group of NAV) {
      for (const item of group.items) {
        if (item.href === pathname) {
          return { group: group.label, current: item.title };
        }
      }
    }
    return null;
  }, [pathname]);

  if (!breadcrumbs) return null;

  return (
    <nav className="flex items-center text-sm text-muted font-medium mb-6">
      <span className="opacity-80">{breadcrumbs.group}</span>
      <ChevronRight className="w-4 h-4 mx-2 opacity-50" />
      <span className="text-foreground">{breadcrumbs.current}</span>
    </nav>
  );
}
