// lib/scroll/strategies/TypeI.ts
import type { ScrollStrategy } from "../types";

const TAU = 500; // ms decay constant (tune if needed)
const FLICK_V_MIN = 0.5; // px/ms; finger velocity threshold
const V_EPS = 0.02; // stop threshold

export const TypeI: ScrollStrategy = {
  id: "I",

  onPointerDown(e, ctx) {
    e.preventDefault();
    ctx.state.isDragging = true;
    ctx.state.lastY = e.clientY;
    ctx.state.velocity = 0;
    ctx.state.lastTs = performance.now();
    ctx.state.inertia = null;
    ctx.hideHighlight(); // no highlight in Type I, just in case
  },

  onPointerMove(e, ctx) {
    if (!ctx.state.isDragging) return;

    const now = performance.now();
    const dy = e.clientY - ctx.state.lastY;
    let dt = now - ctx.state.lastTs;

    // update tracking
    ctx.state.lastTs = now;
    ctx.state.lastY = e.clientY;

    // cap dt to avoid spikes after tab stalls
    if (dt > 32) dt = 32;

    // raw finger velocity (px/ms)
    ctx.state.velocity = dt > 0 ? dy / dt : 0;

    // DRAG: apply delta (dragGain handled internally by your helper)
    ctx.addOffsetDelta(-dy);
  },

  onPointerUp(_e, ctx) {
    const now = performance.now();
    const dt = now - ctx.state.lastTs;
    ctx.state.isDragging = false;

    // simple flick detection using raw finger velocity
    const isFlick = Math.abs(ctx.state.velocity) > FLICK_V_MIN && dt < 180;

    if (isFlick) {
      // inertia velocity scaled by inertiaGain
      const fingerV = ctx.state.velocity; // px/ms
      ctx.state.velocity = fingerV * ctx.settings.inertiaGain;

      ctx.state.breakContact = null; // not used in Type I
      ctx.state.inertia = {
        active: true,
        v0: ctx.state.velocity,
        startedAt: now,
      };
      ctx.state.lastTs = now;
    } else {
      ctx.state.inertia = null;
    }
  },

  onFrame(now, ctx) {
    const inert = ctx.state.inertia as { active?: boolean } | null;
    if (!inert?.active) return;

    let dt = now - ctx.state.lastTs;
    ctx.state.lastTs = now;
    if (dt > 32) dt = 32;

    // exponential decay
    const decay = Math.exp(-dt / TAU);
    const v = (ctx.state.velocity *= decay); // px/ms

    // advance virtual scroll (setOffset should clamp to bounds)
    const before = ctx.state.contentOffset;
    ctx.setOffset(before - v * dt);
    const after = ctx.state.contentOffset;

    // stop when slow or when clamped (no movement due to bounds)
    if (
      Math.abs(ctx.state.velocity) < V_EPS ||
      Math.abs(after - before) < 0.5
    ) {
      inert.active = false;
    }
  },

  teardown(ctx) {
    ctx.hideHighlight();
    ctx.state.inertia = null;
    ctx.state.isDragging = false;
  },
};
