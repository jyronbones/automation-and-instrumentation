/*
 * Accurate I/O + power wiring diagram for the motor start/stop program.
 * Deterministic SVG (not a generated image) so it matches the program exactly:
 *   - Field devices (correct NO/NC) wired to PLC inputs %IX0.0–0.4
 *   - PLC outputs %QX0.0–0.2 driving the contactor coil + Run/Fault lamps
 *   - Power side: contactor M + overload OL switching 3-phase to the motor
 */

const W = "#aeb4bb"; // wire
const A = "#ffb020"; // amber accent / 24 V / addresses
const MU = "#9aa1a8"; // muted text
const FG = "#e8e8e8"; // primary label
const BS = "#3a4047"; // box stroke
const BF = "#15181b"; // box fill
const GRN = "#34d399";
const RED = "#f87171";

const RAIL_L = 70;
const RAIL_R = 890;
const PLC_L = 420;
const PLC_R = 600;

interface InputDev {
  y: number;
  name: string;
  type: "NO" | "NC";
  addr: string;
  ol?: boolean;
}

interface OutputDev {
  y: number;
  addr: string;
  name: string;
  kind: "coil" | "lamp";
  color?: string;
}

const inputs: InputDev[] = [
  { y: 170, name: "Start", type: "NO", addr: "%IX0.0" },
  { y: 240, name: "Stop", type: "NC", addr: "%IX0.1" },
  { y: 310, name: "E-Stop", type: "NC", addr: "%IX0.2" },
  { y: 380, name: "Overload", type: "NC", addr: "%IX0.3", ol: true },
  { y: 450, name: "Reset", type: "NO", addr: "%IX0.4" },
];

const outputs: OutputDev[] = [
  { y: 200, addr: "%QX0.0", name: "Contactor coil (M)", kind: "coil" },
  { y: 300, addr: "%QX0.1", name: "Run lamp", kind: "lamp", color: GRN },
  { y: 400, addr: "%QX0.2", name: "Fault lamp", kind: "lamp", color: RED },
];

