"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { usePlc, type ScanFn } from "@/lib/plc/use-plc";
import { ton, tof, timerInit, type TimerState } from "@/lib/plc/timers";
import {
  ControlGroup,
  IOTable,
  Lamp,
  MomentaryButton,
  PlcPanel,
  ToggleButton,
} from "@/components/plc/controls";

/* Timer presets (seconds) — trimmed from plant values for a watchable demo. */
const T_HORN = 6; // pre-start warning
const T_SEQ = 2.5; // gap after CV-102 proves motion before CV-101 starts
const T_STOP = 4; // CV-102 clear-off run-on after stop
const T_ZS = 4; // zero-speed trip delay

type Phase = "idle" | "warning" | "run102" | "running" | "stopping" | "fault";

interface Inputs {
  start: boolean;
  stop: boolean;
  pullcord: boolean; // operated (NC field device)
  reset: boolean;
  jam101: boolean; // fault injection: stall CV-101
  jam102: boolean; // fault injection: stall CV-102
}

interface State {
  phase: Phase;
  tHorn: TimerState;
  tSeq: TimerState;
  tStop: TimerState;
  tZs101: TimerState;
  tZs102: TimerState;
  faultMsg: string;
}

interface Outputs {
  horn: boolean;
  m101: boolean; // feed belt
  m102: boolean; // discharge belt
  zs101: boolean;
  zs102: boolean;
  phase: Phase;
  fault: boolean;
  faultMsg: string;
  hornRemaining: number;
}

/* Motor / horn outputs are a pure function of the phase. */
function commandsFor(phase: Phase): { horn: boolean; m101: boolean; m102: boolean } {
  switch (phase) {
    case "warning":
      return { horn: true, m101: false, m102: false };
    case "run102":
      return { horn: false, m101: false, m102: true };
    case "running":
      return { horn: false, m101: true, m102: true };
    case "stopping":
      return { horn: false, m101: false, m102: true }; // discharge clears off
    default:
      return { horn: false, m101: false, m102: false };
  }
}

const scan: ScanFn<Inputs, State, Outputs> = ({ inputs, state, dt }) => {
  const d = Math.min(dt, 0.25);
  const safe = !inputs.pullcord; // NC pull-cord: healthy when not operated

  // Commands implied by the current phase, and the resulting belt motion.
  const cmd = commandsFor(state.phase);
  const zs101 = cmd.m101 && !inputs.jam101; // belt moves if driven and not jammed
  const zs102 = cmd.m102 && !inputs.jam102;

  // Zero-speed monitors: motor commanded ON but no motion proven.
  const tZs101 = ton(state.tZs101, cmd.m101 && !zs101, T_ZS, d);
  const tZs102 = ton(state.tZs102, cmd.m102 && !zs102, T_ZS, d);

  // Fault detection (pull-cord dominates).
  let triggered = "";
  if (!safe) triggered = "Pull-cord / E-stop operated";
  else if (tZs102.q) triggered = "Zero-speed fault — CV-102";
  else if (tZs101.q) triggered = "Zero-speed fault — CV-101";

  let phase = state.phase;
  let { tHorn, tSeq, tStop } = state;
  let faultMsg = state.faultMsg;

  if (triggered && phase !== "fault") {
    phase = "fault";
    faultMsg = triggered;
    tHorn = timerInit();
    tSeq = timerInit();
    tStop = timerInit();
  } else {
    switch (state.phase) {
      case "idle":
        if (inputs.start && safe) {
          phase = "warning";
          tHorn = timerInit();
        }
        break;
      case "warning":
        tHorn = ton(state.tHorn, true, T_HORN, d);
        if (inputs.stop) phase = "idle";
        else if (tHorn.q) {
          phase = "run102"; // horn done → start discharge belt
          tSeq = timerInit();
        }
        break;
      case "run102":
        // wait for CV-102 to prove motion, then a short delay, then start feed
        tSeq = ton(state.tSeq, zs102, T_SEQ, d);
        if (inputs.stop) {
          phase = "stopping";
          tStop = timerInit();
        } else if (tSeq.q) {
          phase = "running";
        }
        break;
      case "running":
        if (inputs.stop) {
          phase = "stopping"; // feed drops immediately (see commandsFor)
          tStop = timerInit();
        }
        break;
      case "stopping":
        tStop = tof(state.tStop, false, T_STOP, d); // off-delay run-on
        if (!tStop.q) phase = "idle";
        break;
      case "fault":
        if (safe && inputs.reset) {
          phase = "idle";
          faultMsg = "";
        }
        break;
    }
  }

  // Outputs reflect the resolved phase (transitions show immediately).
  const out = commandsFor(phase);
  return {
    state: { phase, tHorn, tSeq, tStop, tZs101, tZs102, faultMsg },
    outputs: {
      horn: out.horn,
      m101: out.m101,
      m102: out.m102,
      zs101: out.m101 && !inputs.jam101,
      zs102: out.m102 && !inputs.jam102,
      phase,
      fault: phase === "fault",
      faultMsg,
      hornRemaining: phase === "warning" ? Math.max(0, T_HORN - tHorn.elapsed) : 0,
    },
  };
};

