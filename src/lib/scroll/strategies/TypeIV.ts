import type { ScrollCtx, ScrollStrategy } from "../types";

const TAU = 500; // decay constant (ms)
const FLICK_V_MIN = 0.5; // px/ms
const V_EPS = 0.02; // stop threshold (px/ms)
// If your highlight circle is 80px (radius=40), set EDGE_MARGIN = 40 to keep it fully visible.
const EDGE_MARGIN = 24; // adjust 24..40 depending on your highlight size and taste

export const TypeIV: ScrollStrategy = {
  id: "IV",

  onPointerDown(e, ctx) {
    e.preventDefault();
    ctx.state.isDragging = true;
    ctx.state.lastY = e.clientY;
    ctx.state.velocity = 0;
    ctx.state.lastTs = performance.now();
    ctx.state.inertia = null;
    ctx.hideHighlight(); // fresh drag: no highlight yet
  },

  onPointerMove(e, ctx) {
    if (!ctx.state.isDragging) return;
    const now = performance.now();
    const dy = e.clientY - ctx.state.lastY;
    const dt = now - ctx.state.lastTs;

    ctx.state.lastTs = now;
    ctx.state.lastY = e.clientY;
    ctx.state.velocity = dt > 0 ? dy / dt : 0; // px/ms

    // Virtual vertical scroll:
    ctx.setOffset(ctx.state.contentOffset - dy);
  },

  onPointerUp(e, ctx) {
    const now = performance.now();
    const dt = now - ctx.state.lastTs;
    ctx.state.isDragging = false;

    // Flick = fast release with sufficient velocity and short up-interval
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

      // Start showing highlight during kinetic phase
      ctx.showHighlight(docX, docY);
    } else {
      ctx.state.inertia = null;
      ctx.hideHighlight();
    }
  },

  onFrame(now, ctx) {
    const inert = ctx.state.inertia;
    if (!inert?.active) return;

    // 1) Time step (cap to avoid huge leaps after tab stalls)
    let dt = now - ctx.state.lastTs;
    ctx.state.lastTs = now;
    if (dt > 32) dt = 32; // ~2 frames at 60Hz

    // 2) Exponential decay
    const decay = Math.exp(-dt / TAU);
    const v = (ctx.state.velocity *= decay); // px/ms

    // 3) No break-contact? Just normal inertia
    const currentOffset = ctx.state.contentOffset;
    if (!ctx.state.breakContact) {
      const nextOffset = currentOffset - v * dt;
      ctx.setOffset(nextOffset);
      if (Math.abs(ctx.state.velocity) < V_EPS) {
        inert.active = false;
        ctx.hideHighlight();
      }
      return;
    }

    // 4) Geometry + margin lines
    const rect = ctx.container.getBoundingClientRect();
    const containerTop = rect.top;
    const containerBottom = rect.bottom;
    const TOP_LINE = containerTop + EDGE_MARGIN;
    const BOTTOM_LINE = containerBottom - EDGE_MARGIN;

    const { docX, docY } = ctx.state.breakContact;

    // 5) Where is the tracked point now and after a full step?
    const trackedWinY_now = docY - currentOffset + containerTop;
    const nextOffset = currentOffset - v * dt;
    const trackedWinY_next = docY - nextOffset + containerTop;

    // --- Keep highlight pinned to the same document point ---
    // (Do it before any early return so you see it track while moving)
    ctx.showHighlight(docX, docY);

    // 6) If we're already inside the margin, clamp immediately and stop
    if (v <= 0 && trackedWinY_now <= TOP_LINE) {
      const offsetAtLine = docY - TOP_LINE;
      ctx.setOffset(offsetAtLine);
      // Show it once at the final spot, then hide on stop
      ctx.showHighlight(docX, docY);
      inert.active = false;
      ctx.hideHighlight();
      return;
    }
    if (v >= 0 && trackedWinY_now >= BOTTOM_LINE) {
      const offsetAtLine = docY - BOTTOM_LINE;
      ctx.setOffset(offsetAtLine);
      ctx.showHighlight(docX, docY);
      inert.active = false;
      ctx.hideHighlight();
      return;
    }

    // 7) Will we cross a margin line within THIS frame? (partial-step stop)
    if (v < 0 && trackedWinY_now > TOP_LINE && trackedWinY_next <= TOP_LINE) {
      const deltaTracked = trackedWinY_next - trackedWinY_now; // negative
      const alpha = (TOP_LINE - trackedWinY_now) / deltaTracked; // 0..1
      const offsetAtHit = currentOffset - v * dt * alpha;
      ctx.setOffset(offsetAtHit);
      ctx.showHighlight(docX, docY);
      inert.active = false;
      ctx.hideHighlight();
      return;
    }

    if (
      v > 0 &&
      trackedWinY_now < BOTTOM_LINE &&
      trackedWinY_next >= BOTTOM_LINE
    ) {
      const deltaTracked = trackedWinY_next - trackedWinY_now; // positive
      const alpha = (BOTTOM_LINE - trackedWinY_now) / deltaTracked; // 0..1
      const offsetAtHit = currentOffset - v * dt * alpha;
      ctx.setOffset(offsetAtHit);
      ctx.showHighlight(docX, docY);
      inert.active = false;
      ctx.hideHighlight();
      return;
    }

    // 8) No crossing: apply full step
    ctx.setOffset(nextOffset);

    // 9) Natural stop
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
