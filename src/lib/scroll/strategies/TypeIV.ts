import type { ScrollCtx, ScrollStrategy } from "../types";

const TAU = 500; // decay constant (tune in pilot)
const FLICK_V_MIN = 0.5; // px/ms
const V_EPS = 0.02; // stop threshold (px/ms)

export const TypeIV: ScrollStrategy = {
  id: "IV",

  onPointerDown(e, ctx) {
    e.preventDefault();
    ctx.state.isDragging = true;
    ctx.state.lastY = e.clientY;
    ctx.state.velocity = 0;
    ctx.state.lastTs = performance.now();
    ctx.state.inertia = null;
    ctx.hideHighlight(); // ensure hidden on fresh drag
  },

  onPointerMove(e, ctx) {
    if (!ctx.state.isDragging) return;
    const now = performance.now();
    const dy = e.clientY - ctx.state.lastY;
    const dt = now - ctx.state.lastTs;

    ctx.state.lastTs = now;
    ctx.state.lastY = e.clientY;
    ctx.state.velocity = dt > 0 ? dy / dt : 0; // px/ms (vertical)

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
      const docX = winX - rect.left; // no horizontal virtual scroll (yet)

      ctx.state.breakContact = { winX, winY, docX, docY };
      ctx.state.inertia = {
        active: true,
        v0: ctx.state.velocity,
        startedAt: now,
      };
      ctx.state.lastTs = now;

      // Show highlight during kinetic phase (Type II behavior)
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

    // Exponential decay (Type I/II/III base)
    const decay = Math.exp(-dt / TAU);
    ctx.state.velocity *= decay;

    // Advance virtual scroll
    ctx.setOffset(ctx.state.contentOffset - ctx.state.velocity * dt);

    // --- Type IV core: highlight + stop-at-border ---
    if (ctx.state.breakContact) {
      const { docX, docY } = ctx.state.breakContact;

      // Keep highlight pinned to same document point (Type II)
      ctx.showHighlight(docX, docY);

      // Border stop (Type III)
      const rect = ctx.container.getBoundingClientRect();
      const trackedWinY = docY - ctx.state.contentOffset + rect.top;

      if (ctx.state.velocity < 0) {
        // scrolling up (content moves down visually)
        if (trackedWinY <= rect.top) {
          inert.active = false;
          ctx.hideHighlight();
          return;
        }
      } else if (ctx.state.velocity > 0) {
        // scrolling down (content moves up visually)
        if (trackedWinY >= rect.bottom) {
          inert.active = false;
          ctx.hideHighlight();
          return;
        }
      }
    }

    // Natural stop
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
