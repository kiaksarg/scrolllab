// app/page.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { useScrollEngine } from "@/lib/scroll/useScrollEngine";
import type { ScrollStrategy, TechniqueID } from "@/lib/scroll/types";

import { TypeI } from "@/lib/scroll/strategies/TypeI";
import { TypeII } from "@/lib/scroll/strategies/TypeII";
import { TypeIII } from "@/lib/scroll/strategies/TypeIII";
import { TypeIV } from "@/lib/scroll/strategies/TypeIV";

import { paragraphsLong } from "@/common/paragraphs";

// Content blocks
import ContentT1 from "@/components/ContentT1";
import ContentT2 from "@/components/ContentT2";
import ContentT3 from "@/components/ContentT3";
import Image from "next/image";
import ScrollSettings from "@/components/ScrollSettings";

const prefix = process.env.NEXT_PUBLIC_BASE_PATH || "";

type ContentID = "T1" | "T2" | "T3" | "TEXT";

const CONTENT_LABELS: Record<ContentID, string> = {
  T1: "T1",
  T2: "T2",
  T3: "T3",
  TEXT: "T-P",
};

const LABELS: Record<TechniqueID, string> = {
  I: "Type I — Baseline",
  II: "Type II — Highlighted Break-Contact",
  III: "Type III — Limited Distance Kinetic",
  IV: "Type IV — Limited + Highlighted",
};

const STRATS: Partial<Record<TechniqueID, ScrollStrategy>> = {
  I: TypeI,
  II: TypeII,
  III: TypeIII,
  IV: TypeIV,
};

const clamp = (v: number, min = 0.2, max = 2.0) =>
  Math.min(max, Math.max(min, v));
const LS_KEY = "scrolllab:gains";