export function WiringDiagram() {
  return (
    <svg
      viewBox="0 0 960 900"
      className="my-2 w-full font-mono"
      role="img"
      aria-label="PLC I/O and power wiring diagram for the motor start/stop control"
    >
      {/* ===================== CONTROL WIRING ===================== */}
      <text x={40} y={36} fill={A} fontSize={14} letterSpacing="2">
        CONTROL WIRING — PLC I/O
      </text>

      {/* power rails */}
      <line x1={RAIL_L} y1={150} x2={RAIL_L} y2={478} stroke={A} strokeWidth={2.5} />
      <text x={RAIL_L} y={140} fill={A} fontSize={13} textAnchor="middle">
        +24 V DC
      </text>
      <line x1={RAIL_R} y1={180} x2={RAIL_R} y2={420} stroke={MU} strokeWidth={2.5} />
      <text x={RAIL_R} y={170} fill={MU} fontSize={13} textAnchor="middle">
        0 V (COM)
      </text>

      {/* PLC block */}
      <rect x={PLC_L} y={96} width={PLC_R - PLC_L} height={404} rx={8} fill={BF} stroke={BS} />
      <text x={(PLC_L + PLC_R) / 2} y={126} fill={FG} fontSize={16} textAnchor="middle">
        OpenPLC
      </text>
      <text x={(PLC_L + PLC_R) / 2} y={462} fill={MU} fontSize={10} textAnchor="middle">
        IN COM → 0 V
      </text>
      <text x={(PLC_L + PLC_R) / 2} y={478} fill={MU} fontSize={10} textAnchor="middle">
        OUT V+ → +24 V
      </text>

      {/* inputs */}
      {inputs.map((d) => (
        <g key={d.addr}>
          <line x1={RAIL_L} y1={d.y} x2={PLC_L} y2={d.y} stroke={W} strokeWidth={1.5} />
          <Dot x={RAIL_L} y={d.y} />
          <Dot x={PLC_L} y={d.y} />
          {d.type === "NO" ? <NO x={200} y={d.y} /> : <NC x={200} y={d.y} />}
          {d.ol ? <OLActuator x={200} y={d.y} /> : <Button x={200} y={d.y} />}
          <text x={200} y={d.y - 38} fill={FG} fontSize={14} textAnchor="middle">
            {d.name}
          </text>
          <text x={248} y={d.y - 38} fill={MU} fontSize={11} textAnchor="start">
            ({d.type})
          </text>
          <text x={PLC_L - 8} y={d.y - 7} fill={A} fontSize={13} textAnchor="end">
            {d.addr}
          </text>
        </g>
      ))}

      {/* outputs */}
      {outputs.map((o) => (
        <g key={o.addr}>
          <line x1={PLC_R} y1={o.y} x2={RAIL_R} y2={o.y} stroke={W} strokeWidth={1.5} />
          <Dot x={PLC_R} y={o.y} />
          <Dot x={RAIL_R} y={o.y} />
          <text x={PLC_R + 8} y={o.y - 7} fill={A} fontSize={13} textAnchor="start">
            {o.addr}
          </text>
          {o.kind === "coil" ? (
            <Coil x={745} y={o.y} label="M" />
          ) : (
            <LampSym x={745} y={o.y} color={o.color ?? FG} />
          )}
          <text x={745} y={o.y - 30} fill={FG} fontSize={14} textAnchor="middle">
            {o.name}
          </text>
        </g>
      ))}

      {/* ===================== POWER CIRCUIT ===================== */}
      <line x1={40} y1={560} x2={920} y2={560} stroke={BS} strokeDasharray="2 4" />
      <text x={40} y={596} fill={A} fontSize={14} letterSpacing="2">
        POWER CIRCUIT
      </text>

      <PowerCircuit />

      {/* link notes */}
      <text x={330} y={672} fill={FG} fontSize={13}>
        ← Coil M (output %QX0.0) closes these power contacts
      </text>
      <text x={330} y={742} fill={FG} fontSize={13}>
        ← Overload trip opens its NC aux → input %IX0.3
      </text>

      {/* ===================== LEGEND ===================== */}
      <g transform="translate(40, 858)">
        <NO x={14} y={0} />
        <text x={30} y={4} fill={MU} fontSize={12}>
          NO contact
        </text>
        <NC x={150} y={0} />
        <text x={166} y={4} fill={MU} fontSize={12}>
          NC contact
        </text>
        <Coil x={300} y={0} label="M" small />
        <text x={320} y={4} fill={MU} fontSize={12}>
          coil
        </text>
        <LampSym x={430} y={0} color={FG} small />
        <text x={450} y={4} fill={MU} fontSize={12}>
          indicator lamp
        </text>
      </g>
    </svg>
  );
}

/* ---------- symbol primitives ---------- */

function Dot({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r={3.5} fill={BF} stroke={W} strokeWidth={1.2} />;
}

/** NO contact on a horizontal wire (two vertical plates, open). */
function NO({ x, y }: { x: number; y: number }) {
  return (
    <g stroke={W} strokeWidth={2}>
      <line x1={x - 7} y1={y - 9} x2={x - 7} y2={y + 9} />
      <line x1={x + 7} y1={y - 9} x2={x + 7} y2={y + 9} />
    </g>
  );
}

/** NC contact on a horizontal wire (two plates + slash). */
function NC({ x, y }: { x: number; y: number }) {
  return (
    <g stroke={W} strokeWidth={2}>
      <line x1={x - 7} y1={y - 9} x2={x - 7} y2={y + 9} />
      <line x1={x + 7} y1={y - 9} x2={x + 7} y2={y + 9} />
      <line x1={x - 10} y1={y + 10} x2={x + 10} y2={y - 10} strokeWidth={1.6} />
    </g>
  );
}

/** Pushbutton actuator above a contact. */
function Button({ x, y }: { x: number; y: number }) {
  return (
    <g stroke={MU} strokeWidth={1.4}>
      <line x1={x} y1={y - 9} x2={x} y2={y - 20} strokeDasharray="3 2" />
      <rect x={x - 8} y={y - 28} width={16} height={8} rx={2} fill={BF} />
      <line x1={x - 12} y1={y - 28} x2={x + 12} y2={y - 28} />
    </g>
  );
}

/** Overload relay actuator above its NC aux contact. */
function OLActuator({ x, y }: { x: number; y: number }) {
  return (
    <g stroke={MU} strokeWidth={1.4}>
      <line x1={x} y1={y - 9} x2={x} y2={y - 20} strokeDasharray="3 2" />
      <rect x={x - 9} y={y - 30} width={18} height={10} rx={2} fill={BF} />
      <text x={x} y={y - 22} fill={MU} fontSize={9} textAnchor="middle" stroke="none">
        OL
      </text>
    </g>
  );
}

/** Relay/contactor coil. */
function Coil({
  x,
  y,
  label,
  small,
}: {
  x: number;
  y: number;
  label: string;
  small?: boolean;
}) {
  const r = small ? 9 : 15;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="none" stroke={FG} strokeWidth={2} />
      <text
        x={x}
        y={y + (small ? 3 : 5)}
        fill={FG}
        fontSize={small ? 10 : 14}
        textAnchor="middle"
      >
        {label}
      </text>
    </g>
  );
}

