"use client";

import * as React from "react";
import { Box, SlidersHorizontal, ClipboardList } from "lucide-react";
import { Header } from "@/components/Header";
import { Viewport } from "@/components/3d/Viewport";
import { ConfigPanel } from "@/components/config/ConfigPanel";
import { QuoteSummary } from "@/components/quote/QuoteSummary";
import { cn } from "@/lib/utils";

type MobileTab = "design" | "preview" | "quote";

export default function Page() {
  const [tab, setTab] = React.useState<MobileTab>("preview");

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-muted/30">
      <Header />

      {/* Desktop: 3 columns. Mobile: switchable panes. */}
      <main className="flex flex-1 overflow-hidden">
        {/* Config panel — left */}
        <aside
          className={cn(
            "w-full shrink-0 border-r bg-card lg:flex lg:w-[360px]",
            tab === "design" ? "flex" : "hidden"
          )}
        >
          <ConfigPanel />
        </aside>

        {/* 3D viewport — center */}
        <section
          className={cn(
            "flex-1 p-3 lg:flex lg:p-4",
            tab === "preview" ? "flex" : "hidden"
          )}
        >
          <Viewport />
        </section>

        {/* Quote summary — right */}
        <aside
          className={cn(
            "w-full shrink-0 border-l bg-card lg:flex lg:w-[340px]",
            tab === "quote" ? "flex" : "hidden"
          )}
        >
          <QuoteSummary />
        </aside>
      </main>

      {/* Mobile bottom nav */}
      <nav className="grid grid-cols-3 border-t bg-card lg:hidden">
        {(
          [
            { id: "design", label: "Design", icon: SlidersHorizontal },
            { id: "preview", label: "3D View", icon: Box },
            { id: "quote", label: "Quote", icon: ClipboardList },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
              tab === t.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <t.icon className="h-5 w-5" />
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
