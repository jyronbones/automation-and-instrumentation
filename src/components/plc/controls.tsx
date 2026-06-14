"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Minimum time (ms) a momentary press is held true, so a fast click can't slip
 * between scan cycles and be missed — a software debounce / minimum pulse width.
 */
const MIN_PULSE_MS = 140;

/* ------------------------------------------------------------------ *
 * Industrial control-panel UI kit. Shared by every project simulator. *
 * ------------------------------------------------------------------ */

/** Outer panel: titled card with a live "SCAN" heartbeat. */
export function PlcPanel({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "not-prose my-8 overflow-hidden rounded-xl border border-border bg-card",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border bg-secondary/40 px-4 py-3">
        <div>
          <p className="font-mono text-sm font-medium text-foreground">{title}</p>
          {subtitle && (
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        <span className="inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-widest text-amber">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber" />
          </span>
          Scan
        </span>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}

/** Group label inside the panel. */
export function ControlGroup({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="mb-3 font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

const momentaryVariants = {
  start:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15",
  stop: "border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/15",
  neutral:
    "border-border bg-secondary/60 text-foreground hover:bg-secondary",
} as const;

const momentaryActive = {
  start: "bg-emerald-500/30 shadow-[inset_0_2px_6px_rgba(0,0,0,0.5)]",
  stop: "bg-red-500/30 shadow-[inset_0_2px_6px_rgba(0,0,0,0.5)]",
  neutral: "bg-secondary shadow-[inset_0_2px_6px_rgba(0,0,0,0.5)]",
} as const;

/**
 * Momentary pushbutton — true only while held (pointer or space/enter).
 * Models a spring-return NO pushbutton.
 */
export function MomentaryButton({
  label,
  sublabel,
  variant = "neutral",
  pressed,
  onPress,
}: {
  label: string;
  sublabel?: string;
  variant?: keyof typeof momentaryVariants;
  pressed: boolean;
  onPress: (down: boolean) => void;
}) {
  const downAt = useRef(0);
  const releaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setPressed = (down: boolean) => {
    if (down) {
      if (releaseTimer.current) {
        clearTimeout(releaseTimer.current);
        releaseTimer.current = null;
      }
      downAt.current = Date.now();
      onPress(true);
    } else {
      const held = Date.now() - downAt.current;
      if (held >= MIN_PULSE_MS) {
        onPress(false);
      } else {
        // Held too briefly — keep it true until at least one scan can catch it.
        releaseTimer.current = setTimeout(() => {
          onPress(false);
          releaseTimer.current = null;
        }, MIN_PULSE_MS - held);
      }
    }
  };

  return (
    <button
      type="button"
      aria-pressed={pressed}
      onPointerDown={(e) => {
        e.preventDefault();
        setPressed(true);
      }}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          setPressed(true);
        }
      }}
      onKeyUp={(e) => {
        if (e.key === " " || e.key === "Enter") setPressed(false);
      }}
      className={cn(
        "flex min-w-24 select-none flex-col items-center justify-center rounded-lg border px-4 py-3 font-mono text-sm transition-all active:translate-y-px",
        momentaryVariants[variant],
        pressed && momentaryActive[variant],
      )}
    >
      {label}
      {sublabel && (
        <span className="mt-0.5 text-[0.65rem] opacity-70">{sublabel}</span>
      )}
    </button>
  );
}

/**
 * Maintained (latching) control — toggles on click. Models an E-stop mushroom
 * or a maintained fault/selector. `active` = operated/tripped.
 */
export function ToggleButton({
  label,
  sublabel,
  variant = "estop",
  active,
  onToggle,
}: {
  label: string;
  sublabel?: string;
  variant?: "estop" | "fault" | "neutral";
  active: boolean;
  onToggle: (next: boolean) => void;
}) {
  const palette = {
    estop: {
      base: "border-red-500/40 text-red-300",
      on: "bg-red-500/30 shadow-[0_0_18px_-2px_rgba(239,68,68,0.6)]",
      off: "bg-red-500/10 hover:bg-red-500/15",
    },
    fault: {
      base: "border-amber/40 text-amber",
      on: "bg-amber/25 shadow-[0_0_18px_-2px_rgba(255,176,32,0.5)]",
      off: "bg-amber/10 hover:bg-amber/15",
    },
    neutral: {
      base: "border-border text-foreground",
      on: "bg-secondary",
      off: "bg-secondary/50 hover:bg-secondary",
    },
  }[variant];

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => onToggle(!active)}
      className={cn(
        "flex min-w-24 select-none flex-col items-center justify-center rounded-lg border px-4 py-3 font-mono text-sm transition-all",
        palette.base,
        active ? palette.on : palette.off,
      )}
    >
      {label}
      {sublabel && (
        <span className="mt-0.5 text-[0.65rem] opacity-70">{sublabel}</span>
      )}
    </button>
  );
}

const lampColors = {
  amber: { on: "bg-amber shadow-[0_0_16px_2px_rgba(255,176,32,0.55)]", text: "text-amber" },
  green: {
    on: "bg-emerald-400 shadow-[0_0_16px_2px_rgba(52,211,153,0.5)]",
    text: "text-emerald-300",
  },
  red: {
    on: "bg-red-500 shadow-[0_0_16px_2px_rgba(239,68,68,0.55)]",
    text: "text-red-300",
  },
} as const;

/** Pilot light / indicator lamp. */
export function Lamp({
  on,
  label,
  color = "amber",
}: {
  on: boolean;
  label: string;
  color?: keyof typeof lampColors;
}) {
  const c = lampColors[color];
  return (
    <div className="flex flex-col items-center gap-2">
      <span
        className={cn(
          "size-8 rounded-full border border-border transition-all duration-150",
          on ? c.on : "bg-muted",
        )}
      />
      <span
        className={cn(
          "font-mono text-[0.65rem] uppercase tracking-wide transition-colors",
          on ? c.text : "text-muted-foreground",
        )}
      >
        {label}
      </span>
    </div>
  );
}

export interface IORow {
  addr: string;
  tag: string;
  value: boolean;
  /** Optional note, e.g. "NC". */
  kind?: string;
}

/** Live I/O map — addresses, tags, and current bit states. */
export function IOTable({
  inputs,
  outputs,
}: {
  inputs: IORow[];
  outputs: IORow[];
}) {
  const renderRows = (rows: IORow[]) =>
    rows.map((r) => (
      <tr key={r.addr} className="border-t border-border/60">
        <td className="py-1.5 pr-3 font-mono text-xs text-amber">{r.addr}</td>
        <td className="py-1.5 pr-3 font-mono text-xs text-foreground">
          {r.tag}
          {r.kind && (
            <span className="ml-1 text-muted-foreground/60">({r.kind})</span>
          )}
        </td>
        <td className="py-1.5 text-right">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 font-mono text-xs",
              r.value ? "text-emerald-300" : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                r.value ? "bg-emerald-400" : "bg-muted-foreground/40",
              )}
            />
            {r.value ? "1" : "0"}
          </span>
        </td>
      </tr>
    ));

  return (
    <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
      <div>
        <p className="mb-1 font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
          Inputs
        </p>
        <table className="w-full border-collapse">
          <tbody>{renderRows(inputs)}</tbody>
        </table>
      </div>
      <div>
        <p className="mb-1 font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
          Outputs
        </p>
        <table className="w-full border-collapse">
          <tbody>{renderRows(outputs)}</tbody>
        </table>
      </div>
    </div>
  );
}
