export type TechniqueID = "I" | "II" | "III" | "IV";

export interface ScrollStrategy {
  id: TechniqueID;
  onPointerDown(e: PointerEvent, ctx: ScrollCtx): void;
  onPointerMove(e: PointerEvent, ctx: ScrollCtx): void;
  onPointerUp(e: PointerEvent, ctx: ScrollCtx): void;
  onFrame(now: number, ctx: ScrollCtx): void; // inertia loop tick
  teardown(ctx: ScrollCtx): void;
}

export interface ScrollSettings {
  /** Scale for pointer-drag deltas. 1 = current behavior, 0.5 = 2x slower */
  dragGain: number;
  /** Scale for inertia velocity. 1 = current behavior, 0.5 = 2x slower */
  inertiaGain: number;
}

export interface ScrollCtx {
  container: HTMLElement;
  content: HTMLElement;
  state: {
    isDragging: boolean;
    lastY: number; // vertical drag tracking (keep as-is)
    contentOffset: number; // virtual vertical scrollTop in px
    velocity: number; // px/ms (vertical)
    lastTs: number; // ms (performance.now)

    // ⬇️ record exact break-contact point
    breakContact: {
      winX: number;
      winY: number; // window coords at lift-off
      docX: number;
      docY: number; // document coords at lift-off
    } | null;

    inertia: { active: boolean; v0: number; startedAt: number } | null;
  };

  settings: ScrollSettings;

  metrics: <T>(evt: T) => void;

  setOffset: (y: number) => void; // applies clamped translateY
  addOffsetDelta: (dy: number) => void;
  // ⬇️ now take both axes to place the circle precisely
  showHighlight: (docX: number, docY: number) => void;
  hideHighlight: () => void;
}
