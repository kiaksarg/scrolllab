import type { ScrollStrategy } from "../types";

const TAU = 500; // ms decay constant
const FLICK_V_MIN = 0.5; // px/ms
const V_EPS = 0.02; // stop threshold

export const TypeII: ScrollStrategy = {
  id: "II",

  onPointerDown(e, ctx) {
    e.preventDefault();
    ctx.state.isDragging = true;
    ctx.state.lastY = e.clientY;
    ctx.state.velocity = 0;
    ctx.state.lastTs = performance.now();
    ctx.state.inertia = null;
    ctx.hideHighlight();
  },

  onPointerMove(e, ctx) {
    if (!ctx.state.isDragging) return;
    const now = performance.now();
    const dy = e.clientY - ctx.state.lastY;
    let dt = now - ctx.state.lastTs;

    // update tracking
    ctx.state.lastTs = now;
    ctx.state.lastY = e.clientY;

    // raw finger velocity (no gain here)
    if (dt > 32) dt = 32; // cap to avoid huge jumps after tab stalls
    ctx.state.velocity = dt > 0 ? dy / dt : 0; // px/ms

    // DRAG: apply dragGain via helper (ONLY this)
    ctx.addOffsetDelta(-dy);
    // ❌ remove: ctx.setOffset(ctx.state.contentOffset - dy);
  },

  onPointerUp(e, ctx) {
    const now = performance.now();
    const dt = now - ctx.state.lastTs;
    ctx.state.isDragging = false;

    // flick detection uses raw finger velocity
    const isFlick = Math.abs(ctx.state.velocity) > FLICK_V_MIN && dt < 180;
    if (isFlick) {
      const rect = ctx.container!.getBoundingClientRect();
      const winX = e.clientX;
      const winY = e.clientY;

      // break-contact doc coords
      const docY = ctx.state.contentOffset + (winY - rect.top);
      const docX = winX - rect.left;

      // FLING: only inertiaGain (dragGain already affected drag)
      const fingerV = ctx.state.velocity; // px/ms
      ctx.state.velocity = fingerV * ctx.settings.inertiaGain;

      ctx.state.breakContact = { winX, winY, docX, docY };
      ctx.state.inertia = {
        active: true,
        v0: ctx.state.velocity,
        startedAt: now,
      };
      ctx.state.lastTs = now;

      ctx.showHighlight(docX, docY);
    } else {
      ctx.state.inertia = null;
      ctx.hideHighlight();
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
    ctx.state.velocity *= decay;

    // advance virtual scroll
    ctx.setOffset(ctx.state.contentOffset - ctx.state.velocity * dt);

    // keep highlight pinned
    if (ctx.state.breakContact) {
      const { docX, docY } = ctx.state.breakContact;
      ctx.showHighlight(docX, docY);
    }

    // stop when slow
    if (Math.abs(ctx.state.velocity) < V_EPS) {
      inert.active = false;
      ctx.hideHighlight();
    }
  },

  teardown(ctx) {
    ctx.hideHighlight();
    ctx.state.inertia = null;
  },
};
