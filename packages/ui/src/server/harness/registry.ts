import type { HarnessAdapter, HarnessKind } from "./adapter";
import { codexHarnessAdapter } from "./codex";
import { opencodeHarnessAdapter } from "./opencode";

const adapters: Record<HarnessKind, HarnessAdapter> = {
  codex: codexHarnessAdapter,
  opencode: opencodeHarnessAdapter,
};

export function dojofooHarness(environment: NodeJS.ProcessEnv = process.env): HarnessKind {
  const override = environment.DOJOFOO_HARNESS;
  if (!override) return "opencode";
  if (override in adapters) return override as HarnessKind;
  throw new Error(`Unsupported Dojofoo harness: ${override}`);
}

export function harnessAdapter(kind: HarnessKind): HarnessAdapter {
  return adapters[kind];
}
