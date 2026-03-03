import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export interface PmCommands {
  name: PackageManager;
  installSilent: string;
  add(pkg: string): string;
}

function detectAt(dir: string): PackageManager | null {
  // Check package.json "packageManager" field
  const pkgPath = resolve(dir, "package.json");
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
      if (typeof pkg.packageManager === "string") {
        const name = pkg.packageManager.split("@")[0] as string;
        if (name === "pnpm" || name === "yarn" || name === "bun" || name === "npm") {
          return name;
        }
      }
    } catch {}
  }

  // Check lockfiles
  if (existsSync(resolve(dir, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(resolve(dir, "yarn.lock"))) return "yarn";
  if (existsSync(resolve(dir, "bun.lockb")) || existsSync(resolve(dir, "bun.lock"))) return "bun";
  if (existsSync(resolve(dir, "package-lock.json"))) return "npm";

  return null;
}

export function detectPackageManager(root: string): PackageManager {
  // Walk up from root to find the nearest PM indicator (handles monorepo subdirs)
  let dir = resolve(root);
  const fsRoot = dirname(dir) === dir ? dir : undefined;
  while (true) {
    const found = detectAt(dir);
    if (found) return found;
    const parent = dirname(dir);
    if (parent === dir || parent === fsRoot) break;
    dir = parent;
  }
  return "npm";
}

export function pmCommands(root: string): PmCommands {
  const pm = detectPackageManager(root);

  switch (pm) {
    case "pnpm":
      return {
        name: pm,
        installSilent: "pnpm install --ignore-workspace --silent",
        add: (pkg) => `pnpm add ${pkg}`,
      };
    case "yarn":
      return {
        name: pm,
        installSilent: "yarn install --silent",
        add: (pkg) => `yarn add ${pkg}`,
      };
    case "bun":
      return {
        name: pm,
        installSilent: "bun install --silent",
        add: (pkg) => `bun add ${pkg}`,
      };
    case "npm":
    default:
      return {
        name: pm,
        installSilent: "npm install --silent",
        add: (pkg) => `npm install ${pkg}`,
      };
  }
}
