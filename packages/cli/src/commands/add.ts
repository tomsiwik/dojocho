import { existsSync, mkdirSync, cpSync, unlinkSync, symlinkSync, readdirSync, readFileSync, writeFileSync, realpathSync, rmSync } from "node:fs";
import { execSync, execFileSync } from "node:child_process";
import { resolve, basename, relative } from "node:path";
import { tmpdir } from "node:os";
import {
  DOJOS_DIR,
  readDojoRc,
  writeDojoRc,
  dojoDir,
  loadConfig,
  parseManifest,
  type RegistryItem,
} from "../config";
import { remove as removeDojo } from "./remove";

export async function add(root: string, args: string[]): Promise<void> {
  const source = args.find((a) => !a.startsWith("--"));
  const force = args.includes("--force");
  if (!source) {
    throw new Error(`Usage: dojo add <source>

Source can be:
  Local path:   dojo add ./path/to/dojo
  npm package:  dojo add @dojocho/effect-ts
  Registry:     dojo add effect-ts
  URL:          dojo add https://example.com/dojo.tgz

Flags:
  --force       Overwrite existing dojo`);
  }

  const sourceType = classifySource(source);
  switch (sourceType) {
    case "local":    addLocal(root, source, force); break;
    case "npm":      addNpm(root, source, force); break;
    case "url":      addUrl(root, source, force); break;
    case "registry": await addFromRegistry(root, source, force); break;
  }
}

function classifySource(source: string): "local" | "npm" | "url" | "registry" {
  if (source.startsWith(".") || source.startsWith("/")) return "local";
  if (source.startsWith("https://") || source.startsWith("http://")) return "url";
  if (source.startsWith("@") || source.includes("/")) return "npm";
  return "registry";
}

function safeExtract(tarball: string, cwd: string): void {
  const listing = execFileSync("tar", ["-tzf", tarball], { cwd, encoding: "utf8" });
  const unsafe = listing.split("\n").some((e) => e.startsWith("/") || e.includes(".."));
  if (unsafe) {
    throw new Error("Refusing to extract: tarball contains unsafe paths (absolute or ../)");
  }
  execFileSync("tar", ["xzf", tarball], { cwd, stdio: "pipe" });
}

function handleExisting(root: string, name: string, force: boolean): void {
  const targetPath = dojoDir(root, name);
  if (!existsSync(targetPath)) return;
  if (!force) {
    throw new Error(`Dojo "${name}" already exists at ${DOJOS_DIR}/${name}

To update:  dojo add ${name} --force
To remove:  dojo remove ${name}`);
  }
  removeDojo(root, [name]);
}

function addLocal(root: string, source: string, force: boolean): void {
  const sourcePath = resolve(source);
  if (!existsSync(sourcePath)) {
    throw new Error(`Source not found: ${sourcePath}`);
  }

  const name = basename(sourcePath);
  handleExisting(root, name, force);
  const targetPath = dojoDir(root, name);

  mkdirSync(resolve(root, DOJOS_DIR), { recursive: true });
  cpSync(sourcePath, targetPath, {
    recursive: true,
    filter: (src) => !src.includes("node_modules"),
  });

  const pkgPath = resolve(targetPath, "package.json");
  if (existsSync(pkgPath)) {
    const linked = linkWorkspaceDeps(root, sourcePath, pkgPath);
    console.log(`Installing ${name} dependencies...`);
    execSync("pnpm install --ignore-workspace --silent", {
      cwd: targetPath,
      stdio: "pipe",
    });
    for (const pkgDir of linked) {
      execSync(`pnpm link ${pkgDir}`, { cwd: targetPath, stdio: "pipe" });
      execSync(`pnpm link ${pkgDir}`, { cwd: root, stdio: "pipe" });
    }
  }

  finalize(root, name, targetPath);
}

function installExtracted(root: string, extractedDir: string, source: string, force: boolean): void {
  const dojoJsonPath = resolve(extractedDir, "dojo.json");
  if (!existsSync(dojoJsonPath)) {
    throw new Error(`${source} is not a dojo — missing dojo.json`);
  }
  const manifest = parseManifest(readFileSync(dojoJsonPath, "utf8"), dojoJsonPath);
  const name = manifest.name.includes("/") ? manifest.name.split("/").pop()! : manifest.name;

  handleExisting(root, name, force);
  const targetPath = dojoDir(root, name);

  mkdirSync(resolve(root, DOJOS_DIR), { recursive: true });
  cpSync(extractedDir, targetPath, { recursive: true });

  const pkgPath = resolve(targetPath, "package.json");
  if (existsSync(pkgPath)) {
    console.log(`Installing ${name} dependencies...`);
    execSync("pnpm install --ignore-workspace --silent", { cwd: targetPath, stdio: "pipe" });
  }

  finalize(root, name, targetPath);
}

