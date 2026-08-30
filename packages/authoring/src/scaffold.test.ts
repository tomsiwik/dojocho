import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { scaffoldAuthoringWorkspace } from "./scaffold";

describe("authoring scaffold", () => {
  it("refreshes the shared eval runner without creating lesson eval hooks", () => {
    const root = mkdtempSync(resolve(tmpdir(), "dojofoo-authoring-scaffold-"));
    scaffoldAuthoringWorkspace({ root, name: "draft", style: "katas" });
    writeFileSync(resolve(root, "scripts/eval.ts"), "stale\n");
    writeFileSync(resolve(root, "dojo.yaml"), "name: author-owned\n");

    scaffoldAuthoringWorkspace({ root, name: "ignored", style: "katas" });

    expect(readFileSync(resolve(root, "scripts/eval.ts"), "utf8")).toContain("requiredFile");
    expect(readFileSync(resolve(root, "dojo.yaml"), "utf8")).toBe("name: author-owned\n");
  });
});
