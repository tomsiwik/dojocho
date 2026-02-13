import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, basename, dirname } from "node:path";

export const CLI = "./cli/dist/index.js";

export interface DojoRc {
  active: string;
  current: string | null;
  editor: string | null;
  allowCommit: boolean;
  katasPath?: string;
  tracking: {
    enabled: boolean;
    pushOnComplete: boolean;
    remote: string;
  };
}

export interface KataEntry {
  template: string;
  test?: string;
}

export interface KatasCatalog {
  test: string;
  katas: KataEntry[];
}

export interface ResolvedKata {
  name: string;
  template: string;
  workspacePath: string;
  testPath: string;
  senseiPath: string;
  ryuKataDir: string;
}

export function findProjectRoot(): string {
  let dir = process.cwd();
  while (dir !== "/") {
    if (existsSync(resolve(dir, ".dojorc"))) return dir;
    dir = dirname(dir);
  }
  return process.cwd();
}

export function readDojoRc(root: string): DojoRc {
  const rcPath = resolve(root, ".dojorc");
  if (!existsSync(rcPath)) {
    throw new Error(".dojorc not found — run `dojo setup` first");
  }
  return JSON.parse(readFileSync(rcPath, "utf8"));
}

export function writeDojoRc(root: string, rc: DojoRc): void {
  const rcPath = resolve(root, ".dojorc");
  writeFileSync(rcPath, JSON.stringify(rc, null, 2) + "\n");
}

export function readCatalog(root: string, active: string): KatasCatalog {
  const catalogPath = resolve(root, ".dojo/ryu", active, "katas.json");
  if (!existsSync(catalogPath)) {
    throw new Error(`katas.json not found at ${catalogPath}`);
  }
  return JSON.parse(readFileSync(catalogPath, "utf8"));
}

export function ryuDir(root: string, active: string): string {
  return resolve(root, ".dojo/ryu", active);
}

export function readDojoMd(root: string, active: string): string {
  const dojoPath = resolve(root, ".dojo/ryu", active, "DOJO.md");
  if (!existsSync(dojoPath)) return "";
  return readFileSync(dojoPath, "utf8");
}

export function katasPath(root: string, rc: DojoRc): string {
  return resolve(root, rc.katasPath ?? "./katas");
}

export function resolveKata(
  root: string,
  rc: DojoRc,
  entry: KataEntry,
): ResolvedKata {
  const ryu = ryuDir(root, rc.active);
  const wp = katasPath(root, rc);
  const name = basename(dirname(entry.template));
  return {
    name,
    template: entry.template,
    workspacePath: resolve(wp, name, "solution.ts"),
    testPath: resolve(ryu, dirname(entry.template), "solution.test.ts"),
    senseiPath: resolve(ryu, dirname(entry.template), "SENSEI.md"),
    ryuKataDir: resolve(ryu, dirname(entry.template)),
  };
}

export function resolveAllKatas(
  root: string,
  rc: DojoRc,
  catalog: KatasCatalog,
): ResolvedKata[] {
  return catalog.katas.map((entry) => resolveKata(root, rc, entry));
}
