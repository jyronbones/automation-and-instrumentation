"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Lamp } from "@/components/plc/controls";

export interface Scenario {
  id: string;
  /** Button text. */
  label: string;
  /** Short signal/state chip, e.g. "Overload". */
  signal?: string;
  /** Explanation of what the ladder is doing in this state. */
  caption: string;
  /** Screenshot path under /public. If omitted, a placeholder is shown. */
  src?: string;
  /** Output states for the mini indicator row. */
  io?: { motor?: boolean; run?: boolean; fault?: boolean };
}

/** Seconds each step is shown during auto-play. */
const STEP_MS = 3500;

/**
 * Full-bleed scenario explorer: a navigation + explanation column beside a large
 * OpenPLC ladder screenshot. Auto-play walks the sequence; any manual selection
 * pauses it (and play resumes from the current step). Click the image to enlarge.
 */
export function ScenarioViewer({
  title,
  subtitle,
  scenarios,
  placeholderDir,
}: {
  title: string;
  subtitle?: string;
  scenarios: Scenario[];
  /** Folder under /public where the screenshots live (for the placeholder hint). */
  placeholderDir: string;
}) {
  const n = scenarios.length;
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [zoom, setZoom] = useState(false);
  const active = scenarios[index];

  // Auto-play: advance on a timer while playing; resumes from the current step.
  useEffect(() => {
    if (!playing || n < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % n), STEP_MS);
    return () => clearInterval(id);
  }, [playing, n]);

  // Manual navigation pauses auto-play.
  const select = (i: number) => {
    setIndex(i);
    setPlaying(false);
  };
  const step = (delta: number) => {
    setIndex((i) => (i + delta + n) % n);
    setPlaying(false);
  };
  const openZoom = () => {
    setPlaying(false);
    setZoom(true);
  };

  return (
    <div className="not-prose relative left-1/2 w-screen -translate-x-1/2 px-4 sm:px-6 lg:px-10">
      <section className="mx-auto my-10 max-w-[1400px] overflow-hidden rounded-2xl border border-border bg-card">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary/40 px-5 py-4 sm:px-7">
          <div>
            <h2 className="font-mono text-base font-medium text-foreground sm:text-lg">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                {subtitle}
              </p>
            )}
          </div>
          <ScanBadge playing={playing} />
        </div>

        {/* Body */}
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[clamp(260px,28%,360px)_1fr] lg:gap-10">
          {/* Navigation + explanation */}
          <div className="flex flex-col gap-6">
            <ul className="flex flex-col gap-1.5">
              {scenarios.map((s, i) => {
                const on = i === index;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => select(i)}
                      aria-pressed={on}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left font-mono text-sm transition-colors",
                        on
                          ? "border-amber/50 bg-amber/10 text-amber"
                          : "border-border bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground",
                      )}
                    >
                      <span className={cn("text-xs", on ? "text-amber/70" : "opacity-50")}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {s.label}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="space-y-3 border-t border-border pt-5">
              <div className="flex flex-wrap items-center gap-3">
                {active?.signal && (
                  <span className="signal-pill text-amber">{active.signal}</span>
                )}
                {active?.io && (
                  <div className="flex items-center gap-4">
                    <Lamp on={!!active.io.motor} label="Motor" color="amber" />
                    <Lamp on={!!active.io.run} label="Run" color="green" />
                    <Lamp on={!!active.io.fault} label="Fault" color="red" />
                  </div>
                )}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {active?.caption}
              </p>
            </div>
          </div>

          {/* Screenshot + transport controls */}
          <div className="flex flex-col items-center gap-4">
            {active?.src ? (
              <button
                type="button"
                onClick={openZoom}
                aria-label={`Enlarge ladder screenshot — ${active.label}`}
                className="group relative flex max-h-[80vh] w-full cursor-zoom-in items-center justify-center overflow-hidden rounded-xl border border-border bg-secondary/20 p-3"
              >
                <img
                  src={active.src}
                  alt={`OpenPLC ladder — ${active.label}`}
                  className="max-h-[70vh] w-auto max-w-full rounded"
                />
                <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-background/85 px-2.5 py-1.5 font-mono text-xs text-muted-foreground backdrop-blur-sm transition-colors group-hover:text-amber">
                  <ExpandIcon />
                  Click to enlarge
                </span>
              </button>
            ) : (
              <div className="flex aspect-[4/5] w-full max-w-md flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-secondary/20 p-6 text-center">
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  OpenPLC screenshot
                </p>
                <p className="font-mono text-[0.7rem] text-muted-foreground/70">
                  drop at: {placeholderDir}/{active?.id}.png
                </p>
              </div>
            )}

            {/* Transport */}
            <div className="flex items-center gap-2">
              <IconButton onClick={() => step(-1)} label="Previous step">
                <ChevronLeftIcon />
              </IconButton>

              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg border px-4 py-2 font-mono text-sm transition-colors",
                  playing
                    ? "border-amber/50 bg-amber/10 text-amber"
                    : "border-border bg-secondary/40 text-foreground hover:bg-secondary",
                )}
              >
                {playing ? <PauseIcon /> : <PlayIcon />}
                {playing ? "Pause" : "Auto-play"}
              </button>

              <IconButton onClick={() => step(1)} label="Next step">
                <ChevronRightIcon />
              </IconButton>

              <span className="ml-2 font-mono text-xs tabular-nums text-muted-foreground">
                {String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </section>

      {zoom && active?.src && (
        <Lightbox
          src={active.src}
          alt={`OpenPLC ladder — ${active.label}`}
          caption={active.caption}
          onClose={() => setZoom(false)}
        />
      )}
    </div>
  );
}

function IconButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-secondary/40 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      {children}
    </button>
  );
}

function ScanBadge({ playing }: { playing: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-widest text-amber">
      <span className="relative flex h-1.5 w-1.5">
        {playing && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber opacity-75" />
        )}
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber" />
      </span>
      {playing ? "Playing" : "Live ladder"}
    </span>
  );
}

/** Full-screen image viewer: backdrop / Esc / button to close, body scroll locked. */
function Lightbox({
  src,
  alt,
  caption,
  onClose,
}: {
  src: string;
  alt: string;
  caption?: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex items-center justify-between gap-4 px-5 py-3">
        <p className="font-mono text-xs text-muted-foreground">{alt}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-auto px-4">
        <img
          src={src}
          alt={alt}
          onClick={(e) => e.stopPropagation()}
          className="max-h-full max-w-full rounded-lg border border-border object-contain"
        />
      </div>

      {caption && (
        <p className="mx-auto max-w-3xl px-5 py-4 text-center text-sm leading-relaxed text-muted-foreground">
          {caption}
        </p>
      )}
    </div>,
    document.body,
  );
}

/* --- icons (inline; lucide v1 dropped several) --- */

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  );
}
