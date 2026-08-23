import { execFileSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { delimiter, dirname, join, resolve } from "node:path";

const INSTALL_URL = "https://mise.run";

export type MiseBootstrapOptions = {
  home?: string;
  platform?: NodeJS.Platform;
  download?: (url: string) => Promise<string>;
  run?: (command: string, args: string[], options?: { env?: NodeJS.ProcessEnv }) => void;
};

/** Ensure the dojofoo runtime dependency exists, installing it for this user when needed. */
export async function bootstrapMise(options: MiseBootstrapOptions = {}): Promise<string> {
  const home = options.home ?? homedir();
  const platform = options.platform ?? process.platform;
  const run = options.run ?? ((command, args, runOptions) => {
    execFileSync(command, args, { env: runOptions?.env ?? process.env, stdio: "inherit" });
  });
  const installedPath = resolve(home, ".local", "bin", platform === "win32" ? "mise.exe" : "mise");
  const existing = findMise(installedPath, options.home !== undefined);
  if (existing) {
    addToProcessPath(existing);
    return existing;
  }
  if (platform === "win32") {
    throw new Error("dojofoo needs mise. Install it with `winget install jdx.mise`, then run `npx dojofoo install` again.");
  }

  console.log("mise is not installed; installing it for your user...");
  const download = options.download ?? (async (url) => {
    const response = await fetch(url, { redirect: "follow" });
    if (!response.ok) throw new Error(`download failed with HTTP ${response.status}`);
    return response.text();
  });
  const temporary = mkdtempSync(join(tmpdir(), "dojofoo-mise-"));
  const installer = join(temporary, "install.sh");
  try {
    writeFileSync(installer, await download(INSTALL_URL), { mode: 0o700 });
    chmodSync(installer, 0o700);
    mkdirSync(dirname(installedPath), { recursive: true });
    run("sh", [installer], {
      env: { ...process.env, MISE_INSTALL_PATH: installedPath },
    });
  } catch (cause) {
    throw new Error(
      `Could not install mise automatically. Install it from https://mise.jdx.dev/installing-mise.html and run \`npx dojofoo install\` again.`,
      { cause },
    );
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
  if (!existsSync(installedPath)) {
    throw new Error(`The mise installer completed without creating ${installedPath}.`);
  }
  addToProcessPath(installedPath);
  run(installedPath, ["--version"]);
  return installedPath;
}

function findMise(defaultPath: string, isolatedHome: boolean): string | null {
  if (existsSync(defaultPath)) return defaultPath;
  if (isolatedHome) return null;
  try {
    const command = process.platform === "win32" ? "where" : "which";
    const output = execFileSync(command, ["mise"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    if (output) return output.split(/\r?\n/u)[0] ?? null;
  } catch {
    // The user-local default remains usable even when shell activation is absent.
  }
  return null;
}

function addToProcessPath(executable: string): void {
  const directory = dirname(executable);
  const entries = (process.env.PATH ?? "").split(delimiter);
  if (!entries.includes(directory)) process.env.PATH = `${directory}${delimiter}${process.env.PATH ?? ""}`;
}
