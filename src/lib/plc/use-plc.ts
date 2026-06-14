"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface ScanArgs<I, S> {
  /** Field inputs this scan. */
  inputs: I;
  /** Persistent PLC memory (latches, timers) from the previous scan. */
  state: S;
  /** Seconds elapsed since the previous scan. */
  dt: number;
}

export type ScanFn<I, S, O> = (args: ScanArgs<I, S>) => { state: S; outputs: O };

export interface UsePlcOptions<I, S, O> {
  scan: ScanFn<I, S, O>;
  initialInputs: I;
  initialState: S;
  initialOutputs: O;
  /** Scan-cycle period in ms (default 100 — a realistic PLC scan time). */
  intervalMs?: number;
}

export interface UsePlcResult<I, S, O> {
  inputs: I;
  outputs: O;
  state: S;
  setInput: <K extends keyof I>(key: K, value: I[K]) => void;
  reset: () => void;
}

/**
 * Runs a PLC-style scan loop: read inputs → solve logic → write outputs, on a
 * fixed interval. State (latches, timer accumulators) persists between scans
 * via a ref, mirroring PLC memory.
 */
export function usePlc<I, S, O>({
  scan,
  initialInputs,
  initialState,
  initialOutputs,
  intervalMs = 100,
}: UsePlcOptions<I, S, O>): UsePlcResult<I, S, O> {
  const [inputs, setInputs] = useState<I>(initialInputs);
  const [outputs, setOutputs] = useState<O>(initialOutputs);
  const [state, setState] = useState<S>(initialState);

  // Refs hold the values the interval reads, so it never closes over stale data.
  const inputsRef = useRef(inputs);
  inputsRef.current = inputs;
  const stateRef = useRef(initialState);
  const scanRef = useRef(scan);
  scanRef.current = scan;

  useEffect(() => {
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;
      const next = scanRef.current({
        inputs: inputsRef.current,
        state: stateRef.current,
        dt,
      });
      stateRef.current = next.state;
      setState(next.state);
      setOutputs(next.outputs);
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  const setInput = useCallback(
    <K extends keyof I>(key: K, value: I[K]) =>
      setInputs((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const reset = useCallback(() => {
    setInputs(initialInputs);
    setOutputs(initialOutputs);
    stateRef.current = initialState;
    setState(initialState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { inputs, outputs, state, setInput, reset };
}
