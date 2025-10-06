"use client";
import { useEffect, useState, useRef } from "react";
import { Settings } from "lucide-react";

type Props = {
  dragGain: number;
  inertiaGain: number;
  onChange: (next: { dragGain: number; inertiaGain: number }) => void;
};

const clamp = (v: number, min = 0.2, max = 2.0) =>
  Math.min(max, Math.max(min, v));

export default function ScrollSettings({
  dragGain,
  inertiaGain,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const setDrag = (v: number) => onChange({ dragGain: clamp(v), inertiaGain });
  const setInertia = (v: number) =>
    onChange({ dragGain, inertiaGain: clamp(v) });
  const reset = () => onChange({ dragGain: 1.0, inertiaGain: 1.0 });
  const setBoth = (dg: number, ig: number) =>
    onChange({ dragGain: clamp(dg), inertiaGain: clamp(ig) });

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Click outside (desktop)
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div className="relative">
      {/* Gear button */}
      <button
        aria-label="Scroll settings"
        onClick={() => setOpen((s) => !s)}
        className="h-8 w-8 inline-flex items-center justify-center rounded-full
                   border border-neutral-300/60 bg-white/80 dark:border-neutral-700
                   dark:bg-neutral-900/70 shadow-sm backdrop-blur hover:bg-white
                   dark:hover:bg-neutral-900"
      >
        <Settings
          className={`h-4 w-4 text-neutral-700 dark:text-neutral-300 transition-transform ${
            open ? "rotate-90" : ""
          }`}
        />
      </button>

      {/* Backdrop (mobile only) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] sm:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Panel: fixed & centered on mobile; anchored popover on desktop */}
      {open && (
        <div
          className="
            fixed inset-x-3 top-14 z-50 sm:absolute sm:inset-auto sm:right-0 sm:z-20 sm:mt-2
            sm:min-w-[280px] sm:w-[min(86vw,320px)]
          "
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Scroll settings panel"
            className="
              rounded-2xl border border-neutral-200/70 bg-white/95 p-3 shadow-lg backdrop-blur-sm
              dark:border-neutral-800 dark:bg-neutral-900/95
              max-h-[80svh] overflow-auto
            "
          >
            {/* Drag gain */}
            <div className="mb-3">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="dragGain" className="text-xs font-medium">
                  Drag gain
                </label>
                <input
                  id="dragGain-num"
                  type="number"
                  step={0.05}
                  min={0.2}
                  max={2.0}
                  value={dragGain}
                  onChange={(e) => setDrag(parseFloat(e.target.value || "0"))}
                  className="w-20 rounded-md border border-neutral-300/70 bg-white px-2 py-1
                             text-xs dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>
              <input
                id="dragGain"
                type="range"
                min={0.2}
                max={2.0}
                step={0.05}
                value={dragGain}
                onChange={(e) => setDrag(parseFloat(e.target.value))}
                className="mt-2 w-full"
              />
            </div>

            {/* Inertia gain */}
            <div className="mb-3">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="inertiaGain" className="text-xs font-medium">
                  Inertia gain
                </label>
                <input
                  id="inertiaGain-num"
                  type="number"
                  step={0.05}
                  min={0.2}
                  max={2.0}
                  value={inertiaGain}
                  onChange={(e) =>
                    setInertia(parseFloat(e.target.value || "0"))
                  }
                  className="w-20 rounded-md border border-neutral-300/70 bg-white px-2 py-1
                             text-xs dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>
              <input
                id="inertiaGain"
                type="range"
                min={0.2}
                max={2.0}
                step={0.05}
                value={inertiaGain}
                onChange={(e) => setInertia(parseFloat(e.target.value))}
                className="mt-2 w-full"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2">
              {/* Preset chips */}
              <div className="inline-flex items-center gap-1.5">
                <button
                  onClick={() => setBoth(0.8, 0.6)}
                  className="
        rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors
        border border-neutral-300/70 bg-white text-neutral-700 hover:bg-neutral-100
        dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700
        focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/60 dark:focus-visible:ring-neutral-500/60
      "
                  title="Drag 0.8 • Inertia 0.6"
                >
                  0.8 / 0.6
                </button>

                <button
                  onClick={() => setBoth(0.9, 0.75)}
                  className="
        rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors
        border border-neutral-300/70 bg-white text-neutral-700 hover:bg-neutral-100
        dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700
        focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/60 dark:focus-visible:ring-neutral-500/60
      "
                  title="Drag 0.9 • Inertia 0.7"
                >
                  0.9 / 0.75
                </button>
              </div>

              {/* Reset */}
              <button
                onClick={reset}
                className="
      rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors
      border border-neutral-300/70 bg-white text-neutral-700 hover:bg-neutral-100
      dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700
      focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/60 dark:focus-visible:ring-neutral-500/60
    "
              >
                Reset (1)
              </button>

              {/* Close */}
              <button
                onClick={() => setOpen(false)}
                className="
      rounded-md px-2.5 py-1.5 text-xs font-medium
      bg-neutral-900 text-white hover:bg-neutral-800
      dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200
      focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/60 dark:focus-visible:ring-neutral-500/60
    "
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
