import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import { describe, expect, it } from "vitest";
import { scaffoldAuthoringWorkspace } from "@dojofoo/authoring/scaffold";

describe("kyoshi scaffold", () => {
  it("copies authoring mechanics without subject or lesson content", () => {
    const root = mkdtempSync(resolve(tmpdir(), "dojofoo-kyoshi-"));
    scaffoldAuthoringWorkspace({ root, name: "empty-course", style: "katas" });

    const manifest = parseYaml(readFileSync(resolve(root, "dojo.yaml"), "utf8"));
    const packageManifest = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
    expect(manifest.katas).toEqual([]);
    expect(manifest.description).toBe("");
    expect(packageManifest.name).toBe("empty-course");
    expect(existsSync(resolve(root, "DOJO.md"))).toBe(false);
    expect(existsSync(resolve(root, "src", "001-normalize-label"))).toBe(false);
    expect(existsSync(resolve(root, "evals", "run.ts"))).toBe(true);
    expect(existsSync(resolve(root, "evals", "lessons"))).toBe(true);
  });

  it("does not rename an existing project when authoring is opened", () => {
    const root = mkdtempSync(resolve(tmpdir(), "dojofoo-kyoshi-existing-"));
    writeFileSync(resolve(root, "package.json"), '{"name":"existing-project"}\n');
    writeFileSync(resolve(root, "dojo.yaml"), "mode: katas\nname: existing-course\nkatas: []\n");

    scaffoldAuthoringWorkspace({ root, name: "ignored-name", style: "katas" });

    expect(JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")).name)
      .toBe("existing-project");
    expect(parseYaml(readFileSync(resolve(root, "dojo.yaml"), "utf8")).name)
      .toBe("existing-course");
  });
});
