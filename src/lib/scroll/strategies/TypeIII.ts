import type { ScrollStrategy } from "../types";

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

    // 1) Time step
    let dt = now - ctx.state.lastTs;
    ctx.state.lastTs = now;
    if (dt > 32) dt = 32; // cap to avoid giant jumps after tab lag

    // 2) Decay velocity
    const decay = Math.exp(-dt / TAU);
    const v = (ctx.state.velocity *= decay); // px/ms

    // 3) Prepare current state
    const currentOffset = ctx.state.contentOffset;

    // If no break-contact, just do normal inertial step
    if (!ctx.state.breakContact) {
      const nextOffset = currentOffset - v * dt;
      ctx.setOffset(nextOffset);
      if (Math.abs(ctx.state.velocity) < V_EPS) inert.active = false;
      return;
    }

    const rect = ctx.container.getBoundingClientRect();
    const containerTop = rect.top;
    const containerBottom = rect.bottom;
    const docY = ctx.state.breakContact.docY;

    // ---- CONFIG: how far inside to stop (px) ----
    // If you render an 80px highlight circle (radius=40),
    // set EDGE_MARGIN = 40 to keep the whole circle visible.
    const EDGE_MARGIN = 24; // try 24..40 depending on your highlight

    const TOP_LINE = containerTop + EDGE_MARGIN;
    const BOTTOM_LINE = containerBottom - EDGE_MARGIN;

    // 4) Where is the tracked point now and after a full step?
    const trackedWinY_now = docY - currentOffset + containerTop;
    const nextOffset = currentOffset - v * dt;
    const trackedWinY_next = docY - nextOffset + containerTop;

    // 5) If we're already inside the margin, clamp immediately and stop.
    if (v <= 0 && trackedWinY_now <= TOP_LINE) {
      const offsetAtLine = docY - TOP_LINE;
      ctx.setOffset(offsetAtLine);
      inert.active = false;
      return;
    }
    if (v >= 0 && trackedWinY_now >= BOTTOM_LINE) {
      const offsetAtLine = docY - BOTTOM_LINE;
      ctx.setOffset(offsetAtLine);
      inert.active = false;
      return;
    }

    // 6) Will we cross the margin line during THIS frame?
    if (v < 0 && trackedWinY_now > TOP_LINE && trackedWinY_next <= TOP_LINE) {
      // fraction of this frame's step where we hit TOP_LINE
      const deltaTracked = trackedWinY_next - trackedWinY_now; // negative
      const alpha = (TOP_LINE - trackedWinY_now) / deltaTracked; // 0..1
      const offsetAtHit = currentOffset - v * dt * alpha;
      ctx.setOffset(offsetAtHit);
      inert.active = false;
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
      inert.active = false;
      return;
    }

    // 7) No crossing: apply full step
    ctx.setOffset(nextOffset);

    // 8) Natural stop
    if (Math.abs(ctx.state.velocity) < V_EPS) {
      inert.active = false;
    }
  },
  teardown(ctx) {
    ctx.state.inertia = null;
  },
};
