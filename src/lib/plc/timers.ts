/**
 * IEC 61131-3 timer function blocks, as pure helpers.
 *
 * Each call takes the previous timer state, the current input, the preset time
 * (PT, in seconds) and the scan delta (dt, in seconds), and returns the next
 * state. Thread the state through your PLC scan's persistent state — exactly as
 * a timer instance lives in PLC memory between scans.
 */

export interface TimerState {
  /** Accumulated elapsed time (ET), seconds. */
  elapsed: number;
  /** Timer output bit (Q). */
  q: boolean;
}

export const timerInit = (): TimerState => ({ elapsed: 0, q: false });

/** TON — on-delay: Q goes true after the input has been true for PT. */
export function ton(
  prev: TimerState,
  input: boolean,
  ptSec: number,
  dt: number,
): TimerState {
  if (!input) return { elapsed: 0, q: false };
  const elapsed = Math.min(prev.elapsed + dt, ptSec);
  return { elapsed, q: elapsed >= ptSec };
}

/** TOF — off-delay: Q stays true for PT after the input goes false. */
export function tof(
  prev: TimerState,
  input: boolean,
  ptSec: number,
  dt: number,
): TimerState {
  if (input) return { elapsed: 0, q: true };
  const elapsed = Math.min(prev.elapsed + dt, ptSec);
  return { elapsed, q: elapsed < ptSec };
}
