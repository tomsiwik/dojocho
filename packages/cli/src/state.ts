import { existsSync } from "node:fs";
import type { ResolvedKata, KataProgress } from "./config";

export type KataState = "not-started" | "ongoing" | "completed";

export function kataState(kata: ResolvedKata, progress?: KataProgress): KataState {
  if (progress?.completed.includes(kata.name)) return "completed";
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

export function findNextKata(katas: ResolvedKata[], progress?: KataProgress): ResolvedKata | null {
  return katas.find((k) => {
    if (progress?.completed.includes(k.name)) return false;
    return !existsSync(k.workspacePath);
  }) ?? null;
}

export function completedCount(
  katas: ResolvedKata[],
  progress?: KataProgress,
): number {
  if (progress) {
    return katas.filter((k) => progress.completed.includes(k.name)).length;
  }
  return 0;
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
