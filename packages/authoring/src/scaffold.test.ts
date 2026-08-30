import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { scaffoldAuthoringWorkspace } from "./scaffold";

describe("authoring scaffold", () => {
  it("refreshes managed eval infrastructure without replacing author files", () => {
    const root = mkdtempSync(resolve(tmpdir(), "dojofoo-authoring-scaffold-"));
    scaffoldAuthoringWorkspace({ root, name: "draft", style: "katas" });
    writeFileSync(resolve(root, "evals/run.ts"), "stale\n");
    writeFileSync(resolve(root, "dojo.yaml"), "name: author-owned\n");

    scaffoldAuthoringWorkspace({ root, name: "ignored", style: "katas" });

    expect(readFileSync(resolve(root, "evals/run.ts"), "utf8")).toContain("requiredFile");
    expect(readFileSync(resolve(root, "dojo.yaml"), "utf8")).toBe("name: author-owned\n");
  });
});
