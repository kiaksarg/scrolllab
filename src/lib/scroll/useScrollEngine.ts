// lib/scroll/useScrollEngine.ts
import { useCallback, useEffect, useRef, useState } from "react";
import type { ScrollCtx, ScrollStrategy, ScrollSettings } from "./types";

type EngineOpts = Partial<ScrollSettings>;

export function useScrollEngine(strategy: ScrollStrategy, opts?: EngineOpts) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const [ctx] = useState<ScrollCtx>(() => {
    const settings: ScrollSettings = {
      dragGain: opts?.dragGain ?? 1, // <— set <1 to slow down dragging
      inertiaGain: opts?.inertiaGain ?? 1, // <— set <1 to slow down kinetic
    };

    const _ctx = {
      container: null as unknown as HTMLElement,
      content: null as unknown as HTMLElement,
      settings,
      state: {
        isDragging: false,
        lastY: 0,
        contentOffset: 0, // virtual vertical scroll
        velocity: 0, // px/ms
        lastTs: 0,
        breakContact: null as unknown, // { winX, winY, docX, docY } | null
        inertia: null as unknown,
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
        _ctx.state.contentOffset = clamped;
      },

      addOffsetDelta: (dy: number) => {
        const scaled = dy * settings.dragGain;
        _ctx.setOffset(_ctx.state.contentOffset + scaled);
      },

      // Place highlight using BOTH axes (docX, docY)
      showHighlight: (docX: number, docY: number) => {
        if (!highlightRef.current || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();

        // Map document → window → container-local
        const winY = docY - _ctx.state.contentOffset + rect.top;
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
    } as ScrollCtx;

    return _ctx;
  });

  const resetTo = useCallback(
    (y = 0) => {
      ctx.state.velocity = 0;
      ctx.state.inertia = null;
      ctx.state.isDragging = false;
      ctx.hideHighlight();
      ctx.setOffset(y);
    },
    [ctx]
  );

  // allow dynamic opts update (optional)
  useEffect(() => {
    if (opts?.dragGain !== undefined) ctx.settings.dragGain = opts.dragGain;
    if (opts?.inertiaGain !== undefined)
      ctx.settings.inertiaGain = opts.inertiaGain;
  }, [opts?.dragGain, opts?.inertiaGain, ctx]);

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

  return { containerRef, contentRef, highlightRef, resetTo };
}
