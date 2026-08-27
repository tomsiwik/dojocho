"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

export function useEmptyStateStage(timings: readonly number[]) {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState(reduce ? timings.length : 0);

  useEffect(() => {
    if (reduce) {
      setStage(timings.length);
      return;
    }

    const timers = timings.map((time, index) =>
      window.setTimeout(() => setStage(index + 1), time),
    );

    return () => timers.forEach(window.clearTimeout);
  }, [reduce, timings]);

  return { stage, reduce: Boolean(reduce) };
}
