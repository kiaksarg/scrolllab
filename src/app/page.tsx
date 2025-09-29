// app/page.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { useScrollEngine } from "@/lib/scroll/useScrollEngine";
import type { TechniqueID } from "@/lib/scroll/types";

import { TypeII } from "@/lib/scroll/strategies/TypeII";
import { TypeIII } from "@/lib/scroll/strategies/TypeIII";
import { TypeIV } from "@/lib/scroll/strategies/TypeIV";
// If you have TypeI, import it too:
// import { TypeI } from "@/lib/scroll/strategies/TypeI";

import { paragraphsLong } from "@/common/paragraphs";

const LABELS: Record<TechniqueID, string> = {
  I: "Type I — Baseline",
  II: "Type II — Highlighted Break-Contact",
  III: "Type III — Limited Distance Kinetic",
  IV: "Type IV — Limited + Highlighted",
};

// Only include strategies you’ve actually implemented
const STRATS: Partial<Record<TechniqueID, any>> = {
  // I: TypeI,
  II: TypeII,
  III: TypeIII,
  IV: TypeIV,
};

export default function Page() {
  const [sel, setSel] = useState<TechniqueID>("IV");

  // Allow ?type=… in URL
  useEffect(() => {
    const q = (
      new URL(window.location.href).searchParams.get("type") || ""
    ).toUpperCase() as TechniqueID;
    if (q && (["I", "II", "III", "IV"] as TechniqueID[]).includes(q)) setSel(q);
  }, []);
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("type", sel);
    window.history.replaceState({}, "", url.toString());
  }, [sel]);

  // Keyboard shortcuts: 1/2/3/4, ArrowLeft/ArrowRight to cycle.
  // Skips when typing in inputs/textareas/contenteditable.
  useEffect(() => {
    const order: TechniqueID[] = ["I", "II", "III", "IV"];
    const idxOf = (id: TechniqueID) => order.indexOf(id);

    const isTyping = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName.toLowerCase();
      return (
        tag === "input" ||
        tag === "textarea" ||
        el.isContentEditable ||
        tag === "select"
      );
    };

    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;

      // direct jump with number keys
      if (e.key === "1" && STRATS.I) return setSel("I");
      if (e.key === "2" && STRATS.II) return setSel("II");
      if (e.key === "3" && STRATS.III) return setSel("III");
      if (e.key === "4" && STRATS.IV) return setSel("IV");

      // cycle with arrows
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const cur = idxOf(sel);
        if (cur === -1) return;
        const dir = e.key === "ArrowRight" ? +1 : -1;

        // find next implemented strategy
        for (let step = 1; step <= order.length; step++) {
          const nxt = order[(cur + dir * step + order.length) % order.length];
          if (STRATS[nxt]) {
            setSel(nxt as TechniqueID);
            break;
          }
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel]);

  const strategy = useMemo(() => {
    // Fallback if a type isn’t implemented yet
    return STRATS[sel] ?? TypeIV;
  }, [sel]);

  const { containerRef, contentRef, highlightRef } = useScrollEngine(strategy);

  return (
    <main className="min-h-svh bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors">
      <div className="mx-auto max-w-screen-sm px-4 py-4 sm:px-6 sm:py-6">
        <header className="mb-3 flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold tracking-tight">ScrollLab</h1>

          {/* Segmented picker */}
          <div
            role="tablist"
            aria-label="Scrolling technique"
            className="inline-flex items-center gap-1 rounded-full border border-neutral-300/60 p-1 text-xs dark:border-neutral-700 bg-white/70 dark:bg-neutral-900/70 backdrop-blur"
          >
            {(["I", "II", "III", "IV"] as TechniqueID[]).map((id) => {
              const active = sel === id;
              const disabled = !STRATS[id]; // grey if not implemented
              return (
                <button
                  key={id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => !disabled && setSel(id)}
                  disabled={disabled}
                  className={[
                    "px-3 py-1 rounded-full transition-colors",
                    disabled
                      ? "opacity-40 cursor-not-allowed"
                      : active
                      ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                      : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800",
                  ].join(" ")}
                  title={LABELS[id]}
                >
                  {id}
                </button>
              );
            })}
          </div>
        </header>

        <div className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">
          {LABELS[sel]}
        </div>

        {/* No page reload; the hook re-inits on strategy.id */}
        <div
          ref={containerRef}
          className="
            relative h-[calc(100svh-7rem)]
            overflow-hidden touch-none select-none
            rounded-2xl border border-neutral-200/70 bg-white/90 shadow-sm
            backdrop-blur-sm
            dark:border-neutral-800 dark:bg-neutral-900/80
          "
        >
          <div
            ref={contentRef}
            className="
              will-change-transform
              px-5 py-8
              text-[17px] leading-8 sm:text-[18px] sm:leading-9
              tracking-[0.005em]
              [text-wrap:pretty]
              space-y-5
            "
          >
            {paragraphsLong.map((p, i) => (
              <p key={i}>
                {p} ({i + 1})
              </p>
            ))}
          </div>

          <div
            ref={highlightRef}
            className="pointer-events-none absolute rounded-full bg-yellow-400/20 ring-1 ring-yellow-400/25"
            style={{ width: 80, height: 80, display: "none" }}
          />
        </div>

        <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
          Tip: press <kbd>1</kbd>/<kbd>2</kbd>/<kbd>3</kbd>/<kbd>4</kbd> or use
          <kbd>←</kbd>/<kbd>→</kbd> to switch techniques. You can also use{" "}
          <code>?type=II</code>, <code>?type=III</code>, <code>?type=IV</code>{" "}
          in the URL.
        </p>
      </div>
    </main>
  );
}
