import type { ScrollCtx, ScrollStrategy } from "../types";

const TAU = 500; // decay constant (tune in pilot)
const FLICK_V_MIN = 0.5; // px/ms; also require short release interval
const V_EPS = 0.02; // stop threshold (px/ms)

export const TypeIII: ScrollStrategy = {
  id: "III",

  onPointerDown(e, ctx) {
    e.preventDefault();
    ctx.state.isDragging = true;
    ctx.state.lastY = e.clientY;
    ctx.state.velocity = 0;
    ctx.state.lastTs = performance.now();
    ctx.state.inertia = null;
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
      const docX = winX - rect.left;

      ctx.state.breakContact = { winX, winY, docX, docY };
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
    const inert = ctx.state.inertia;
    if (!inert?.active) return;

    const dt = now - ctx.state.lastTs;
    ctx.state.lastTs = now;

    // Exponential velocity decay
    const decay = Math.exp(-dt / TAU);
    ctx.state.velocity *= decay;

    // Advance virtual scroll
    ctx.setOffset(ctx.state.contentOffset - ctx.state.velocity * dt);

    // ---- Stop-at-border logic (core of Type III) ----
    if (ctx.state.breakContact) {
      const rect = ctx.container.getBoundingClientRect();
      const trackedWinY =
        ctx.state.breakContact.docY - ctx.state.contentOffset + rect.top;

      if (ctx.state.velocity < 0) {
        // scrolling up (content visually moves down)
        if (trackedWinY <= rect.top) {
          inert.active = false;
        }
      } else if (ctx.state.velocity > 0) {
        // scrolling down (content visually moves up)
        if (trackedWinY >= rect.bottom) {
          inert.active = false;
        }
      }
    }

    // Natural stop if motion is negligible
    if (Math.abs(ctx.state.velocity) < V_EPS) {
      inert.active = false;
    }
  },

  teardown(ctx) {
    ctx.state.inertia = null;
  },
};
