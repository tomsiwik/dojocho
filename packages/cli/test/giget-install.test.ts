import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const acquisition = vi.hoisted(() => ({ version: "0.0.1", calls: [] as string[] }));

vi.mock("../src/source-acquisition", () => ({
  acquireRemoteDojo: vi.fn(async (source: string, _type: string, directory: string) => {
    acquisition.calls.push(source);
    mkdirSync(resolve(directory, "katas", "001-first"), { recursive: true });
    writeFileSync(resolve(directory, "dojo.yaml"), [
      "mode: katas",
      "name: '@test/remote-dojo'",
      `version: ${acquisition.version}`,
      "description: Remote fixture.",
      "test: echo ok",
      "katas:",
      "  - name: 001-first",
      "    template: katas/001-first/solution.ts",
    ].join("\n"));
    writeFileSync(resolve(directory, "DOJO.md"), "# Remote dojo\n");
    writeFileSync(resolve(directory, "katas", "001-first", "SENSEI.md"), "# Sensei\n");
    writeFileSync(resolve(directory, "katas", "001-first", "solution.ts"), "export const value = 1;\n");
    return directory;
  }),
  gigetLocator: (source: string) => source,
}));

import { add } from "../src/commands/add";
import { remove } from "../src/commands/remove";
import { update } from "../src/commands/update";
import { readInstalledSource } from "../src/source";

const roots: string[] = [];

afterEach(() => {
  acquisition.version = "0.0.1";
  acquisition.calls.length = 0;
  delete process.env.DOJOFOO_HOME;
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function workspace() {
  const root = mkdtempSync(resolve(tmpdir(), "dojofoo-giget-install-"));
  const state = mkdtempSync(resolve(tmpdir(), "dojofoo-giget-state-"));
  roots.push(root, state);
  process.env.DOJOFOO_HOME = state;
  writeFileSync(resolve(root, ".dojorc"), `${JSON.stringify({
    currentDojo: "",
    currentKata: null,
    editor: null,
    progress: {},
  }, null, 2)}\n`);
  return root;
}

describe("Giget-backed dojo lifecycle", () => {
  it("installs, updates, and removes a remote dojo without changing lifecycle ownership", async () => {
    const root = workspace();

    await add(root, ["example/remote-dojo"]);

    const dojo = resolve(root, ".dojos", "remote-dojo");
    expect(acquisition.calls).toEqual(["example/remote-dojo"]);
    expect(readInstalledSource(dojo)).toMatchObject({
      type: "github",
      locator: "example/remote-dojo",
      integrity: expect.stringMatching(/^sha256-/u),
    });
    expect(JSON.parse(readFileSync(resolve(root, ".dojorc"), "utf8"))).toMatchObject({
      currentDojo: "remote-dojo",
      currentKata: "001-first",
    });

    acquisition.version = "0.0.2";
    await update(root, ["remote-dojo"]);
    expect(acquisition.calls).toEqual(["example/remote-dojo", "example/remote-dojo"]);
    expect(readFileSync(resolve(dojo, "dojo.yaml"), "utf8")).toContain("version: 0.0.2");

    remove(root, ["remote-dojo"]);
    expect(() => readFileSync(resolve(dojo, "dojo.yaml"), "utf8")).toThrow();
    expect(JSON.parse(readFileSync(resolve(root, ".dojorc"), "utf8"))).toMatchObject({
      currentDojo: "",
      currentKata: null,
    });
  });
});
