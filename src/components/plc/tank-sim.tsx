"use client";

import { cn } from "@/lib/utils";
import { usePlc, type ScanFn } from "@/lib/plc/use-plc";
import {
  ControlGroup,
  IOTable,
  Lamp,
  MomentaryButton,
  PlcPanel,
} from "@/components/plc/controls";

/* Float / alarm setpoints, as % of tank height. */
const LOW = 25; // low float (LSL)
const HIGH = 75; // high float (LSH)
const OVERFLOW = 95; // high-high float (LSHH)

/* Plant rates, in % per second. */
const RISE = 14; // net fill rate while the pump runs
const DRAIN = 7; // downstream demand draw while idle

type Hoa = "hand" | "off" | "auto";

interface Inputs {
  hoa: Hoa;
  ack: boolean; // momentary acknowledge / reset
}

interface State {
  level: number; // plant: tank level %
  fill: boolean; // PLC: Fill latch (the deadband memory)
  overflow: boolean; // PLC: latched overflow alarm
}

interface Outputs {
  pump: boolean;
  alarm: boolean;
  level: number;
  lsl: boolean;
  lsh: boolean;
  lshh: boolean;
}

/*
 * One tick = plant + controller co-simulation.
 *   1. PLANT  — derive the float switches from the current level.
 *   2. PLC    — the actual control logic (this is the ladder twin).
 *   3. PLANT  — integrate the level forward using the new pump state.
 */
const scan: ScanFn<Inputs, State, Outputs> = ({ inputs, state, dt }) => {
  const d = Math.min(dt, 0.25); // clamp big gaps (e.g. backgrounded tab)

  // 1. PLANT — float switches are "wet" (1) when liquid reaches them.
  const lsl = state.level >= LOW;
  const lsh = state.level >= HIGH;
  const lshh = state.level >= OVERFLOW;

  const hoaHand = inputs.hoa === "hand";
  const hoaAuto = inputs.hoa === "auto";

  // 2. PLC LOGIC ------------------------------------------------------------
  // Fill latch: SET when the low float clears (level fell below LSL),
  // RESET when the high float is made (LSH). Reset is evaluated last, so
  // "stop filling" dominates — the deadband that prevents short-cycling.
  let fill = state.fill;
  if (!lsl) fill = true;
  if (lsh) fill = false;

  // Overflow alarm: latch on high-high, clear only on ACK once recovered.
  let overflow = state.overflow;
  if (lshh) overflow = true;
  if (inputs.ack && !lshh) overflow = false;

  const pumpAuto = fill && hoaAuto && !overflow;
  const pumpHand = hoaHand && !overflow;
  const pump = pumpAuto || pumpHand;
  // ------------------------------------------------------------------------

  // 3. PLANT — advance the level with the new pump command.
  let level = state.level + (pump ? RISE : -DRAIN) * d;
  level = Math.max(0, Math.min(100, level));

  return {
    state: { level, fill, overflow },
    outputs: { pump, alarm: overflow, level, lsl, lsh, lshh },
  };
};

export function TankSim() {
  const { inputs, outputs, setInput } = usePlc<Inputs, State, Outputs>({
    scan,
    initialInputs: { hoa: "auto", ack: false },
    initialState: { level: 45, fill: false, overflow: false },
    initialOutputs: {
      pump: false,
      alarm: false,
      level: 45,
      lsl: true,
      lsh: false,
      lshh: false,
    },
  });

  const status = outputs.alarm
    ? "OVERFLOW — alarm latched"
    : outputs.pump
      ? "Pump running — filling"
      : "Idle";

  return (
    <PlcPanel title="Tank Level Control — live" subtitle="JavaScript twin · ~50 ms scan cycle">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <Tank
          level={outputs.level}
          pump={outputs.pump}
          alarm={outputs.alarm}
        />

        <div className="flex flex-1 flex-col gap-5">
          <ControlGroup label="Mode — Hand / Off / Auto">
            <HoaSelector value={inputs.hoa} onChange={(v) => setInput("hoa", v)} />
          </ControlGroup>

          <ControlGroup label="Alarm">
            <div className="flex items-center gap-5">
              <MomentaryButton
                label="Ack / Reset"
                variant="neutral"
                pressed={inputs.ack}
                onPress={(d) => setInput("ack", d)}
              />
              <Lamp on={outputs.pump} label="Pump" color="green" />
              <Lamp on={outputs.alarm} label="Overflow" color="red" />
            </div>
          </ControlGroup>

          <p
            className={cn(
              "font-mono text-xs",
              outputs.alarm
                ? "text-red-300"
                : outputs.pump
                  ? "text-emerald-300"
                  : "text-muted-foreground",
            )}
          >
            {status}
          </p>
          <p className="font-mono text-[0.7rem] leading-relaxed text-muted-foreground">
            In <span className="text-amber">Auto</span> the pump cycles between the
            low and high floats — the deadband stops short-cycling. Switch to{" "}
            <span className="text-amber">Hand</span> to force it past the overflow
            float and watch the alarm latch (it won&apos;t clear until the level
            recovers and you press Ack).
          </p>
        </div>
      </div>

      <hr className="my-6 border-border" />

      <IOTable
        inputs={[
          { addr: "%IX0.0", tag: "LSL", value: outputs.lsl, kind: "low float" },
          { addr: "%IX0.1", tag: "LSH", value: outputs.lsh, kind: "high float" },
          { addr: "%IX0.2", tag: "LSHH", value: outputs.lshh, kind: "overflow" },
          { addr: "%IX0.3", tag: "HOA-Hand", value: inputs.hoa === "hand" },
          { addr: "%IX0.4", tag: "HOA-Auto", value: inputs.hoa === "auto" },
          { addr: "%IX0.5", tag: "Ack/Reset", value: inputs.ack },
        ]}
        outputs={[
          { addr: "%QX0.0", tag: "Pump", value: outputs.pump },
          { addr: "%QX0.1", tag: "Overflow alarm", value: outputs.alarm },
        ]}
      />
    </PlcPanel>
  );
}

