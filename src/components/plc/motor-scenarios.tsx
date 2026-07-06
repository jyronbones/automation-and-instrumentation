import { ScenarioViewer, type Scenario } from "@/components/plc/scenario-viewer";

const DIR = "/projects/motor-start-stop/scenarios";

/*
 * Flip to `true` once all the screenshots below live in
 * /public/projects/motor-start-stop/scenarios/ — then the real images replace
 * the placeholders everywhere at once.
 */
const IMAGES_READY = true;

/*
 * Story beats for the motor program. Drop a screenshot for each at
 * /public/projects/motor-start-stop/scenarios/<id>.png and they appear
 * automatically (until then a labelled placeholder is shown).
 */
const MOTOR_SCENARIOS: Scenario[] = [
  {
    id: "01-idle",
    label: "Idle",
    signal: "Stopped",
    lamps: [
      { label: "Motor", on: false, color: "amber" },
      { label: "Run", on: false, color: "green" },
      { label: "Fault", on: false, color: "red" },
    ],
    caption:
      "All inputs healthy, motor off. The Start contact and the Motor seal contact are both open, so the rung is dead and the coil is de-energized.",
  },
  {
    id: "02-start",
    label: "Start pressed",
    signal: "Start",
    lamps: [
      { label: "Motor", on: true, color: "amber" },
      { label: "Run", on: true, color: "green" },
      { label: "Fault", on: false, color: "red" },
    ],
    caption:
      "Holding Start completes Rung 1 and the Motor coil energizes — power reaches the coil through the Start contact itself. At the same moment the Motor seal contact (parallel) closes, ready to take over. The Run light (Rung 2) follows the coil.",
  },
  {
    id: "03-sealed",
    label: "Running (seal-in)",
    signal: "Seal-in",
    lamps: [
      { label: "Motor", on: true, color: "amber" },
      { label: "Run", on: true, color: "green" },
      { label: "Fault", on: false, color: "red" },
    ],
    caption:
      "Start is released — but the motor stays on. The Start contact is open again, so power now flows only through the Motor seal contact. That's the latch in action: a momentary press gives continuous run.",
  },
  {
    id: "04-stop",
    label: "Stop pressed",
    signal: "Stop",
    lamps: [
      { label: "Motor", on: false, color: "amber" },
      { label: "Run", on: false, color: "green" },
      { label: "Fault", on: false, color: "red" },
    ],
    caption:
      "The normally-closed Stop contact opens, breaking Rung 1. The coil drops out, the seal contact opens with it, and the motor stays off until Start is pressed again.",
  },
  {
    id: "05-estop",
    label: "E-Stop pressed",
    signal: "E-Stop",
    lamps: [
      { label: "Motor", on: false, color: "amber" },
      { label: "Run", on: false, color: "green" },
      { label: "Fault", on: false, color: "red" },
    ],
    caption:
      "The E-Stop interlock opens at the head of Rung 1 and drops the coil immediately, overriding the seal-in. It isn't latched — once released, the line is ready to start again.",
  },
  {
    id: "06-overload",
    label: "Overload → fault",
    signal: "Overload",
    lamps: [
      { label: "Motor", on: false, color: "amber" },
      { label: "Run", on: false, color: "green" },
      { label: "Fault", on: true, color: "red" },
    ],
    caption:
      "An overload sets the Fault latch in Rung 3, which seals itself in. The Fault contact opens Rung 1 (motor off) and the Fault light energizes in Rung 5. It will not restart on its own.",
  },
  {
    id: "07-reset",
    label: "Reset",
    signal: "Reset",
    lamps: [
      { label: "Motor", on: false, color: "amber" },
      { label: "Run", on: false, color: "green" },
      { label: "Fault", on: false, color: "red" },
    ],
    caption:
      "With the overload cleared, Reset fires the (R) coil in Rung 4 and clears the Fault bit. The Fault light goes out and the system is ready to start. (If the overload were still present, Rung 3 would simply re-latch.)",
  },
];

export function MotorScenarios() {
  const scenarios = MOTOR_SCENARIOS.map((s) => ({
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
