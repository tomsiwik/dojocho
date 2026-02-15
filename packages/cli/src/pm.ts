import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export interface PmCommands {
  name: PackageManager;
  installSilent: string;
  add(pkg: string): string;
}

export function detectPackageManager(root: string): PackageManager {
  // 1. Check package.json "packageManager" field
  const pkgPath = resolve(root, "package.json");
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

  // 2. Check lockfiles
  if (existsSync(resolve(root, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(resolve(root, "yarn.lock"))) return "yarn";
  if (existsSync(resolve(root, "bun.lockb")) || existsSync(resolve(root, "bun.lock"))) return "bun";
  if (existsSync(resolve(root, "package-lock.json"))) return "npm";

  // 3. Default
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