export default function Page() {
  const [sel, setSel] = useState<TechniqueID>("IV");
  const [contentSel, setContentSel] = useState<ContentID>("T1");

  const [dragGain, setDragGain] = useState(0.9);
  const [inertiaGain, setInertiaGain] = useState(0.75);

  // Load once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const { dragGain: d, inertiaGain: i } = JSON.parse(raw);
      if (typeof d === "number") setDragGain(clamp(d));
      if (typeof i === "number") setInertiaGain(clamp(i));
    } catch {
      // ignore malformed storage
    }
  }, []);

  // Save on change
  useEffect(() => {
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({
        dragGain: clamp(dragGain),
        inertiaGain: clamp(inertiaGain),
      })
    );
  }, [dragGain, inertiaGain]);

  // Allow ?type=… & ?content=… in URL
  useEffect(() => {
    const url = new URL(window.location.href);
    const qType = (
      url.searchParams.get("type") || ""
    ).toUpperCase() as TechniqueID;
    const qContent = (
      url.searchParams.get("content") || ""
    ).toUpperCase() as ContentID;

    if (qType && (["I", "II", "III", "IV"] as TechniqueID[]).includes(qType)) {
      setSel(qType);
    }
    if (
      qContent &&
      (["T1", "T2", "T3", "TEXT"] as ContentID[]).includes(qContent)
    ) {
      setContentSel(qContent);
    }
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("type", sel);
    url.searchParams.set("content", contentSel);
    window.history.replaceState({}, "", url.toString());
  }, [sel, contentSel]);

  // Keyboard shortcuts for techniques: 1/2/3/4, arrows
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

      if (e.key === "1" && STRATS.I) return setSel("I");
      if (e.key === "2" && STRATS.II) return setSel("II");
      if (e.key === "3" && STRATS.III) return setSel("III");
      if (e.key === "4" && STRATS.IV) return setSel("IV");

      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const orderIdx = idxOf(sel);
        if (orderIdx === -1) return;
        const dir = e.key === "ArrowRight" ? +1 : -1;
        for (let step = 1; step <= order.length; step++) {
          const nxt =
            order[(orderIdx + dir * step + order.length) % order.length];
          if (STRATS[nxt]) {
            setSel(nxt as TechniqueID);
            break;
          }
        }
      }

      // Content switcher shortcut: C cycles
      if (e.key.toLowerCase() === "c") {
        const ids: ContentID[] = ["T1", "T2", "T3", "TEXT"];
        const i = ids.indexOf(contentSel);
        setContentSel(ids[(i + 1) % ids.length]);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel, contentSel]);

  const strategy = useMemo(() => STRATS[sel] ?? TypeIV, [sel]);

  const { containerRef, contentRef, highlightRef } = useScrollEngine(strategy, {
    dragGain: dragGain,
    inertiaGain: inertiaGain,
  });

  // Render selected content
  const ContentView = useMemo(() => {
    if (contentSel === "T2") {
      return (
        <ContentT2
          image={
            <Image
              src={`${prefix}/content-t2.webp`}
              alt="Imam Bayıldı"
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          }
        />
      );
    }
    if (contentSel === "T3") {
      return (
        <ContentT3
          image={
            <Image
              src={`${prefix}/content-t3.jpg`}
              alt="Pimientos de Padrón with Garlic–Lemon Drizzle"
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          }
        />
      );
    }
    if (contentSel === "TEXT") {
      return (
        <>
          {paragraphsLong.map((p, i) => (
            <p key={i}>
              {p} ({i + 1})
            </p>
          ))}
        </>
      );
    }
    // default T1
    return (
      <ContentT1
        image={
          <Image
            src={`${prefix}/content-t1.jpg`}
            alt="Alubias Pintas"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        }
      />
    );
  }, [contentSel]);

  return (
    <main className="min-h-svh bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors">
      <div className="mx-auto max-w-screen-sm px-4 py-4 sm:px-6 sm:py-6">
        <header className="mb-3">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            {/* Left label */}
            <h1 className="text-xl font-semibold tracking-tight shrink-0">
              SCRL
            </h1>

            {/* Right group (settings + content + technique) */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
              {/* Settings gear */}
              <ScrollSettings
                dragGain={dragGain}
                inertiaGain={inertiaGain}
                onChange={({ dragGain: d, inertiaGain: i }) => {
                  setDragGain(d);
                  setInertiaGain(i);
                }}
              />

              {/* Content picker */}
              <select
                id="content-picker"
                value={contentSel}
                onChange={(e) => setContentSel(e.target.value as ContentID)}
                className="
          h-8 rounded-full border border-neutral-300/60 bg-white/80 px-3 text-xs
          dark:border-neutral-700 dark:bg-neutral-900/70
          shadow-sm backdrop-blur
        "
                title="Select content"
              >
                {(["T1", "T2", "T3", "TEXT"] as ContentID[]).map((id) => (
                  <option key={id} value={id}>
                    {CONTENT_LABELS[id]}
                  </option>
                ))}
              </select>

              {/* Technique segmented picker */}
              <div
                role="tablist"
                aria-label="Scrolling technique"
                className="inline-flex items-center gap-1 rounded-full border border-neutral-300/60 p-1 text-xs dark:border-neutral-700 bg-white/70 dark:bg-neutral-900/70 backdrop-blur"
              >
                {(["I", "II", "III", "IV"] as TechniqueID[]).map((id) => {
                  const active = sel === id;
                  const disabled = !STRATS[id];
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
            </div>
          </div>
        </header>

        <div className="mb-2 text-[11px] text-neutral-500 dark:text-neutral-400">
          {CONTENT_LABELS[contentSel]} • {LABELS[sel]} ({dragGain},
          {inertiaGain})
        </div>

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
            {ContentView}
          </div>

          <div
            ref={highlightRef}
            className="
                pointer-events-none 
                absolute 
                rounded-full
                bg-yellow-300/35 
                ring-2 
                ring-yellow-300/40"
            style={{ width: 95, height: 95, display: "none" }}
          />
        </div>

        <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
          Tip: <kbd>1</kbd>/<kbd>2</kbd>/<kbd>3</kbd>/<kbd>4</kbd> or{" "}
          <kbd>←</kbd>/<kbd>→</kbd> for techniques. Press <kbd>c</kbd> to cycle
          content. Use <code>?type=III</code> and <code>?content=T2</code> or{" "}
          <code>?content=TEXT</code> in the URL.
        </p>
      </div>
    </main>
  );
}
