import { ScenarioViewer, type Scenario } from "@/components/plc/scenario-viewer";

const DIR = "/projects/tank-level-control/scenarios";

/*
 * Flip to `true` once all the screenshots below live in
 * /public/projects/tank-level-control/scenarios/ — then the real images replace
 * the placeholders everywhere at once.
 */
const IMAGES_READY = true;

const PUMP = (on: boolean) => ({ label: "Pump", on, color: "amber" as const });
const ALARM = (on: boolean) => ({ label: "Alarm", on, color: "red" as const });

/*
 * Story beats for the tank level program. Drop a screenshot for each at
 * /public/projects/tank-level-control/scenarios/<id>.png and they appear
 * automatically (until then a labelled placeholder is shown).
 */
const TANK_SCENARIOS: Scenario[] = [
  {
    id: "01-idle",
    label: "Idle (Auto)",
    signal: "Auto",
    lamps: [PUMP(false), ALARM(false)],
    caption:
      "Auto mode selected, tank sitting mid-level. No level float is made and there's no fault, so PUMP_CALL is unlatched and every coil is de-energized. The system is simply waiting for the level to fall.",
  },
  {
    id: "02-low-level-pump-starts",
    label: "Low level → pump starts",
    signal: "LSL",
    lamps: [PUMP(true), ALARM(false)],
    caption:
      "The level has dropped to the low setpoint and LSL is made. It sets PUMP_CALL, which drives the pump on through the Auto path — the tank begins filling.",
  },
  {
    id: "03-filling-seal-in-holds",
    label: "Filling (seal-in holds)",
    signal: "Seal-in",
    lamps: [PUMP(true), ALARM(false)],
    caption:
      "LSL clears as the level rises off the low point, but PUMP_CALL seals itself in and the pump keeps filling. This is the hysteresis latch holding — the deadband that stops the pump short-cycling at a single threshold.",
  },
  {
    id: "04-high-level-pump-stops",
    label: "High level → pump stops",
    signal: "LSH",
    lamps: [PUMP(false), ALARM(false)],
    caption:
      "The tank reaches the high setpoint and LSH is made. It breaks the seal-in, PUMP_CALL drops out, and the pump stops. The level now falls until LSL calls for the next fill.",
  },
  {
    id: "05-overflow-alarm-trips",
    label: "Overflow → alarm trips",
    signal: "LSHH",
    lamps: [PUMP(false), ALARM(true)],
    caption:
      "An overflow condition makes the high-high float LSHH. The ALARM latch energizes and seals itself in, independent of the fill logic — so the event is captured even if the level later dips.",
  },
  {
    id: "06-alarm-blocks-auto-call",
    label: "Alarm blocks auto call",
    signal: "Interlock",
    lamps: [PUMP(false), ALARM(true)],
    caption:
      "LSL makes and PUMP_CALL latches normally, but the pump stays off — the ALARM contact in Rung 3 is open and overrides the auto call. The safety interlock holds even though the fill logic wants to run.",
  },
  {
    id: "07-reset-clears-alarm",
    label: "Reset clears alarm",
    signal: "Reset",
    lamps: [PUMP(true), ALARM(false)],
    caption:
      "With the overflow condition cleared, RESET drops the ALARM latch. PUMP_CALL is still latched from the auto call, so with the interlock released the pump immediately resumes filling.",
  },
  {
    id: "08-hand-override",
    label: "Hand override",
    signal: "Hand",
    lamps: [PUMP(true), ALARM(false)],
    caption:
      "Hand mode overrides the auto logic entirely — the pump runs regardless of tank level, for priming or manual testing. It stays subject to the alarm interlock, so an overflow would still force it off.",
  },
];

export function TankScenarios() {
  const scenarios = TANK_SCENARIOS.map((s) => ({
    ...s,
    src: IMAGES_READY ? `${DIR}/${s.id}.png` : undefined,
  }));

  return (
    <ScenarioViewer
      title="Step through the rungs"
      subtitle="Captured live from the OpenPLC editor — pick a signal to see its power flow. Click any frame to enlarge."
      scenarios={scenarios}
      placeholderDir={DIR}
    />
  );
}