const PHASE_LABEL: Record<Phase, string> = {
  idle: "Stopped",
  warning: "Pre-start warning",
  run102: "Starting discharge (CV-102)",
  running: "Running",
  stopping: "Stopping — clearing CV-102",
  fault: "Faulted",
};

export function ConveyorSim() {
  const { inputs, outputs, setInput } = usePlc<Inputs, State, Outputs>({
    scan,
    initialInputs: {
      start: false,
      stop: false,
      pullcord: false,
      reset: false,
      jam101: false,
      jam102: false,
    },
    initialState: {
      phase: "idle",
      tHorn: timerInit(),
      tSeq: timerInit(),
      tStop: timerInit(),
      tZs101: timerInit(),
      tZs102: timerInit(),
      faultMsg: "",
    },
    initialOutputs: {
      horn: false,
      m101: false,
      m102: false,
      zs101: false,
      zs102: false,
      phase: "idle",
      fault: false,
      faultMsg: "",
      hornRemaining: 0,
    },
  });

  return (
    <PlcPanel
      title="Conveyor Sequencing — live"
      subtitle="JavaScript twin · ~50 ms scan cycle"
    >
      {/* Status banner */}
      <div
        className={cn(
          "mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-2.5 font-mono text-sm",
          outputs.fault
            ? "border-red-500/40 bg-red-500/10 text-red-300"
            : outputs.horn
              ? "border-amber/40 bg-amber/10 text-amber"
              : "border-border bg-secondary/40 text-muted-foreground",
        )}
      >
        <span>
          {outputs.fault ? outputs.faultMsg : PHASE_LABEL[outputs.phase]}
        </span>
        {outputs.horn && (
          <span className="inline-flex items-center gap-2">
            <HornIcon />
            HORN — {outputs.hornRemaining.toFixed(1)}s
          </span>
        )}
      </div>

      <ConveyorScene
        m101={outputs.m101}
        m102={outputs.m102}
        zs101={outputs.zs101}
        zs102={outputs.zs102}
      />

      <div className="mt-6 flex flex-col gap-5">
        <ControlGroup label="Operator station">
          <div className="flex flex-wrap items-center gap-3">
            <MomentaryButton
              label="Start"
              variant="start"
              pressed={inputs.start}
              onPress={(d) => setInput("start", d)}
            />
            <MomentaryButton
              label="Stop"
              variant="stop"
              pressed={inputs.stop}
              onPress={(d) => setInput("stop", d)}
            />
            <MomentaryButton
              label="Reset"
              variant="neutral"
              pressed={inputs.reset}
              onPress={(d) => setInput("reset", d)}
            />
            <Lamp on={outputs.m102} label="CV-102" color="green" />
            <Lamp on={outputs.m101} label="CV-101" color="green" />
            <Lamp on={outputs.fault} label="Fault" color="red" />
          </div>
        </ControlGroup>

        <ControlGroup label="Safety & fault injection (latching)">
          <div className="flex flex-wrap gap-3">
            <ToggleButton
              label={inputs.pullcord ? "Cord pulled" : "Pull-cord"}
              sublabel="operate / reset"
              variant="estop"
              active={inputs.pullcord}
              onToggle={(v) => setInput("pullcord", v)}
            />
            <ToggleButton
              label="Jam CV-101"
              sublabel="stall belt"
              variant="fault"
              active={inputs.jam101}
              onToggle={(v) => setInput("jam101", v)}
            />
            <ToggleButton
              label="Jam CV-102"
              sublabel="stall belt"
              variant="fault"
              active={inputs.jam102}
              onToggle={(v) => setInput("jam102", v)}
            />
          </div>
        </ControlGroup>

        <p className="font-mono text-[0.7rem] leading-relaxed text-muted-foreground">
          Press <span className="text-amber">Start</span>: the horn sounds, then
          the discharge belt (CV-102) starts, then the feed belt (CV-101) — so
          material never lands on a stopped belt. <span className="text-amber">Stop</span>{" "}
          drops the feed first and lets CV-102 clear. Pull the cord or jam a belt
          to trip the line; clear the cause, then <span className="text-amber">Reset</span>.
        </p>
      </div>

      <hr className="my-6 border-border" />

      <IOTable
        inputs={[
          { addr: "%IX0.0", tag: "Start", value: inputs.start },
          { addr: "%IX0.1", tag: "Stop", value: !inputs.stop, kind: "NC" },
          { addr: "%IX0.2", tag: "Pull-cord", value: !inputs.pullcord, kind: "NC" },
          { addr: "%IX0.3", tag: "ZS-101", value: outputs.zs101 },
          { addr: "%IX0.4", tag: "ZS-102", value: outputs.zs102 },
          { addr: "%IX0.5", tag: "Reset", value: inputs.reset },
        ]}
        outputs={[
          { addr: "%QX0.0", tag: "Horn", value: outputs.horn },
          { addr: "%QX0.1", tag: "M-102 discharge", value: outputs.m102 },
          { addr: "%QX0.2", tag: "M-101 feed", value: outputs.m101 },
        ]}
      />
    </PlcPanel>
  );
}

