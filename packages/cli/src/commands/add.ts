import { existsSync, mkdirSync, cpSync, renameSync, unlinkSync, symlinkSync, readdirSync, readFileSync, writeFileSync, rmSync, lstatSync, mkdtempSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import { resolve, relative } from "node:path";
import { tmpdir } from "node:os";
import {
  CLI,
  DOJOS_DIR,
  readDojoRc,
  writeDojoRc,
  dojoDir,
  courseMode,
  findManifestPath,
  loadConfig,
  parseManifest,
  readCourseManifest,
  type RegistryItem,
} from "../config";
import { remove as removeDojo } from "./remove";
import { agentsFromArgs, configuredAgents, detectAgentsFromEnv, ensureProject, setupAgents } from "./setup";
import { pmCommands } from "../pm";
import { AGENTS } from "./setup";
import { queueCourseEvent } from "../telemetry";
import { startKata } from "./kata";
import {
  parseGithubSource,
  readInstalledSource,
  writeInstalledSource,
  type InstalledSource,
} from "../source";
import { acquireRemoteDojo, type RemoteDojoSource } from "../source-acquisition";

export async function add(root: string, args: string[]): Promise<void> {
  ensureProject(root);
  const requestedAgents = agentsFromArgs(args);
  const agents = requestedAgents.length > 0 ? requestedAgents : detectAgentsFromEnv();
  if (agents.length > 0) setupAgents(root, agents);
  const source = positionalArgs(args)[0];
  const force = args.includes("--force");
  if (!source) {
    throw new Error(`Usage: ${CLI} add <source>

Source can be:
  Local path:   ${CLI} add ./path/to/dojo
  Registry:     ${CLI} add effect-ts
  URL:          ${CLI} add https://example.com/dojo.tgz
  GitHub:       ${CLI} add owner/repository

Flags:
  --force                  Overwrite existing dojo
  --agent <name[,name]>    Install support for codex, opencode, claude, gemini, or pi`);
  }

  const sourceType = classifySource(source);
  switch (sourceType) {
    case "local":    addLocal(root, source, force); break;
    case "npm":      throw deprecatedNpmSource(source);
    case "github":   await addRemote(root, source, "github", force); break;
    case "url":      await addRemote(root, source, "url", force); break;
    case "registry": await addFromRegistry(root, source, force); break;
  }
}

function positionalArgs(args: string[]): string[] {
  const positional: string[] = [];
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index] ?? "";
    if (argument === "--agent") {
      index += 1;
    } else if (!argument.startsWith("--")) {
      positional.push(argument);
    }
  }
  return positional;
}

export function classifySource(source: string): "local" | "npm" | "github" | "url" | "registry" {
  if (source.startsWith(".") || source.startsWith("/")) return "local";
  if (source.startsWith("https://") || source.startsWith("http://")) return "url";
  if (source.startsWith("@")) return "npm";
  if (parseGithubSource(source)) return "github";
  return "registry";
}

