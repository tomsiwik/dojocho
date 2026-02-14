import { existsSync, mkdirSync, cpSync, unlinkSync, symlinkSync, readdirSync, readFileSync, writeFileSync, realpathSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve, basename, relative } from "node:path";
import {
  DOJOS_DIR,
  readDojoRc,
  writeDojoRc,
  ryuDir,
  loadConfig,
} from "../config";

export function add(root: string, args: string[]): void {
  const source = args.find((a) => !a.startsWith("--"));
  if (!source) {
    console.log(`Usage: dojo add <source>

Source can be:
  Local path:  dojo add ./path/to/ryu`);
    process.exit(1);
  }

  // Resolve source path
  const sourcePath = resolve(source);
  if (!existsSync(sourcePath)) {
    console.log(`Source not found: ${sourcePath}`);
    process.exit(1);
  }

  // Determine ryu name from directory
  const name = basename(sourcePath);

  // Target location
  const targetPath = ryuDir(root, name);
  if (existsSync(targetPath)) {
    console.log(`Ryu "${name}" already exists at ${DOJOS_DIR}/${name}`);
    process.exit(1);
  }

  // Copy ryu into .dojos/<name>/
  mkdirSync(resolve(root, DOJOS_DIR), { recursive: true });
  cpSync(sourcePath, targetPath, {
    recursive: true,
    filter: (src) => !src.includes("node_modules"),
  });

  // Install ryu dependencies
  const pkgPath = resolve(targetPath, "package.json");
  if (existsSync(pkgPath)) {
    const linked = linkWorkspaceDeps(root, sourcePath, targetPath, pkgPath);
    console.log(`Installing ${name} dependencies...`);
    execSync("pnpm install --ignore-workspace --silent", {
      cwd: targetPath,
      stdio: "pipe",
    });
    // Link workspace deps into both ryu and root (for dojo.config.ts)
    for (const pkgDir of linked) {
      execSync(`pnpm link ${pkgDir}`, { cwd: targetPath, stdio: "pipe" });
      execSync(`pnpm link ${pkgDir}`, { cwd: root, stdio: "pipe" });
    }
  }

  // Update .dojorc
  const rc = readDojoRc(root);
  rc.currentRyu = name;
  writeDojoRc(root, rc);

  // Add dependency paths to the ryu's tsconfig (resolved relative to ryu)
  const ryuPkgPath = resolve(targetPath, "package.json");
  const ryuTsconfigPath = resolve(targetPath, "tsconfig.json");
  if (existsSync(ryuPkgPath) && existsSync(ryuTsconfigPath)) {
    const ryuPkg = JSON.parse(readFileSync(ryuPkgPath, "utf8"));
    const ryuTsconfig = JSON.parse(readFileSync(ryuTsconfigPath, "utf8"));
    const deps = Object.keys(ryuPkg.dependencies ?? {});
    if (deps.length > 0) {
      ryuTsconfig.compilerOptions ??= {};
      const paths = ryuTsconfig.compilerOptions.paths ?? {};
      for (const dep of deps) {
        paths[dep] = [`./node_modules/${dep}`];
        paths[`${dep}/*`] = [`./node_modules/${dep}/*`];
      }
      ryuTsconfig.compilerOptions.paths = paths;
      writeFileSync(ryuTsconfigPath, JSON.stringify(ryuTsconfig, null, 2) + "\n");
    }
  }

  // Root tsconfig extends the ryu's — inherits compiler options + dep paths
  const dojo = loadConfig(root);
  const katasInclude = `${relative(root, dojo.katasPath)}/**/*.ts`;
  const tsconfigPath = resolve(root, "tsconfig.json");
  const extendsPath = `./${relative(root, ryuTsconfigPath)}`;
  writeFileSync(
    tsconfigPath,
    JSON.stringify(
      {
        extends: extendsPath,
        compilerOptions: { noEmit: true },
        include: [katasInclude],
      },
      null,
      2,
    ) + "\n",
  );

  // Symlink commands/skills to agent directories
  symlinkRyu(root, targetPath);

  console.log(`Ryu "${name}" added.

  Location:  ${DOJOS_DIR}/${name}
  Active:    ${name}
  Command:   /kata`);
}

function linkWorkspaceDeps(
  root: string,
  sourcePath: string,
  _targetPath: string,
  pkgPath: string,
): string[] {
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  const linked: string[] = [];

  for (const field of ["dependencies", "devDependencies", "peerDependencies"] as const) {
    if (!pkg[field]) continue;
    for (const [name, version] of Object.entries(pkg[field])) {
      if (typeof version !== "string" || !version.startsWith("workspace:")) continue;

      // Resolve the real path of the workspace package
      const srcPkg = resolve(sourcePath, "node_modules", ...name.split("/"));
      if (existsSync(srcPkg)) {
        linked.push(realpathSync(srcPkg));
      }

      delete pkg[field][name];
    }
    if (Object.keys(pkg[field]).length === 0) delete pkg[field];
  }
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  // Ensure root has a package.json for pnpm link
  const rootPkgPath = resolve(root, "package.json");
  if (!existsSync(rootPkgPath)) {
    writeFileSync(rootPkgPath, JSON.stringify({ type: "module", private: true }, null, 2) + "\n");
  }

  return linked;
}

function symlinkRyu(root: string, ryu: string): void {
  const agentDirs = [".claude", ".opencode", ".codex"];
  for (const dir of agentDirs) {
    mkdirSync(resolve(root, dir, "commands"), { recursive: true });
    mkdirSync(resolve(root, dir, "skills"), { recursive: true });

    // Symlink commands (replace existing files from setup)
    const cmdsDir = resolve(ryu, "commands");
    if (existsSync(cmdsDir)) {
      for (const file of readdirSync(cmdsDir)) {
        if (!file.endsWith(".md")) continue;
        const link = resolve(root, dir, "commands", file);
        const target = relative(
          resolve(root, dir, "commands"),
          resolve(cmdsDir, file),
        );
        // Remove existing file/symlink so we can replace it
        if (existsSync(link)) unlinkSync(link);
        symlinkSync(target, link);
      }
    }

    // Symlink skills
    const skillsDir = resolve(ryu, "skills");
    if (existsSync(skillsDir)) {
      for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        const link = resolve(root, dir, "skills", entry.name);
        const target = relative(
          resolve(root, dir, "skills"),
          resolve(skillsDir, entry.name),
        );
        if (existsSync(link)) unlinkSync(link);
        symlinkSync(target, link);
      }
    }
  }
}
