import { useRef } from "react";

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
  const state = useRef<{ identity: string; timing: ChatWorkTiming }>({ identity, timing: {} });
  if (state.current.identity !== identity) state.current = { identity, timing: {} };
  state.current.timing = updateChatWorkTiming(state.current.timing, working, Date.now());
  return state.current.timing;
}
