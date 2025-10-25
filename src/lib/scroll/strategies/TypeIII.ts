import type { ScrollStrategy } from "../types";

const TAU = 500;
const FLICK_V_MIN = 0.5; // px/ms
const V_EPS = 0.02;

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
    ctx.state.velocity = dt > 0 ? dy / dt : 0; // raw finger velocity (px/ms)

    // DRAG: apply gain via helper (and ONLY this)
    ctx.addOffsetDelta(-dy);
  },

  onPointerUp(e, ctx) {
    const now = performance.now();
    const dt = now - ctx.state.lastTs;
    ctx.state.isDragging = false;

    // Use raw finger velocity for flick detection
    const isFlick = Math.abs(ctx.state.velocity) > FLICK_V_MIN && dt < 180;
    if (isFlick) {
      const rect = ctx.container!.getBoundingClientRect();
      const winX = e.clientX;
      const winY = e.clientY;

      const docY = ctx.state.contentOffset + (winY - rect.top);
      const docX = winX - rect.left;

      // FLING: apply ONLY inertiaGain (dragGain already affected drag)
      const fingerV = ctx.state.velocity; // px/ms
      ctx.state.velocity = fingerV * ctx.settings.inertiaGain;

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
    const inert = ctx.state.inertia as { active?: boolean } | null;
    if (!inert?.active) return;

    let dt = now - ctx.state.lastTs;
    ctx.state.lastTs = now;
    if (dt > 32) dt = 32;

    const decay = Math.exp(-dt / TAU);
    const v = (ctx.state.velocity *= decay); // content velocity

    const currentOffset = ctx.state.contentOffset;
    if (!ctx.state.breakContact) {
      const nextOffset = currentOffset - v * dt;
      ctx.setOffset(nextOffset);
      if (Math.abs(ctx.state.velocity) < V_EPS) inert.active = false;
      return;
    }

    const rect = ctx.container!.getBoundingClientRect();
    const containerTop = rect.top;
    const containerBottom = rect.bottom;
    const { docY } = ctx.state.breakContact;

    const EDGE_MARGIN = 10;
    const TOP_LINE = containerTop + EDGE_MARGIN;
    const BOTTOM_LINE = containerBottom - EDGE_MARGIN;

    const trackedWinY_now = docY - currentOffset + containerTop;
    const nextOffset = currentOffset - v * dt;
    const trackedWinY_next = docY - nextOffset + containerTop;

    if (v <= 0 && trackedWinY_now <= TOP_LINE) {
      ctx.setOffset(docY - TOP_LINE);
      inert.active = false;
      return;
    }
    if (v >= 0 && trackedWinY_now >= BOTTOM_LINE) {
      ctx.setOffset(docY - BOTTOM_LINE);
      inert.active = false;
      return;
    }

    if (v < 0 && trackedWinY_now > TOP_LINE && trackedWinY_next <= TOP_LINE) {
      const deltaTracked = trackedWinY_next - trackedWinY_now;
      const alpha = (TOP_LINE - trackedWinY_now) / deltaTracked;
      ctx.setOffset(currentOffset - v * dt * alpha);
      inert.active = false;
      return;
    }
    if (
      v > 0 &&
      trackedWinY_now < BOTTOM_LINE &&
      trackedWinY_next >= BOTTOM_LINE
    ) {
      const deltaTracked = trackedWinY_next - trackedWinY_now;
      const alpha = (BOTTOM_LINE - trackedWinY_now) / deltaTracked;
      ctx.setOffset(currentOffset - v * dt * alpha);
      inert.active = false;
      return;
    }

    ctx.setOffset(nextOffset);

    if (Math.abs(ctx.state.velocity) < V_EPS) inert.active = false;
  },

  teardown(ctx) {
    ctx.state.inertia = null;
  },
};
