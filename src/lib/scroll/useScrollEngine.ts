import { useEffect, useRef, useState } from "react";
import type { ScrollCtx, ScrollStrategy } from "./types";

export function useScrollEngine(strategy: ScrollStrategy) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const [ctx] = useState<ScrollCtx>(() => ({
    container: null as any,
    content: null as any,
    state: {
      isDragging: false,
      lastY: 0,
      contentOffset: 0, // vertical virtual scroll
      velocity: 0, // px/ms
      lastTs: 0,
      breakContact: null, // { winX, winY, docX, docY } | null
      inertia: null,
    },
    metrics: () => {},

    setOffset: (y: number) => {
      const max = Math.max(
        0,
        (contentRef.current?.scrollHeight ?? 0) -
          (containerRef.current?.clientHeight ?? 0)
      );
      const clamped = Math.max(0, Math.min(y, max));
      if (contentRef.current) {
        contentRef.current.style.transform = `translateY(${-clamped}px)`;
      }
      ctx.state.contentOffset = clamped;
    },

    // Place highlight using BOTH axes (docX, docY)
    showHighlight: (docX: number, docY: number) => {
      if (!highlightRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      // Map document → window → container-local
      const winY = docY - ctx.state.contentOffset + rect.top;
      const winX = docX + rect.left; // no horizontal virtual offset yet

      const radius = 40; // 80px circle
      const localTop = winY - rect.top - radius;
      const localLeft = winX - rect.left - radius;

      const el = highlightRef.current;
      el.style.display = "block";
      el.style.top = `${localTop}px`;
      el.style.left = `${localLeft}px`;
    },

    hideHighlight: () => {
      if (highlightRef.current) highlightRef.current.style.display = "none";
    },
  }));

  // wire refs once
  useEffect(() => {
    if (containerRef.current && contentRef.current) {
      ctx.container = containerRef.current;
      ctx.content = contentRef.current;
    }
  }, [ctx]);

  // rAF loop delegates to strategy.onFrame
  useEffect(() => {
    let raf = 0;
    const tick = (now: number) => {
      strategy.onFrame(now, ctx);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ctx, strategy]);

  // pointer listeners delegate into strategy
  useEffect(() => {
    const el = containerRef.current!;
    const down = (e: PointerEvent) => strategy.onPointerDown(e, ctx);
    const move = (e: PointerEvent) => strategy.onPointerMove(e, ctx);
    const up = (e: PointerEvent) => strategy.onPointerUp(e, ctx);

    el.addEventListener("pointerdown", down, { passive: false });
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up, { passive: true });

    // prevent native scroll & selection bleed
    el.style.touchAction = "none";
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      strategy.teardown(ctx);
    };
  }, [ctx, strategy]);

  return { containerRef, contentRef, highlightRef };
}
