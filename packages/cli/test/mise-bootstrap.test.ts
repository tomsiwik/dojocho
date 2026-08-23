import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { bootstrapMise } from "../src/mise-bootstrap";

const temporaryPaths: string[] = [];

afterEach(() => {
  for (const path of temporaryPaths.splice(0)) rmSync(path, { recursive: true, force: true });
});

function fixture() {
  const home = mkdtempSync(join(tmpdir(), "dojofoo-mise-home-"));
  temporaryPaths.push(home);
  return home;
}

describe("mise bootstrap", () => {
  it("reuses the user-local binary when shell activation is absent", async () => {
    const home = fixture();
    const executable = resolve(home, ".local/bin/mise");
    mkdirSync(resolve(home, ".local/bin"), { recursive: true });
    writeFileSync(executable, "mise");
    const run = vi.fn();

    await expect(bootstrapMise({ home, platform: "linux", run })).resolves.toBe(executable);
    expect(run).not.toHaveBeenCalled();
  });

  it("downloads, installs, and verifies mise for the current user", async () => {
    const home = fixture();
    const executable = resolve(home, ".local/bin/mise");
    const run = vi.fn((command: string, args: string[], options?: { env?: NodeJS.ProcessEnv }) => {
      if (command === "sh") {
        expect(args[0]).toMatch(/dojofoo-mise-.+\/install\.sh/u);
        expect(options?.env?.MISE_INSTALL_PATH).toBe(executable);
        writeFileSync(executable, "mise");
      }
    });

    await expect(bootstrapMise({
      home,
      platform: "linux",
      download: async () => "#!/bin/sh\n",
      run,
    })).resolves.toBe(executable);
    expect(run).toHaveBeenLastCalledWith(executable, ["--version"]);
  });

  it("gives Windows users an explicit supported command", async () => {
    await expect(bootstrapMise({ home: fixture(), platform: "win32" })).rejects.toThrow(
      "winget install jdx.mise",
    );
  });
});