function deprecatedNpmSource(source: string): Error {
  const repository = source.replace(/^@/u, "").replace(/^(dojofoo)\//u, "$1/");
  return new Error(`npm dojo installation is deprecated: ${source}\n\nInstall the course from Git instead, for example:\n  ${CLI} add ${repository}`);
}

function moveDir(src: string, dest: string): void {
  try {
    renameSync(src, dest);
  } catch {
    cpSync(src, dest, { recursive: true });
  }
}

function handleExisting(root: string, name: string, force: boolean): void {
  const targetPath = dojoDir(root, name);
  if (!existsSync(targetPath)) return;
  if (!force) {
    throw new Error(existingDojoMessage(root, name));
  }
  removeDojo(root, [name]);
}

export function existingDojoMessage(root: string, name: string): string {
  const installed = readInstalledSource(dojoDir(root, name));
  return `Dojo "${name}" is already installed in this project.

  Location: ${DOJOS_DIR}/${name}${installed ? `\n  Source:   ${installed.locator}` : ""}
  Update:   ${CLI} update ${name}
  Remove:   ${CLI} remove ${name}`;
}

function addLocal(root: string, source: string, force: boolean): void {
  const sourcePath = resolve(source);
  if (!existsSync(sourcePath)) {
    throw new Error(`Source not found: ${sourcePath}`);
  }

  const tmpDir = mkdtempSync(resolve(tmpdir(), "dojofoo-local-"));

  try {
    const staged = resolve(tmpDir, "course");
    cpSync(sourcePath, staged, {
      recursive: true,
      filter: (path) => {
        const relativePath = relative(sourcePath, path);
        return !relativePath.split("/").some((part) => part === ".git" || part === "node_modules");
      },
    });
    installExtracted(root, staged, source, force, {
      version: 1,
      type: "local",
      locator: sourcePath,
    });
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
}

function installExtracted(
  root: string,
  extractedDir: string,
  source: string,
  force: boolean,
  installedSource?: InstalledSource,
): void {
  const manifestPath = findManifestPath(extractedDir);
  if (!manifestPath) {
    throw new Error(`${source} is not a dojo — missing dojo.yaml, dojo.yml, or dojo.json`);
  }
  const manifest = parseManifest(readFileSync(manifestPath, "utf8"), manifestPath);
  const name = manifest.name.includes("/") ? manifest.name.split("/").pop()! : manifest.name;
  const targetPath = dojoDir(root, name);
  const currentSource = readInstalledSource(targetPath);
  if (force && installedSource?.integrity && currentSource?.integrity === installedSource.integrity) {
    console.log(`Dojo "${name}" is already up to date.`);
    return;
  }

  if (installedSource) writeInstalledSource(extractedDir, installedSource);

  // Install deps in staging dir (still in tmpDir)
  const pm = pmCommands(root);
  const pkgPath = resolve(extractedDir, "package.json");
  const hasMise = existsSync(resolve(extractedDir, "mise.toml")) || existsSync(resolve(extractedDir, ".mise.toml"));
  if (existsSync(pkgPath) && !hasMise) {
    console.log(`Installing ${name} dependencies...`);
    try {
      execSync(pm.installSilent, { cwd: extractedDir, stdio: "pipe" });
    } catch (err) {
      const e = err as { stderr?: Buffer; stdout?: Buffer; message?: string };
      const detail =
        e.stderr?.toString().trim() ||
        e.stdout?.toString().trim() ||
        e.message ||
        "unknown error";
      throw new Error(`Failed to install ${name} dependencies via ${pm.name}:\n\n${detail}`);
    }
  }

  // Move to final location
  handleExisting(root, name, force);
  mkdirSync(resolve(root, DOJOS_DIR), { recursive: true });
  moveDir(extractedDir, targetPath);

  finalize(root, name, targetPath, installedSource);
}

async function addRemote(root: string, source: string, type: RemoteDojoSource, force: boolean): Promise<void> {
  const locator = type === "github" ? parseGithubSource(source)?.repository : source;
  if (!locator) throw new Error(`Invalid GitHub repository: ${source}`);
  const tmpDir = mkdtempSync(resolve(tmpdir(), "dojofoo-giget-"));
  const staged = resolve(tmpDir, "course");

  try {
    console.log(`Fetching ${locator}...`);
    const downloaded = await acquireRemoteDojo(locator, type, staged);
    const extracted = findDownloadedDojo(downloaded);
    if (!extracted) throw new Error(`${source} is not a dojo — missing dojo.yaml, dojo.yml, or dojo.json`);
    installExtracted(root, extracted, source, force, {
      version: 1,
      type,
      locator,
      integrity: directoryIntegrity(extracted),
    });
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
  if (src.type === "github" && typeof src.repository === "string" && parseGithubSource(src.repository)) {
    return obj as unknown as RegistryItem;
  }
  if (src.type === "tarball" && typeof src.url === "string") {
    return obj as unknown as RegistryItem;
  }
  throw new Error(`Invalid registry item: source must be github or tarball`);
}

async function addFromRegistry(root: string, name: string, force: boolean): Promise<void> {
  const config = loadConfig(root, { command: "add" });

  for (const [registryName, urlTemplate] of Object.entries(config.registries)) {
    const url = urlTemplate.replace("{name}", name);
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const item = validateRegistryItem(await res.json());
      if (item.source.type === "github") {
        return addRemote(root, item.source.repository, "github", force);
      }
      return addRemote(root, item.source.url, "url", force);
    } catch (err) {
      if (err instanceof Error && err.message.startsWith("Invalid registry")) throw err;
      console.log(`Registry "${registryName}" unreachable: ${url}`);
    }
  }

  throw new Error(`"${name}" not found in any registry.

Try:
  GitHub:       ${CLI} add dojofoo/${name}
  Local path:   ${CLI} add ./path/to/${name}`);
}

function findDownloadedDojo(directory: string): string | null {
  if (findManifestPath(directory)) return directory;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && findManifestPath(resolve(directory, entry.name))) {
      return resolve(directory, entry.name);
    }
  }
  return null;
}

