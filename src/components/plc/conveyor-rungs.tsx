import { ScenarioViewer, type Scenario } from "@/components/plc/scenario-viewer";

const DIR = "/projects/conveyor-sequencing";

const IMAGES_READY = true;

/*
 * The conveyor ladder, one rung at a time. Unlike the motor and tank viewers,
 * these are the static rungs of the OpenPLC program — not live scan states — so
 * there are no indicator lamps, just the rung, its output, and what it does.
 * Screenshots live at /public/projects/conveyor-sequencing/<id>.png.
 */
const CONVEYOR_RUNGS: Scenario[] = [
  {
    id: "01-run-cmd-latch",
    label: "Run latch",
    signal: "RUN_CMD",
    caption:
      "The master run command. Start latches RUN_CMD and it seals itself in — but only holds while Stop and the Pull-cord are healthy and no fault is standing. Drop any of those interlocks and the whole line falls with it.",
  },
  {
    id: "02-horn-timer",
    label: "Horn timer",
    signal: "HORN_DONE",
    caption:
      "A TON on-delay timer. The moment RUN_CMD engages, T_horn starts its ~10 s count; when it finishes, HORN_DONE latches. Nothing on the line moves during this window.",
  },
  {
    id: "03-horn-output",
    label: "Horn output",
    signal: "Horn",
    caption:
      "The horn sounds while RUN_CMD is active and HORN_DONE hasn't finished — the full pre-start countdown. When the timer completes, the horn goes quiet and the belts are cleared to start.",
  },
  {
    id: "04-m102-cmd",
    label: "Discharge run request",
    signal: "M102_CMD",
    caption:
      "With the horn finished (HORN_DONE) and RUN_CMD still engaged, M102_CMD calls for the discharge belt. Discharge always starts first, so material only ever lands on a moving belt.",
  },
  {
    id: "05-m102-output",
    label: "Discharge output & clear-off",
    signal: "M102",
    caption:
      "Two rungs. A TOF off-delay (T_clearoff) holds M102_HOLD on for ~3 s after M102_CMD drops, so the discharge belt runs clear on a graceful stop. The M102 output follows M102_HOLD — but a HARD_TRIP cuts it instantly, overriding the clear-off.",
  },
  {
    id: "06-seq-timer",
    label: "Sequencing delay",
    signal: "SEQ_READY",
    caption:
      "The belt-to-belt interlock. Once the discharge belt is both commanded (M102) and physically confirmed moving (ZS-102), T_seq runs a ~3 s delay and sets SEQ_READY. Only then may the feed belt start.",
  },
  {
    id: "07-m101-output",
    label: "Feed output",
    signal: "M101",
    caption:
      "The feed belt runs once RUN_CMD and SEQ_READY are both true, and drops instantly on any HARD_TRIP or when RUN_CMD clears. This is the rung that guarantees feed never runs onto a stopped discharge belt.",
  },
  {
    id: "08-zs101-fault",
    label: "Zero-speed fault — feed",
    signal: "ZS101_FAULT",
    caption:
      "A motion check on the feed belt. If M101 is commanded on but ZS-101 shows no motion for T_zs (~5 s), ZS101_FAULT sets — catching a slipped, broken, or stalled belt the contactor still thinks is running.",
  },
  {
    id: "09-zs102-fault",
    label: "Zero-speed fault — discharge",
    signal: "ZS102_FAULT",
    caption:
      "The same motion check on the discharge belt: M102 commanded but ZS-102 dead for ~5 s sets ZS102_FAULT.",
  },
  {
    id: "10-fault-latch",
    label: "Fault latch",
    signal: "FAULT",
    caption:
      "Any pull-cord break or zero-speed timeout latches FAULT, which seals itself in and clears only on a manual Reset. A latched fault holds the line down and won't let it silently restart.",
  },
  {
    id: "11-hard-trip",
    label: "Hard trip",
    signal: "HARD_TRIP",
    caption:
      "The instant-stop path — no seal-in, recalculated every scan. A broken Pull-cord or a standing FAULT energizes HARD_TRIP, which cuts both motors immediately, ahead of every timer and seal-in.",
  },
];

export function ConveyorRungs() {
  const scenarios = CONVEYOR_RUNGS.map((s) => ({
    ...s,
    src: IMAGES_READY ? `${DIR}/${s.id}.png` : undefined,
  }));

  return (
    <ScenarioViewer
      title="Rung by rung"
      subtitle="Each rung of the OpenPLC program. Step through them or click any frame to enlarge."
      scenarios={scenarios}
      placeholderDir={DIR}
      idleBadge="Ladder"
    />
  );
}