/* --------------------------- visuals --------------------------- */

function ConveyorScene({
  m101,
  m102,
  zs101,
  zs102,
}: {
  m101: boolean;
  m102: boolean;
  zs101: boolean;
  zs102: boolean;
}) {
  return (
    <div className="relative h-52 w-full max-w-xl">
      {/* chute between the belts */}
      <svg
        className="absolute left-[50%] top-[44px] h-[78px] w-[70px] text-border"
        viewBox="0 0 70 78"
        aria-hidden
      >
        <line x1="6" y1="2" x2="40" y2="76" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" />
        <line x1="34" y1="2" x2="64" y2="76" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" />
      </svg>

      {/* CV-101 — feed belt (upper) */}
      <div className="absolute left-0 top-6 w-[56%]">
        <Belt running={m101} showMaterial={m101} label="CV-101 · feed" zs={zs101} />
      </div>

      {/* CV-102 — discharge belt (lower) */}
      <div className="absolute left-[40%] top-[120px] w-[58%]">
        <Belt
          running={m102}
          showMaterial={m102}
          label="CV-102 · discharge"
          zs={zs102}
        />
      </div>

      {/* stockpile */}
      <div
        className="absolute right-0 top-[132px] h-0 w-0 border-x-[26px] border-b-[34px] border-x-transparent border-b-muted-foreground/30"
        aria-hidden
      />
    </div>
  );
}

function Belt({
  running,
  showMaterial,
  label,
  zs,
}: {
  running: boolean;
  showMaterial: boolean;
  label: string;
  zs: boolean;
}) {
  return (
    <div className="relative">
      <div className="relative h-3 overflow-hidden rounded-full border border-border bg-secondary">
        <div className={cn("belt-surface absolute inset-0", running && "is-running")} />
        {showMaterial &&
          [0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="ore-chunk absolute top-1/2 size-2 -translate-y-1/2 rounded-[2px] bg-amber/80"
              style={
                { "--dur": `${2 + i * 0.15}s`, "--delay": `${i * 0.45}s` } as CSSProperties
              }
            />
          ))}
      </div>
      <Roller running={running} style={{ left: -9 }} />
      <Roller running={running} style={{ right: -9 }} />
      <div className="mt-3 flex items-center gap-2">
        <span className="font-mono text-[0.65rem] text-muted-foreground">{label}</span>
        <span
          className={cn(
            "size-1.5 rounded-full",
            zs ? "bg-emerald-400" : "bg-muted-foreground/40",
          )}
          title="zero-speed (motion)"
        />
      </div>
    </div>
  );
}

function Roller({ running, style }: { running: boolean; style?: CSSProperties }) {
  return (
    <svg
      viewBox="0 0 20 20"
      style={{ ...style, animationDuration: running ? "0.6s" : undefined }}
      className={cn(
        "absolute top-[6px] size-4 -translate-y-1/2 text-muted-foreground/70",
        running && "animate-spin",
      )}
      aria-hidden
    >
      <circle cx="10" cy="10" r="8" fill="var(--secondary)" stroke="currentColor" strokeWidth="1.5" />
      <line x1="10" y1="3" x2="10" y2="17" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function HornIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5 animate-pulse" fill="currentColor" aria-hidden>
      <path d="M3 10v4h4l5 5V5L7 10H3z" />
      <path
        d="M16 8a5 5 0 0 1 0 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