/* 3-position Hand-Off-Auto selector. */
function HoaSelector({
  value,
  onChange,
}: {
  value: Hoa;
  onChange: (v: Hoa) => void;
}) {
  const opts: [Hoa, string][] = [
    ["hand", "Hand"],
    ["off", "Off"],
    ["auto", "Auto"],
  ];
  return (
    <div className="inline-flex rounded-lg border border-border bg-secondary/40 p-1 font-mono text-xs">
      {opts.map(([v, label]) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          aria-pressed={value === v}
          className={cn(
            "rounded-md px-4 py-1.5 transition-colors",
            value === v
              ? "bg-amber/20 text-amber"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/* Animated SVG tank. Water height tracks the live level; floats light up. */
function Tank({
  level,
  pump,
  alarm,
}: {
  level: number;
  pump: boolean;
  alarm: boolean;
}) {
  const left = 40;
  const right = 150;
  const top = 20;
  const bottom = 220;
  const innerH = bottom - top; // 200
  const waterH = (level / 100) * innerH;
  const waterY = bottom - waterH;
  const yFor = (pct: number) => bottom - (pct / 100) * innerH;

  const marks: { pct: number; tag: string; active: boolean; danger?: boolean }[] = [
    { pct: OVERFLOW, tag: "LSHH", active: level >= OVERFLOW, danger: true },
    { pct: HIGH, tag: "LSH", active: level >= HIGH },
    { pct: LOW, tag: "LSL", active: level >= LOW },
  ];

  return (
    <svg viewBox="0 0 210 240" className="h-64 w-auto shrink-0" aria-hidden>
      {/* inflow pipe + arrow (lights amber while pumping) */}
      <line
        x1={left + 18}
        y1={top - 12}
        x2={left + 18}
        y2={top}
        stroke={pump ? "var(--amber)" : "var(--color-muted-foreground)"}
        strokeWidth={3}
      />
      <polygon
        points={`${left + 13},${top - 4} ${left + 23},${top - 4} ${left + 18},${top + 4}`}
        fill={pump ? "var(--amber)" : "var(--color-muted-foreground)"}
      />

      {/* water */}
      <rect
        x={left}
        y={waterY}
        width={right - left}
        height={waterH}
        fill={alarm ? "#7f1d1d" : "#2f6f8f"}
        opacity={0.85}
        className="transition-all duration-150 ease-linear"
      />
      <rect
        x={left}
        y={waterY}
        width={right - left}
        height={Math.min(3, waterH)}
        fill={alarm ? "#ef4444" : "#5fb3d9"}
        className="transition-all duration-150 ease-linear"
      />

      {/* tank walls (drawn over water so edges stay crisp) */}
      <rect
        x={left}
        y={top}
        width={right - left}
        height={innerH}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth={2}
        rx={4}
      />

      {/* level readout */}
      <text
        x={(left + right) / 2}
        y={top + 22}
        textAnchor="middle"
        className="fill-foreground font-mono"
        fontSize={20}
      >
        {Math.round(level)}%
      </text>

      {/* float markers + labels */}
      {marks.map((m) => {
        const y = yFor(m.pct);
        const color = m.active
          ? m.danger
            ? "#ef4444"
            : "var(--amber)"
          : "var(--color-muted-foreground)";
        return (
          <g key={m.tag}>
            <line x1={right} y1={y} x2={right + 8} y2={y} stroke={color} strokeWidth={2} />
            <circle cx={right + 8} cy={y} r={2.5} fill={color} />
            <text
              x={right + 14}
              y={y + 3.5}
              fontSize={9}
              fill={color}
              className="font-mono"
            >
              {m.tag}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