function directoryIntegrity(directory: string): string {
  const hash = createHash("sha256");
  const visit = (current: string, prefix = "") => {
    for (const entry of readdirSync(current, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
      if (entry.name === ".git" || entry.name === "node_modules" || entry.name === ".dojo-source.json") continue;
      const path = resolve(current, entry.name);
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
      hash.update(`${entry.isDirectory() ? "d" : "f"}:${relativePath}\0`);
      if (entry.isDirectory()) visit(path, relativePath);
      else if (statSync(path).isFile()) hash.update(readFileSync(path));
    }
  };
  visit(directory);
  return `sha256-${hash.digest("hex")}`;
}

function finalize(root: string, name: string, targetPath: string, source?: InstalledSource): void {
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

  const mode = courseMode(readCourseManifest(root, name));
  if (mode === "katas") {
    // Kata courses extend their tooling into the learner's coding workspace.
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
  }

  // Symlink commands/skills to agent directories
  symlinkDojo(root, targetPath);

  runLifecycleScript(root, targetPath, "prepare.sh");
  if (mode === "katas" && !readDojoRc(root).currentKata) startKata(root);

  console.log(`Dojo "${name}" added.

  Location:  ${DOJOS_DIR}/${name}
  Active:    ${name}
  Start:     ${CLI} ui`);

  queueCourseEvent(
    root,
    name,
    "installed",
    undefined,
    source?.type === "github"
      ? {
          type: "github",
          locator: source.locator,
          ...(source.integrity ? { integrity: source.integrity } : {}),
        }
      : undefined,
  );
}


function symlinkDir(sourceDir: string, targetDir: string, filter: (e: import("node:fs").Dirent) => boolean): void {
  if (!existsSync(sourceDir)) return;
  mkdirSync(targetDir, { recursive: true });
  for (const entry of readdirSync(sourceDir, { withFileTypes: true })) {
    if (!filter(entry)) continue;
    const link = resolve(targetDir, entry.name);
    try {
      if (!lstatSync(link).isSymbolicLink()) continue;
      unlinkSync(link);
    } catch {
      // The local catalog does not contain this skill yet.
    }
    symlinkSync(relative(targetDir, resolve(sourceDir, entry.name)), link);
  }
}

export function runLifecycleScript(root: string, dojoPath: string, script: string): void {
  const scriptPath = resolve(dojoPath, script);
  if (!existsSync(scriptPath)) return;
  try {
    execSync(`bash ${scriptPath}`, {
      cwd: dojoPath,
      stdio: "inherit",
      env: { ...process.env, PROJECT_ROOT: root },
    });
  } catch {
    console.log(`Warning: ${script} exited with errors.`);
  }
}

function symlinkDojo(root: string, dojoPath: string): void {
  symlinkDir(
    resolve(dojoPath, "skills"),
    resolve(root, ".agents", "skills"),
    (entry) => entry.isDirectory(),
  );
  for (const agent of configuredAgents(root)) {
    const dir = AGENTS[agent].dir;
    symlinkDir(resolve(dojoPath, "commands"), resolve(root, dir, "commands"), (e) => e.name.endsWith(".md"));
  }
}
