"use client";

import { cn } from "@/lib/utils";
import { usePlc, type ScanFn } from "@/lib/plc/use-plc";
import {
  ControlGroup,
  IOTable,
  Lamp,
  MomentaryButton,
  PlcPanel,
  ToggleButton,
} from "@/components/plc/controls";

/* Field signals (as the field sees them: a button/contact being operated). */
interface Inputs {
  startPb: boolean; // NO pushbutton — held
  stopPb: boolean; // NC pushbutton — held (operating it breaks the rung)
  estop: boolean; // NC mushroom — latched when operated
  overload: boolean; // overcurrent condition present (OL relay tripped)
  reset: boolean; // NO momentary — clears a latched fault
}

/* Persistent PLC memory between scans. */
interface State {
  motor: boolean; // the sealed-in coil
  fault: boolean; // latched overload fault memory
}

interface Outputs {
  motor: boolean;
  run: boolean;
  fault: boolean;
}

/*
 * Mirrors the five-rung OpenPLC program:
 *   R1  Motor = (Start OR Motor) AND NOT E-Stop AND NOT Fault AND NOT Stop AND NOT Overload
 *   R2  RunLight   = Motor
 *   R3  Fault      = Overload OR Fault                            ' latch / seal-in
 *   R4  Fault      := 0 when Reset                            ' (R) reset coil
 *   R5  FaultLight = Fault
 *
 * The motor rung carries both the live Overload contact (immediate stop) and the
 * latched Fault bit (no restart until reset). Stop / E-Stop are direct interlocks.
 */
const scan: ScanFn<Inputs, State, Outputs> = ({ inputs, state }) => {
  const stopOk = !inputs.stopPb; // NC: closed unless pressed
  const estopOk = !inputs.estop; // NC: closed unless operated
  const olOk = !inputs.overload; // NC: closed unless overloaded

  // R3 sets/seals the fault; R4 is a reset coil on Reset. Because R3 seals in,
  // the fault re-latches next scan if the overload is still present — so Reset
  // only "sticks" once the overcurrent has actually cleared.
  let fault = state.fault;
  if (inputs.overload) fault = true; // R3: set / seal-in
  if (inputs.reset) fault = false; // R4: (R) reset coil

  // R1 seal-in: Start (or sealed Motor) with every interlock healthy.
  const motor =
    (inputs.startPb || state.motor) && estopOk && !fault && stopOk && olOk;

  return { state: { motor, fault }, outputs: { motor, run: motor, fault } };
};

export function MotorSim() {
  const { inputs, outputs, setInput } = usePlc<Inputs, State, Outputs>({
    scan,
    initialInputs: {
      startPb: false,
      stopPb: false,
      estop: false,
      overload: false,
      reset: false,
    },
    initialState: { motor: false, fault: false },
    initialOutputs: { motor: false, run: false, fault: false },
  });

  return (
    <PlcPanel
      title="Motor Start/Stop — live"
      subtitle="JavaScript twin · ~50 ms scan cycle"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        {/* Motor + indicators */}
        <div className="flex items-center gap-8">
          <Rotor running={outputs.motor} />
          <div className="flex gap-6">
            <Lamp on={outputs.motor} label="Motor" color="amber" />
            <Lamp on={outputs.run} label="Run" color="green" />
            <Lamp on={outputs.fault} label="Fault" color="red" />
          </div>
        </div>

        {/* Operator controls */}
        <div className="flex flex-col gap-5">
          <ControlGroup label="Control station">
            <div className="flex flex-wrap gap-3">
              <MomentaryButton
                label="Start"
                variant="start"
                pressed={inputs.startPb}
                onPress={(d) => setInput("startPb", d)}
              />
              <MomentaryButton
                label="Stop"
                variant="stop"
                pressed={inputs.stopPb}
                onPress={(d) => setInput("stopPb", d)}
              />
              <MomentaryButton
                label="Reset"
                variant="neutral"
                pressed={inputs.reset}
                onPress={(d) => setInput("reset", d)}
              />
            </div>
          </ControlGroup>

          <ControlGroup label="Safety / protection (latching)">
            <div className="flex flex-wrap gap-3">
              <ToggleButton
                label={inputs.estop ? "E-Stop ✓" : "E-Stop"}
                variant="estop"
                active={inputs.estop}
                onToggle={(v) => setInput("estop", v)}
              />
              <ToggleButton
                label={inputs.overload ? "OL Tripped" : "Overload"}
                variant="fault"
                active={inputs.overload}
                onToggle={(v) => setInput("overload", v)}
              />
            </div>
          </ControlGroup>
        </div>
      </div>

      <hr className="my-6 border-border" />

      <IOTable
        inputs={[
          { addr: "%IX0.0", tag: "Start", value: inputs.startPb, kind: "NO" },
          { addr: "%IX0.1", tag: "Stop", value: !inputs.stopPb, kind: "NC" },
          { addr: "%IX0.2", tag: "E-Stop", value: !inputs.estop, kind: "NC" },
          { addr: "%IX0.3", tag: "Overload", value: !inputs.overload, kind: "NC" },
          { addr: "%IX0.4", tag: "Reset", value: inputs.reset, kind: "NO" },
        ]}
        outputs={[
          { addr: "%QX0.0", tag: "Motor", value: outputs.motor },
          { addr: "%QX0.1", tag: "Run light", value: outputs.run },
          { addr: "%QX0.2", tag: "Fault light", value: outputs.fault },
        ]}
      />

      <p className="mt-4 font-mono text-[0.7rem] leading-relaxed text-muted-foreground">
        NC inputs read <span className="text-emerald-300">1</span>{" "}
        when healthy. An overload{" "}
        <span className="text-red-300">latches</span>{" "}
        the fault, so the motor stays down and won&apos;t restart until the
        overload clears and you press{" "}
        <span className="text-amber">Reset</span>.
      </p>
    </PlcPanel>
  );
}

/** Spinning rotor graphic — turns while the motor coil is energized. */
function Rotor({ running }: { running: boolean }) {
  return (
    <div className="relative grid size-20 place-items-center">
      <span
        className={cn(
          "absolute inset-0 rounded-full border border-border transition-colors",
          running && "border-amber/40",
        )}
      />
      <svg
        viewBox="0 0 100 100"
        className={cn(
          "size-14 text-muted-foreground transition-colors",
          running && "animate-spin text-amber",
        )}
        style={running ? { animationDuration: "1.1s" } : undefined}
        aria-hidden
      >
        <circle cx="50" cy="50" r="10" fill="currentColor" />
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <rect
            key={deg}
            x="46"
            y="8"
            width="8"
            height="30"
            rx="4"
            fill="currentColor"
            transform={`rotate(${deg} 50 50)`}
          />
        ))}
      </svg>
    </div>
  );
}
