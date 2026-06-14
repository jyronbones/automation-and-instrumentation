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
  overload: boolean; // NC overload aux — latched when tripped
}

/* Persistent PLC memory between scans. */
interface State {
  motor: boolean; // the sealed-in coil
}

interface Outputs {
  motor: boolean;
  run: boolean;
}

/*
 * The control logic — a direct twin of the ladder:
 *   Motor = (Start OR Motor) AND Stop AND E-Stop AND OL
 * NC field devices read TRUE (closed) when healthy, so operating one (pressing
 * Stop / E-Stop, or an overload trip) makes its term FALSE and drops the coil.
 */
const scan: ScanFn<Inputs, State, Outputs> = ({ inputs, state }) => {
  const stopOk = !inputs.stopPb; // NC: closed unless pressed
  const estopOk = !inputs.estop; // NC: closed unless operated
  const olOk = !inputs.overload; // NC: closed unless tripped

  const motor = (inputs.startPb || state.motor) && stopOk && estopOk && olOk;

  return { state: { motor }, outputs: { motor, run: motor } };
};

export function MotorSim() {
  const { inputs, outputs, setInput } = usePlc<Inputs, State, Outputs>({
    scan,
    initialInputs: { startPb: false, stopPb: false, estop: false, overload: false },
    initialState: { motor: false },
    initialOutputs: { motor: false, run: false },
  });

  return (
    <PlcPanel
      title="Motor Start/Stop — live"
      subtitle="JavaScript twin · ~100 ms scan cycle"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        {/* Motor + indicators */}
        <div className="flex items-center gap-8">
          <Rotor running={outputs.motor} />
          <div className="flex gap-6">
            <Lamp on={outputs.motor} label="Motor" color="amber" />
            <Lamp on={outputs.run} label="Run" color="green" />
          </div>
        </div>

        {/* Operator controls */}
        <div className="flex flex-col gap-5">
          <ControlGroup label="Control station">
            <div className="flex flex-wrap gap-3">
              <MomentaryButton
                label="Start"
                sublabel="NO"
                variant="start"
                pressed={inputs.startPb}
                onPress={(d) => setInput("startPb", d)}
              />
              <MomentaryButton
                label="Stop"
                sublabel="NC"
                variant="stop"
                pressed={inputs.stopPb}
                onPress={(d) => setInput("stopPb", d)}
              />
            </div>
          </ControlGroup>

          <ControlGroup label="Safety / protection (latching)">
            <div className="flex flex-wrap gap-3">
              <ToggleButton
                label={inputs.estop ? "E-Stop ✓" : "E-Stop"}
                sublabel="press / reset"
                variant="estop"
                active={inputs.estop}
                onToggle={(v) => setInput("estop", v)}
              />
              <ToggleButton
                label={inputs.overload ? "OL Tripped" : "Overload"}
                sublabel="trip / reset"
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
          { addr: "%IX0.0", tag: "Start", value: inputs.startPb },
          { addr: "%IX0.1", tag: "Stop", value: !inputs.stopPb, kind: "NC" },
          { addr: "%IX0.2", tag: "E-Stop", value: !inputs.estop, kind: "NC" },
          { addr: "%IX0.3", tag: "Overload", value: !inputs.overload, kind: "NC" },
        ]}
        outputs={[
          { addr: "%QX0.0", tag: "Motor", value: outputs.motor },
          { addr: "%QX0.1", tag: "Run light", value: outputs.run },
        ]}
      />

      <p className="mt-4 font-mono text-[0.7rem] leading-relaxed text-muted-foreground">
        NC inputs read <span className="text-emerald-300">1</span> when healthy;
        operating the device (or a fault) drives them to{" "}
        <span className="text-muted-foreground">0</span> — fail-safe by design.
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
