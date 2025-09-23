export type TechniqueID = "I" | "II" | "III" | "IV";

export interface ScrollStrategy {
  id: TechniqueID;
  onPointerDown(e: PointerEvent, ctx: ScrollCtx): void;
  onPointerMove(e: PointerEvent, ctx: ScrollCtx): void;
  onPointerUp(e: PointerEvent, ctx: ScrollCtx): void;
  onFrame(now: number, ctx: ScrollCtx): void; // inertia loop tick
  teardown(ctx: ScrollCtx): void;
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

  metrics: (evt: any) => void;

  setOffset: (y: number) => void; // applies clamped translateY

  // ⬇️ now take both axes to place the circle precisely
  showHighlight: (docX: number, docY: number) => void;
  hideHighlight: () => void;
}
