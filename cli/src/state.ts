import { existsSync } from "node:fs";
import type { ResolvedKata } from "./config.js";

export type KataState = "not-started" | "ongoing";

export function kataState(kata: ResolvedKata): KataState {
  return existsSync(kata.workspacePath) ? "ongoing" : "not-started";
}

export function findCurrentKata(
  katas: ResolvedKata[],
  current: string | null,
): ResolvedKata | null {
  if (current) {
    const found = katas.find((k) => k.name === current);
    if (found && existsSync(found.workspacePath)) return found;
  }
  // Fallback: first kata with a workspace file
  return katas.find((k) => existsSync(k.workspacePath)) ?? null;
}

export function findNextKata(katas: ResolvedKata[]): ResolvedKata | null {
  return katas.find((k) => !existsSync(k.workspacePath)) ?? null;
}

export function completedCount(
  katas: ResolvedKata[],
  current: string | null,
): number {
  // Katas before the current one with workspace files are assumed finished
  const currentIdx = katas.findIndex((k) => k.name === current);
  if (currentIdx > 0) return currentIdx;
  // Count contiguous completed from start
  for (let i = 0; i < katas.length; i++) {
    if (!existsSync(katas[i].workspacePath)) return i;
  }
  return katas.length;
}

export function findKataByIdOrName(
  katas: ResolvedKata[],
  query: string,
): ResolvedKata | null {
  // Try exact name match
  const byName = katas.find((k) => k.name === query);
  if (byName) return byName;
  // Try number prefix (e.g. "005" matches "005-pipe-composition")
  const padded = query.padStart(3, "0");
  return katas.find((k) => k.name.startsWith(padded + "-")) ?? null;
}