function addNpm(root: string, source: string, force: boolean): void {
  const tmpDir = resolve(tmpdir(), `dojocho-${Date.now()}`);
  mkdirSync(tmpDir, { recursive: true });

  try {
    console.log(`Fetching ${source}...`);
    execSync(`npm pack ${source} --pack-destination .`, { cwd: tmpDir, stdio: "pipe" });

    const tarballs = readdirSync(tmpDir).filter((f) => f.endsWith(".tgz"));
    if (tarballs.length === 0) throw new Error(`Failed to download ${source}`);

    safeExtract(tarballs[0], tmpDir);
    installExtracted(root, resolve(tmpDir, "package"), source, force);
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
}

function validateRegistryItem(data: unknown): RegistryItem {
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid registry response: expected a JSON object");
  }
  const obj = data as Record<string, unknown>;
  if (typeof obj.name !== "string" || typeof obj.version !== "string" || typeof obj.description !== "string") {
    throw new Error("Invalid registry item: missing name, version, or description");
  }
  if (typeof obj.source !== "object" || obj.source === null) {
    throw new Error("Invalid registry item: missing source");
  }
  const src = obj.source as Record<string, unknown>;
  if (src.type === "npm" && typeof src.package === "string") {
    return obj as unknown as RegistryItem;
  }
  if (src.type === "tarball" && typeof src.url === "string") {
    return obj as unknown as RegistryItem;
  }
  throw new Error(`Invalid registry item: source must be npm or tarball`);
}

async function addFromRegistry(root: string, name: string, force: boolean): Promise<void> {
  const config = loadConfig(root, { command: "add" });

  for (const [registryName, urlTemplate] of Object.entries(config.registries)) {
    const url = urlTemplate.replace("{name}", name);
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const item = validateRegistryItem(await res.json());
      if (item.source.type === "npm") {
        return addNpm(root, item.source.package, force);
      }
      return addUrl(root, item.source.url, force);
    } catch (err) {
      if (err instanceof Error && err.message.startsWith("Invalid registry")) throw err;
      console.log(`Registry "${registryName}" unreachable: ${url}`);
    }
  }

  throw new Error(`"${name}" not found in any registry.

Try:
  npm package:  dojo add @dojocho/${name}
  Local path:   dojo add ./path/to/${name}`);
}

function addUrl(root: string, url: string, force: boolean): void {
  const tmpDir = resolve(tmpdir(), `dojocho-${Date.now()}`);
  mkdirSync(tmpDir, { recursive: true });

  try {
    console.log(`Fetching ${url}...`);
    execFileSync("curl", ["-fsSL", "-o", "dojo.tgz", url], { cwd: tmpDir, stdio: "pipe" });
    safeExtract("dojo.tgz", tmpDir);

    // npm-packed tarballs extract to "package/", raw tarballs may not
    const extractedDir = existsSync(resolve(tmpDir, "package", "dojo.json"))
      ? resolve(tmpDir, "package")
      : tmpDir;

    installExtracted(root, extractedDir, url, force);
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
}

function finalize(root: string, name: string, targetPath: string): void {
  // Update .dojorc
  const rc = readDojoRc(root);
  rc.currentDojo = name;
  writeDojoRc(root, rc);

  // Add dependency paths to the dojo's tsconfig
  const dojoPkgPath = resolve(targetPath, "package.json");
  const dojoTsconfigPath = resolve(targetPath, "tsconfig.json");
  if (existsSync(dojoPkgPath) && existsSync(dojoTsconfigPath)) {
    const dojoPkg = JSON.parse(readFileSync(dojoPkgPath, "utf8"));
    const dojoTsconfig = JSON.parse(readFileSync(dojoTsconfigPath, "utf8"));
    const deps = Object.keys(dojoPkg.dependencies ?? {});
    if (deps.length > 0) {
      dojoTsconfig.compilerOptions ??= {};
      const paths = dojoTsconfig.compilerOptions.paths ?? {};
      for (const dep of deps) {
        paths[dep] = [`./node_modules/${dep}`];
        paths[`${dep}/*`] = [`./node_modules/${dep}/*`];
      }
      dojoTsconfig.compilerOptions.paths = paths;
      writeFileSync(dojoTsconfigPath, JSON.stringify(dojoTsconfig, null, 2) + "\n");
    }
  }

  // Root tsconfig extends the dojo's
  const dojo = loadConfig(root);
  const katasInclude = `${relative(root, dojo.katasPath)}/**/*.ts`;
  const tsconfigPath = resolve(root, "tsconfig.json");
  const extendsPath = `./${relative(root, resolve(targetPath, "tsconfig.json"))}`;
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
  symlinkDojo(root, targetPath);

  console.log(`Dojo "${name}" added.

  Location:  ${DOJOS_DIR}/${name}
  Active:    ${name}
  Command:   /kata`);
}

function linkWorkspaceDeps(root: string, sourcePath: string, pkgPath: string): string[] {
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

function symlinkDir(sourceDir: string, targetDir: string, filter: (e: import("node:fs").Dirent) => boolean): void {
  if (!existsSync(sourceDir)) return;
  mkdirSync(targetDir, { recursive: true });
  for (const entry of readdirSync(sourceDir, { withFileTypes: true })) {
    if (!filter(entry)) continue;
    const link = resolve(targetDir, entry.name);
    if (existsSync(link)) unlinkSync(link);
    symlinkSync(relative(targetDir, resolve(sourceDir, entry.name)), link);
  }
}

function symlinkDojo(root: string, dojoPath: string): void {
  for (const dir of [".claude", ".opencode", ".codex"]) {
    symlinkDir(resolve(dojoPath, "commands"), resolve(root, dir, "commands"), (e) => e.name.endsWith(".md"));
    symlinkDir(resolve(dojoPath, "skills"), resolve(root, dir, "skills"), (e) => e.isDirectory());
  }
}
