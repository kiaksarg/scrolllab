// lib/scroll/strategies/TypeIV.ts
import type { ScrollStrategy } from "../types";

const TAU = 500;
const FLICK_V_MIN = 0.5; // px/ms (finger velocity threshold)
const V_EPS = 0.02;
const EDGE_MARGIN = 24;

export const TypeIV: ScrollStrategy = {
  id: "IV",

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

    // DRAG: apply dragGain via helper
    ctx.addOffsetDelta(-dy);

    // keep raw finger velocity; convert on release
    ctx.state.velocity = dt > 0 ? dy / dt : 0; // px/ms (finger-space)
  },

  onPointerUp(e, ctx) {
    const now = performance.now();
    const dt = now - ctx.state.lastTs;
    ctx.state.isDragging = false;

    const isFlick = Math.abs(ctx.state.velocity) > FLICK_V_MIN && dt < 180;
    if (isFlick) {
      const rect = ctx.container!.getBoundingClientRect();
      const winX = e.clientX;
      const winY = e.clientY;

      // document position of the break-contact point
      const docY = ctx.state.contentOffset + (winY - rect.top);
      const docX = winX - rect.left;

      // FLING: only inertiaGain here (dragGain already affected the drag)
      const fingerV = ctx.state.velocity; // px/ms
      ctx.state.velocity = fingerV * ctx.settings.inertiaGain;

      ctx.state.breakContact = { winX, winY, docX, docY };
      ctx.state.inertia = {
        active: true,
        v0: ctx.state.velocity,
        startedAt: now
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

    // decay current content velocity
    const decay = Math.exp(-dt / TAU);
    const v = (ctx.state.velocity *= decay); // px/ms

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

    const rect = ctx.container!.getBoundingClientRect();
    const TOP_LINE = rect.top + EDGE_MARGIN;
    const BOTTOM_LINE = rect.bottom - EDGE_MARGIN;

    const { docX, docY } = ctx.state.breakContact;
    const trackedWinY_now = docY - currentOffset + rect.top;
    const nextOffset = currentOffset - v * dt;
    const trackedWinY_next = docY - nextOffset + rect.top;

    ctx.showHighlight(docX, docY);

    if (v <= 0 && trackedWinY_now <= TOP_LINE) {
      ctx.setOffset(docY - TOP_LINE);
      inert.active = false;
      ctx.hideHighlight();
      return;
    }
    if (v >= 0 && trackedWinY_now >= BOTTOM_LINE) {
      ctx.setOffset(docY - BOTTOM_LINE);
      inert.active = false;
      ctx.hideHighlight();
      return;
    }

    if (v < 0 && trackedWinY_now > TOP_LINE && trackedWinY_next <= TOP_LINE) {
      const deltaTracked = trackedWinY_next - trackedWinY_now;
      const alpha = (TOP_LINE - trackedWinY_now) / deltaTracked;
      ctx.setOffset(currentOffset - v * dt * alpha);
      inert.active = false;
      ctx.hideHighlight();
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
      ctx.hideHighlight();
      return;
    }

    ctx.setOffset(nextOffset);

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
