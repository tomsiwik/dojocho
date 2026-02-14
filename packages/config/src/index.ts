import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, basename, dirname } from "node:path";
import { createJiti } from "jiti";

export const CLI = "dojo";
export const DOJOS_DIR = ".dojos";

export interface DojoRc {
  currentRyu: string;
  currentKata: string | null;
  editor: string | null;
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
    throw new Error(".dojorc not found — run `dojo --start` first");
  }
  return JSON.parse(readFileSync(rcPath, "utf8"));
}

export function writeDojoRc(root: string, rc: DojoRc): void {
  const rcPath = resolve(root, ".dojorc");
  writeFileSync(rcPath, JSON.stringify(rc, null, 2) + "\n");
}

export function readCatalog(root: string, active: string): KatasCatalog {
  const catalogPath = resolve(root, DOJOS_DIR, active, "katas.json");
  if (!existsSync(catalogPath)) {
    throw new Error(`katas.json not found at ${catalogPath}`);
  }
  return JSON.parse(readFileSync(catalogPath, "utf8"));
}

export function ryuDir(root: string, active: string): string {
  return resolve(root, DOJOS_DIR, active);
}

export function readDojoMd(root: string, active: string): string {
  // Try ryu-specific DOJO.md first
  if (active) {
    const ryuDojoPath = resolve(root, DOJOS_DIR, active, "DOJO.md");
    if (existsSync(ryuDojoPath)) return readFileSync(ryuDojoPath, "utf8");
  }
  // Fallback to root .dojos/DOJO.md
  const rootDojoPath = resolve(root, DOJOS_DIR, "DOJO.md");
  if (existsSync(rootDojoPath)) return readFileSync(rootDojoPath, "utf8");
  return "";
}

export interface DojoConfig {
  basePath: string;
  katasPath: string;
}

export function defineConfig(
  overrides: Partial<DojoConfig> = {},
): DojoConfig {
  const root = findProjectRoot();
  const basePath = overrides.basePath ?? root;
  const katasPath = overrides.katasPath
    ? resolve(basePath, overrides.katasPath)
    : resolve(basePath, "katas");
  return { basePath, katasPath };
}

export function loadConfig(root?: string): DojoConfig {
  const projectRoot = root ?? findProjectRoot();
  for (const name of ["dojo.config.ts", "dojo.config.js"]) {
    const configPath = resolve(projectRoot, name);
    if (existsSync(configPath)) {
      const jiti = createJiti(configPath);
      const mod = jiti(configPath) as { default?: DojoConfig } | DojoConfig;
      const config = "default" in mod && mod.default ? mod.default : (mod as DojoConfig);
      return config;
    }
  }
  return defineConfig();
}

export function katasPath(root: string): string {
  return loadConfig(root).katasPath;
}

export function resolveKata(
  root: string,
  rc: DojoRc,
  entry: KataEntry,
): ResolvedKata {
  const ryu = ryuDir(root, rc.currentRyu);
  const wp = katasPath(root);
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

export function listRyus(root: string): string[] {
  const dojosPath = resolve(root, DOJOS_DIR);
  if (!existsSync(dojosPath)) return [];
  return readdirSync(dojosPath, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}
