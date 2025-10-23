"use client";

import { useEffect, useMemo, useState } from "react";
import { createAndAssignAtomic, heartbeat } from "@/lib/api";
import { PartIOrder, DocLetter, isPartIOrder } from "@/types/session.type";
import ScrollTask from "@/components/ScrollTask";

// fixed technique-per-step
const STEP_TO_TYPE_QUERY: Record<1 | 2 | 3, "I" | "III" | "IV"> = {
  1: "I",
  2: "III",
  3: "IV",
};
const DOC_TO_CONTENT: Record<DocLetter, "T1" | "T2" | "T3"> = {
  A: "T1",
  B: "T2",
  C: "T3",
};

type Phase = "idle" | "creating" | "ready" | "error";
type StepState = { done: boolean; ts?: string };
type PlanRow = {
  idx: 1 | 2 | 3;
  doc: DocLetter;
  typeQuery: "I" | "III" | "IV";
  contentQuery: "T1" | "T2" | "T3";
};

const progressKey = (code: string) => `scrolllab:part1:progress:${code}`;

export default function PartIPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [err, setErr] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [order, setOrder] = useState<PartIOrder | null>(null);

  // current step (1..3), highest unlocked (1..3)
  const [activeIdx, setActiveIdx] = useState<1 | 2 | 3>(1);
  const [unlockedMax, setUnlockedMax] = useState<1 | 2 | 3>(1);

  const [steps, setSteps] = useState<Record<1 | 2 | 3, StepState>>({
    1: { done: false },
    2: { done: false },
    3: { done: false },
  });

  // keep-alive
  useEffect(() => {
    if (!code) return;
    const t = setInterval(() => heartbeat(code).catch(() => {}), 60_000);
    return () => clearInterval(t);
  }, [code]);

  // load saved progress
  useEffect(() => {
    if (!code) return;
    try {
      const raw = localStorage.getItem(progressKey(code));
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed) return;
      if (parsed.steps) setSteps(parsed.steps);
      if (parsed.unlockedMax) setUnlockedMax(parsed.unlockedMax);
      if (parsed.activeIdx) setActiveIdx(parsed.activeIdx);
    } catch {}
  }, [code]);

  // persist progress
  useEffect(() => {
    if (!code) return;
    localStorage.setItem(
      progressKey(code),
      JSON.stringify({ steps, unlockedMax, activeIdx })
    );
  }, [code, steps, unlockedMax, activeIdx]);

  // plan from server order
  const plan: PlanRow[] = useMemo(() => {
    if (!order) return [];
    const docs = order.split("") as [DocLetter, DocLetter, DocLetter];
    return ([1, 2, 3] as const).map((idx) => ({
      idx,
      doc: docs[idx - 1],
      typeQuery: STEP_TO_TYPE_QUERY[idx],
      contentQuery: DOC_TO_CONTENT[docs[idx - 1]],
    }));
  }, [order]);

  const activeRow = useMemo(
    () => plan.find((p) => p.idx === activeIdx),
    [plan, activeIdx]
  );

  const isLast = activeIdx === 3;
  const buttonLabel = !activeRow
    ? "Next"
    : steps[activeIdx].done
    ? "Done"
    : isLast
    ? "Complete"
    : "Next";
  const buttonTitle = steps[activeIdx]?.done
    ? isLast
      ? "Step 3 already completed"
      : "This step is already completed"
    : isLast
    ? "Finish Part I"
    : "Go to the next document";

  const canSelect = (idx: 1 | 2 | 3) => idx <= unlockedMax;
  const onPick = (idx: 1 | 2 | 3) => {
    if (canSelect(idx)) setActiveIdx(idx);
  };

  function onCompleteCurrent() {
    const idx = activeIdx;
    if (steps[idx].done) return;
    setSteps((prev) => ({
      ...prev,
      [idx]: { done: true, ts: new Date().toISOString() },
    }));
    if (idx < 3 && unlockedMax < 3) {
      setUnlockedMax((idx + 1) as 1 | 2 | 3);
      if (!steps[(idx + 1) as 1 | 2 | 3]?.done)
        setActiveIdx((idx + 1) as 1 | 2 | 3);
    }
  }

  async function startSession() {
    setErr(null);
    setPhase("creating");
    try {
      const s = await createAndAssignAtomic(); // { code, partIOrder, ... }
      setCode(s.code);
      if (!isPartIOrder(s.partIOrder))
        throw new Error("Server returned an invalid Part I order");
      setOrder(s.partIOrder);

      setSteps({ 1: { done: false }, 2: { done: false }, 3: { done: false } });
      setUnlockedMax(1);
      setActiveIdx(1);
      setPhase("ready");
    } catch (e: unknown) {
      setErr(
        e &&
          typeof e === "object" &&
          "message" in e &&
          typeof (e as { message?: string }).message === "string"
          ? (e as { message: string }).message
          : "Failed to create a session"
      );
      setPhase("error");
    }
  }

  return (
    <main className="min-h-svh bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="mx-auto max-w-screen-sm px-3 py-3 sm:px-4 sm:py-4 space-y-2">
        {/* HEADER */}
        {phase === "idle" ? (
          <div className="flex flex-col items-center justify-center rounded-xl  bg-white/80 dark:bg-neutral-900/60 p-6 text-center space-y-3">
            <h1 className="text-xl font-semibold tracking-tight">
              Welcome to Part I
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-xs">
              In this part, you will scroll through three short documents using
              different techniques. Please press the button below when you are
              ready to begin.
            </p>
            <button
              onClick={startSession}
              className="mt-2 w-full rounded-lg py-2.5 px-3 bg-neutral-900 text-white text-sm font-medium transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              Start
            </button>
          </div>
        ) : phase === "creating" ? (
          <div className="rounded-lg border border-neutral-200/70 dark:border-neutral-800 p-2.5 text-sm">
            Creating your session…
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {/* Session box with code + A/B/C + Complete */}
            <div className="flex flex-1 items-center justify-between gap-2 rounded-lg border border-neutral-200/70 dark:border-neutral-800 p-2">
              {/* compact code text */}
              <div className="font-mono text-sm font-semibold truncate">
                {code ? `code: ${code}` : "code: —"}
              </div>

              {/* A/B/C tiny square buttons */}
              <div className="flex items-center gap-2">
                {plan.map(({ idx, doc }) => {
                  const enabled = canSelect(idx);
                  const done = steps[idx].done;
                  const active = activeIdx === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => onPick(idx)}
                      disabled={!enabled}
                      aria-pressed={active}
                      className={[
                        "h-8 w-8 shrink-0 rounded-md border text-sm font-semibold transition",
                        active
                          ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                          : "border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800",
                        !enabled && "opacity-40 cursor-not-allowed",
                      ].join(" ")}
                      title={enabled ? `Document ${doc}` : "Locked"}
                    >
                      {doc}
                      {done && <span className="ml-0.5">✓</span>}
                    </button>
                  );
                })}
                {/* Complete button right after the doc buttons */}
                <button
                  onClick={onCompleteCurrent}
                  disabled={!activeRow || steps[activeIdx].done}
                  className={[
                    "rounded-md px-3 py-2 text-xs",
                    steps[activeIdx].done
                      ? "bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 cursor-not-allowed"
                      : "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900",
                  ].join(" ")}
                  title={buttonTitle}
                  aria-label={buttonLabel}
                >
                  {buttonLabel}
                </button>
              </div>
            </div>
          </div>
        )}

        {(phase === "ready" || phase === "error") && (
          <>
            {/* INLINE SCROLL — big viewport for max reading space */}
            {activeRow ? (
              <div className="mt-1">
                <ScrollTask
                  technique={activeRow.typeQuery}
                  content={activeRow.contentQuery}
                  viewportVH={90}
                />
              </div>
            ) : (
              <div className="mt-2 text-sm text-neutral-500">
                Tap A to begin.
              </div>
            )}

            {err && (
              <div className="rounded-md border border-red-300 bg-red-50 p-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                {err}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
