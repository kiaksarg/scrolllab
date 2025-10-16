"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";

import { useScrollEngine } from "@/lib/scroll/useScrollEngine";
import type { ScrollStrategy } from "@/lib/scroll/types";

import { TypeI } from "@/lib/scroll/strategies/TypeI";
import { TypeIII } from "@/lib/scroll/strategies/TypeIII";
import { TypeIV } from "@/lib/scroll/strategies/TypeIV";

import ContentT1 from "@/components/ContentT1";
import ContentT2 from "@/components/ContentT2";
import ContentT3 from "@/components/ContentT3";

type Technique = "I" | "III" | "IV";
type ContentID = "T1" | "T2" | "T3";

const STRATS: Record<Technique, ScrollStrategy> = {
  I: TypeI,
  III: TypeIII,
  IV: TypeIV,
};

const prefix = process.env.NEXT_PUBLIC_BASE_PATH || "";

export interface ScrollTaskProps {
  technique: Technique; // fixed by step
  content: ContentID; // A/B/C -> T1/T2/T3
  dragGain?: number; // optional override (defaults below)
  inertiaGain?: number; // optional override
  // height in viewport units (so you can tweak in the parent if needed)
  viewportVH?: number; // default 65
}

export default function ScrollTask({
  technique,
  content,
  dragGain = 0.9,
  inertiaGain = 0.75,
  viewportVH = 80,
}: ScrollTaskProps) {
  const strategy = useMemo(() => STRATS[technique], [technique]);

  const { containerRef, contentRef, highlightRef, resetTo } = useScrollEngine(
    strategy,
    { dragGain, inertiaGain }
  );

  // reset to top when content or technique changes
  useEffect(() => {
    requestAnimationFrame(() => resetTo(0));
  }, [content, technique, resetTo]);

  const ContentView = useMemo(() => {
    if (content === "T2") {
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
    if (content === "T3") {
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
  }, [content]);

  return (
    <div
      ref={containerRef}
      className="
        relative
        overflow-hidden touch-none select-none
        rounded-2xl border border-neutral-200/70 bg-white/90 shadow-sm
        backdrop-blur-sm
        dark:border-neutral-800 dark:bg-neutral-900/80
      "
      style={{ height: `calc(${viewportVH}svh)` }}
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
          pointer-events-none absolute rounded-full
          bg-yellow-300/35 ring-2 ring-yellow-300/40
        "
        style={{ width: 95, height: 95, display: "none" }}
      />
    </div>
  );
}
