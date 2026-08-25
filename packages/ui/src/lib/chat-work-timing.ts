import { useEffect, useRef, useState } from "react";

export type ChatWorkTiming = {
  completedAt?: number;
  startedAt?: number;
};

export function updateChatWorkTiming(
  previous: ChatWorkTiming,
  working: boolean,
  now: number,
): ChatWorkTiming {
  if (working) {
    return previous.startedAt !== undefined && previous.completedAt === undefined
      ? previous
      : { startedAt: now };
  }
  if (previous.startedAt !== undefined && previous.completedAt === undefined) {
    return { ...previous, completedAt: now };
  }
  return previous;
}

export function useChatWorkTiming(working: boolean, identity: string): ChatWorkTiming {
  const [, renderTick] = useState(0);
  const state = useRef<{ identity: string; timing: ChatWorkTiming }>({ identity, timing: {} });
  if (state.current.identity !== identity) state.current = { identity, timing: {} };
  state.current.timing = updateChatWorkTiming(state.current.timing, working, Date.now());
  useEffect(() => {
    if (!working) return;
    const timer = window.setInterval(() => renderTick((value) => value + 1), 1_000);
    return () => window.clearInterval(timer);
  }, [working]);
  return state.current.timing;
}
