import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  miseConfigPath,
  prepareProject,
  prepareWorkspace,
  type ProjectPreparationRunner,
} from "@dojofoo/config/project-preparation";

const temporaryPaths: string[] = [];

afterEach(() => {
  for (const path of temporaryPaths.splice(0)) rmSync(path, { recursive: true, force: true });
});

function fixture(config = true) {
  const root = mkdtempSync(join(tmpdir(), "dojofoo-mise-"));
  temporaryPaths.push(root);
  if (config) writeFileSync(resolve(root, "mise.toml"), "[tools]\nnode = \"24\"\n");
  return root;
}

describe("mise project preparation", () => {
  it("does nothing when a checkout has no mise contract", async () => {
    const root = fixture(false);
    const run = vi.fn<ProjectPreparationRunner>();

    await expect(prepareProject(root, { run })).resolves.toEqual({
      prepared: false,
      configPath: null,
      setupTask: false,
    });
    expect(run).not.toHaveBeenCalled();
  });

  it("installs tools and runs the conventional setup task", async () => {
    const root = fixture();
    const run = vi.fn<ProjectPreparationRunner>(async (_command, args) =>
      args[0] === "tasks" ? "build\nsetup\ntest\n" : ""
    );

    await expect(prepareProject(root, { run })).resolves.toEqual({
      prepared: true,
      configPath: resolve(root, "mise.toml"),
      setupTask: true,
    });
    expect(run.mock.calls.map(([command, args]) => [command, args])).toEqual([
      ["mise", ["install"]],
      ["mise", ["tasks", "ls", "--local", "--name-only"]],
      ["mise", ["run", "setup"]],
    ]);
  });

  it("installs declared tools without requiring a setup task", async () => {
    const root = fixture();
    const run = vi.fn<ProjectPreparationRunner>(async (_command, args) =>
      args[0] === "tasks" ? "test\n" : ""
    );

    await expect(prepareProject(root, { run })).resolves.toEqual(expect.objectContaining({
      prepared: true,
      setupTask: false,
    }));
    expect(run).toHaveBeenCalledTimes(2);
  });

  it("recognizes the alternative .mise.toml filename", () => {
    const root = fixture(false);
    writeFileSync(resolve(root, ".mise.toml"), "[tools]\npython = \"3.13\"\n");
    expect(miseConfigPath(root)).toBe(resolve(root, ".mise.toml"));
  });

  it("explains how to install mise when the executable is unavailable", async () => {
    const root = fixture();
    const missing = Object.assign(new Error("spawn mise ENOENT"), { code: "ENOENT" });
    const run = vi.fn<ProjectPreparationRunner>(async () => { throw missing; });

    await expect(prepareProject(root, { run })).rejects.toThrow(
      "This dojo uses mise for its development environment, but mise is not installed",
    );
  });

  it("prepares both the checkout and the selected dojo", async () => {
    const root = fixture();
    const courseRoot = resolve(root, ".dojos", "guided-python");
    mkdirSync(courseRoot, { recursive: true });
    writeFileSync(resolve(root, ".dojorc"), JSON.stringify({ currentDojo: "guided-python" }));
    writeFileSync(resolve(courseRoot, "mise.toml"), "[tools]\npython = \"3.13\"\n");
    const run = vi.fn<ProjectPreparationRunner>(async (_command, args) =>
      args[0] === "tasks" ? "setup\n" : ""
    );

    await expect(prepareWorkspace(root, { run })).resolves.toEqual([
      { prepared: true, configPath: resolve(root, "mise.toml"), setupTask: true },
      { prepared: true, configPath: resolve(courseRoot, "mise.toml"), setupTask: true },
    ]);
    expect(run.mock.calls.map(([, , options]) => options.cwd)).toEqual([
      root, root, root, courseRoot, courseRoot, courseRoot,
    ]);
  });
});
