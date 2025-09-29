// app/page.tsx
"use client";
import { useMemo } from "react";
import { useScrollEngine } from "@/lib/scroll/useScrollEngine";
import { TypeII } from "@/lib/scroll/strategies/TypeII";
import { TypeIII } from "@/lib/scroll/strategies/TypeIII";
import { TypeIV } from "@/lib/scroll/strategies/TypeIV";
import { paragraphsLong } from "@/common/paragraphs";

export default function Page() {
  const strategy = useMemo(() => TypeIV, []);
  const { containerRef, contentRef, highlightRef } = useScrollEngine(strategy);

  return (
    <main className="min-h-svh bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors">
      <div className="mx-auto max-w-screen-sm px-4 py-4 sm:px-6 sm:py-6">
        {/* Header / context */}
        <header className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">ScrollLab</h1>
          <span className="rounded-full border border-neutral-300/60 px-3 py-1 text-xs text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
            Type IV — Highlighted Break-Contact
          </span>
        </header>

        {/* Scroll container */}
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
          {/* Content */}
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
            {/* {[...Array(100)].map((_, i) => (
              <p key={i}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam
                tincidunt sapien non magna lobortis, in faucibus massa dictum.
                Integer euismod, arcu ut pulvinar viverra, nunc nisl convallis
                nunc, vitae tempus arcu dui at magna. ({i + 1})
              </p>
            ))} */}
          </div>

          {/* Highlight circle (shown only during kinetic phase) */}
          <div
            ref={highlightRef}
            className="pointer-events-none absolute rounded-full bg-yellow-400/20 ring-1 ring-yellow-400/25"
            style={{ width: 80, height: 80, display: "none" }}
          />
        </div>

        {/* Footnote / hint */}
        <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
          Tip: enable system dark mode to try the dark theme.
        </p>
      </div>
    </main>
  );
}