/** Indicator lamp (circle with cross). */
function LampSym({
  x,
  y,
  color,
  small,
}: {
  x: number;
  y: number;
  color: string;
  small?: boolean;
}) {
  const r = small ? 9 : 15;
  const d = r * 0.7;
  return (
    <g stroke={color} strokeWidth={2} fill="none">
      <circle cx={x} cy={y} r={r} />
      <line x1={x - d} y1={y - d} x2={x + d} y2={y + d} />
      <line x1={x - d} y1={y + d} x2={x + d} y2={y - d} />
    </g>
  );
}

/** Three-phase power: L1/L2/L3 → contactor M → overload OL → motor. */
function PowerCircuit() {
  const phases = [
    { x: 150, label: "L1" },
    { x: 200, label: "L2" },
    { x: 250, label: "L3" },
  ];
  const topY = 626;
  const mY = 668; // contactor contacts
  const olY = 730; // overload heaters
  const motorTopY = 776;
  const motorCY = 826;

  return (
    <g>
      {/* contactor bracket */}
      <rect
        x={128}
        y={mY - 18}
        width={146}
        height={36}
        rx={4}
        fill="none"
        stroke={BS}
        strokeDasharray="4 3"
      />
      <text x={120} y={mY + 4} fill={A} fontSize={14} textAnchor="end">
        M
      </text>
      {/* overload bracket */}
      <rect x={128} y={olY - 18} width={146} height={36} rx={4} fill="none" stroke={BS} strokeDasharray="4 3" />
      <text x={120} y={olY + 4} fill={A} fontSize={14} textAnchor="end">
        OL
      </text>

      {phases.map((p) => (
        <g key={p.label}>
          <text x={p.x} y={topY - 8} fill={MU} fontSize={12} textAnchor="middle">
            {p.label}
          </text>
          {/* top wire to contactor */}
          <line x1={p.x} y1={topY} x2={p.x} y2={mY - 14} stroke={W} strokeWidth={1.5} />
          {/* contactor power contact (open NO) */}
          <Dot x={p.x} y={mY - 14} />
          <line x1={p.x} y1={mY + 14} x2={p.x - 11} y2={mY - 11} stroke={W} strokeWidth={2} />
          <Dot x={p.x} y={mY + 14} />
          {/* wire to overload */}
          <line x1={p.x} y1={mY + 14} x2={p.x} y2={olY - 12} stroke={W} strokeWidth={1.5} />
          {/* overload heater */}
          <rect x={p.x - 6} y={olY - 12} width={12} height={24} rx={2} fill="none" stroke={W} strokeWidth={1.6} />
          {/* wire to motor */}
          <line x1={p.x} y1={olY + 12} x2={p.x} y2={motorTopY} stroke={W} strokeWidth={1.5} />
          <line x1={p.x} y1={motorTopY} x2={200} y2={motorCY - 26} stroke={W} strokeWidth={1.5} />
        </g>
      ))}

      {/* motor */}
      <circle cx={200} cy={motorCY} r={28} fill={BF} stroke={FG} strokeWidth={2} />
      <text x={200} y={motorCY - 2} fill={FG} fontSize={18} textAnchor="middle">
        M
      </text>
      <text x={200} y={motorCY + 15} fill={MU} fontSize={11} textAnchor="middle">
        3~
      </text>
    </g>
  );
}
