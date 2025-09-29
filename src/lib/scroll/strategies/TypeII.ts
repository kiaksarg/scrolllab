import type { ScrollStrategy } from "../types";

const TAU = 500; // ms decay constant (pilot-tune)
const FLICK_V_MIN = 0.5; // px/ms; also require short release interval

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
    const dt = now - ctx.state.lastTs;

    ctx.state.lastTs = now;
    ctx.state.lastY = e.clientY;
    ctx.state.velocity = dt > 0 ? dy / dt : 0; // px/ms (vertical only)

    // Virtual vertical scroll:
    ctx.setOffset(ctx.state.contentOffset - dy);
  },

  onPointerUp(e, ctx) {
    const now = performance.now();
    const dt = now - ctx.state.lastTs;
    ctx.state.isDragging = false;

    // Flick = fast release with sufficient velocity
    const isFlick = Math.abs(ctx.state.velocity) > FLICK_V_MIN && dt < 180;
    if (isFlick) {
      const rect = ctx.container.getBoundingClientRect();
      const winX = e.clientX;
      const winY = e.clientY;

      // Map break-contact to document coords at lift-off:
      const docY = ctx.state.contentOffset + (winY - rect.top);
      const docX = winX - rect.left; // no horizontal virtual offset (yet)

      ctx.state.breakContact = { winX, winY, docX, docY };
      ctx.state.inertia = {
        active: true,
        v0: ctx.state.velocity,
        startedAt: now,
      };
      ctx.state.lastTs = now;

      // Show highlight at exact (docX, docY) — engine maps to window each frame
      ctx.showHighlight(docX, docY);
    } else {
      ctx.state.inertia = null;
      ctx.hideHighlight();
    }
  },

  onFrame(now, ctx) {
    const inert = ctx.state.inertia;
    if (!inert?.active) return;

    const dt = now - ctx.state.lastTs;
    ctx.state.lastTs = now;

    // Exponential velocity decay:
    const decay = Math.exp(-dt / TAU);
    ctx.state.velocity *= decay;

    // Advance virtual scroll:
    ctx.setOffset(ctx.state.contentOffset - ctx.state.velocity * dt);

    // Keep the highlight pinned to the same document point:
    if (ctx.state.breakContact) {
      const { docX, docY } = ctx.state.breakContact;
      ctx.showHighlight(docX, docY);
    }

    // Stop when motion is negligible (or clamp in setOffset handles bounds):
    if (Math.abs(ctx.state.velocity) < 0.02) {
      inert.active = false;
      ctx.hideHighlight();
    }
  },

  teardown(ctx) {
    ctx.hideHighlight();
    ctx.state.inertia = null;
  },
};
