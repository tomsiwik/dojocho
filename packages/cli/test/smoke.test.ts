import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readFileSync, chmodSync } from "node:fs";
import { rmSync } from "node:fs";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";

import { setup, setupAgents, configuredAgents, AGENTS } from "../src/commands/setup";
import { intro } from "../src/commands/intro";
import { kata } from "../src/commands/kata";
import { journalPath, appendNote, readLearnings } from "../src/journal";
import { runLifecycleScript } from "../src/commands/add";
import { remove } from "../src/commands/remove";

// --- Helpers ---

function makeTmpDir(): string {
  return mkdtempSync(join(tmpdir(), "dojo-test-"));
}

function writeRc(root: string, rc: object): void {
  writeFileSync(resolve(root, ".dojorc"), JSON.stringify(rc));
}

function readRc(root: string): Record<string, unknown> {
  return JSON.parse(readFileSync(resolve(root, ".dojorc"), "utf8"));
}

function writeDojoMd(root: string, dojo: string, content: string): void {
  const dir = dojo
    ? resolve(root, ".dojos", dojo)
    : resolve(root, ".dojos");
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, "DOJO.md"), content);
}

function writeDojoJson(root: string, dojo: string, manifest: object): void {
  const dir = resolve(root, ".dojos", dojo);
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, "dojo.json"), JSON.stringify(manifest));
}

function writeSenseiMd(root: string, dojo: string, kataDir: string, content: string): void {
  const dir = resolve(root, ".dojos", dojo, kataDir);
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, "SENSEI.md"), content);
}

function writeWorkspaceFile(root: string, kataName: string, filename: string): void {
  const dir = resolve(root, "katas", kataName);
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, filename), "// scaffold");
}

function captureLog(fn: () => void): string {
  const spy = vi.spyOn(console, "log").mockImplementation(() => {});
  try {
    fn();
    return spy.mock.calls.map((c) => c.join(" ")).join("\n");
  } finally {
    spy.mockRestore();
  }
}

// --- Tests ---

describe("dojo setup", () => {
  let root: string;

  beforeEach(() => { root = makeTmpDir(); });
  afterEach(() => { rmSync(root, { recursive: true, force: true }); });

  it("outputs AskUserQuestion prompt when no flags given", () => {
    const output = captureLog(() => setup(root, []));

    expect(output).toContain("AskUserQuestion");
    expect(output).toContain("Claude Code");
    expect(output).toContain("Gemini CLI");
  });
});

describe("setupAgents", () => {
  let root: string;

  beforeEach(() => { root = makeTmpDir(); });
  afterEach(() => { rmSync(root, { recursive: true, force: true }); });

  it("creates agent dirs and kata.md", () => {
    setupAgents(root, ["claude"]);

    expect(existsSync(resolve(root, ".claude/commands"))).toBe(true);
    expect(existsSync(resolve(root, ".claude/skills"))).toBe(true);
    expect(existsSync(resolve(root, ".claude/commands/kata.md"))).toBe(true);
    expect(readFileSync(resolve(root, ".claude/commands/kata.md"), "utf8")).toContain("dojo status");
  });

  it("writes settings.json only for claude", () => {
    setupAgents(root, ["claude", "gemini"]);

    expect(existsSync(resolve(root, ".claude/settings.json"))).toBe(true);
    expect(existsSync(resolve(root, ".gemini/settings.json"))).toBe(false);
    expect(existsSync(resolve(root, ".gemini/commands/kata.md"))).toBe(true);
  });

  it("writes interactive kata.md for claude and default for others", () => {
    setupAgents(root, ["claude", "gemini"]);

    const claudeKata = readFileSync(resolve(root, ".claude/commands/kata.md"), "utf8");
    const geminiKata = readFileSync(resolve(root, ".gemini/commands/kata.md"), "utf8");

    expect(claudeKata).toContain("AskUserQuestion");
    expect(claudeKata).toContain("kata sensei");
    expect(claudeKata).not.toContain("Teaching Subagent");
    expect(claudeKata).not.toContain("subagent_type");
    expect(geminiKata).not.toContain("AskUserQuestion");
    expect(geminiKata).toContain("Internalize but never show verbatim");
  });

  it("does not create .claude/agents/ directory", () => {
    setupAgents(root, ["claude"]);

    expect(existsSync(resolve(root, ".claude/agents"))).toBe(false);
  });

  it("settings.json does not include Agent permissions", () => {
    setupAgents(root, ["claude"]);

    const settings = JSON.parse(readFileSync(resolve(root, ".claude/settings.json"), "utf8"));
    expect(settings.permissions.allow).not.toContain("Agent(sensei)");
  });

  it("sets up multiple agents", () => {
    setupAgents(root, ["claude", "opencode", "codex", "gemini"]);

    for (const agent of Object.keys(AGENTS) as (keyof typeof AGENTS)[]) {
      const dir = AGENTS[agent].dir;
      expect(existsSync(resolve(root, dir, "commands"))).toBe(true);
      expect(existsSync(resolve(root, dir, "skills"))).toBe(true);
    }
  });

  it("only sets up specified agents", () => {
    setupAgents(root, ["opencode", "codex"]);

    expect(existsSync(resolve(root, ".opencode/commands"))).toBe(true);
    expect(existsSync(resolve(root, ".codex/commands"))).toBe(true);
    expect(existsSync(resolve(root, ".claude/commands"))).toBe(false);
  });
});

describe("configuredAgents", () => {
  let root: string;

  beforeEach(() => { root = makeTmpDir(); });
  afterEach(() => { rmSync(root, { recursive: true, force: true }); });

  it("returns empty array when no agent dirs exist", () => {
    expect(configuredAgents(root)).toEqual([]);
  });

  it("detects agents whose directories exist", () => {
    mkdirSync(resolve(root, ".claude"), { recursive: true });
    mkdirSync(resolve(root, ".gemini"), { recursive: true });

    const agents = configuredAgents(root);
    expect(agents).toContain("claude");
    expect(agents).toContain("gemini");
    expect(agents).not.toContain("opencode");
    expect(agents).not.toContain("codex");
  });
});

describe("dojo intro", () => {
  let root: string;

  beforeEach(() => { root = makeTmpDir(); });
  afterEach(() => { rmSync(root, { recursive: true, force: true }); });

  it("shows fallback when no dojo is active and no DOJO.md exists", () => {
    writeRc(root, { currentDojo: "", currentKata: null, editor: null });

    const output = captureLog(() => intro(root, []));
    expect(output).toContain("No dojo active");
    expect(output).toContain("add");
  });

  it("shows root DOJO.md when no dojo is active but DOJO.md exists", () => {
    writeRc(root, { currentDojo: "", currentKata: null, editor: null });
    writeDojoMd(root, "", "# Welcome to the Dojo");

    const output = captureLog(() => intro(root, []));
    expect(output).toContain("Welcome to the Dojo");
  });

  it("shows dojo-specific DOJO.md when a dojo is active", () => {
    writeRc(root, { currentDojo: "my-dojo", currentKata: null, editor: null });
    writeDojoMd(root, "my-dojo", "# My Dojo Guide");

    const output = captureLog(() => intro(root, []));
    expect(output).toContain("My Dojo Guide");
  });

  it("shows 'no DOJO.md' when dojo has none", () => {
    writeRc(root, { currentDojo: "bare-dojo", currentKata: null, editor: null });
    mkdirSync(resolve(root, ".dojos/bare-dojo"), { recursive: true });

    const output = captureLog(() => intro(root, []));
    expect(output).toContain('has no DOJO.md');
  });

  it("offers switching when multiple dojos are installed", () => {
    writeRc(root, { currentDojo: "dojo-a", currentKata: null, editor: null });
    writeDojoMd(root, "dojo-a", "# Dojo A");
    mkdirSync(resolve(root, ".dojos/dojo-b"), { recursive: true });

    const output = captureLog(() => intro(root, []));
    expect(output).toContain("dojo-b");
    expect(output).toContain("AskUserQuestion");
  });

  it("does not mark dojo as introduced without --done", () => {
    writeRc(root, { currentDojo: "my-dojo", currentKata: null, editor: null });
    writeDojoMd(root, "my-dojo", "# My Dojo");

    captureLog(() => intro(root, []));

    const rc = readRc(root);
    const progress = rc.progress as Record<string, Record<string, unknown>> | undefined;
    expect(progress?.["my-dojo"]?.introduced).toBeFalsy();
  });

  it("marks dojo as introduced with --done", () => {
    writeRc(root, { currentDojo: "my-dojo", currentKata: null, editor: null });
    writeDojoMd(root, "my-dojo", "# My Dojo");

    captureLog(() => intro(root, ["--done"]));

    const rc = readRc(root);
    const progress = (rc.progress as Record<string, Record<string, unknown>>)["my-dojo"];
    expect(progress.introduced).toBe(true);
  });
});

describe("dojo kata intro", () => {
  let root: string;

  beforeEach(() => { root = makeTmpDir(); });
  afterEach(() => { rmSync(root, { recursive: true, force: true }); });

  it("shows error when no dojo is active", () => {
    writeRc(root, { currentDojo: "", currentKata: null, editor: null });

    const output = captureLog(() => kata(root, ["intro"]));
    expect(output).toContain("No dojo active");
  });

  it("shows prompt when no kata in progress", () => {
    writeRc(root, { currentDojo: "my-dojo", currentKata: null, editor: null });
    writeDojoJson(root, "my-dojo", {
      name: "my-dojo",
      version: "1.0.0",
      description: "test",
      test: "echo test",
      katas: [],
    });

    const output = captureLog(() => kata(root, ["intro"]));
    expect(output).toContain("No kata in progress");
  });

  it("shows SENSEI.md when kata is active", () => {
    writeRc(root, { currentDojo: "my-dojo", currentKata: "001-basics", editor: null });
    writeDojoJson(root, "my-dojo", {
      name: "my-dojo",
      version: "1.0.0",
      description: "test",
      test: "echo test",
      katas: [{ template: "katas/001-basics/solution.ts", name: "001-basics" }],
    });
    writeSenseiMd(root, "my-dojo", "katas/001-basics", "# Welcome, Student\n\nYour first kata.");
    writeWorkspaceFile(root, "001-basics", "solution.ts");

    const output = captureLog(() => kata(root, ["intro"]));
    expect(output).toContain("Welcome, Student");
  });

  it("shows fallback when SENSEI.md is missing", () => {
    writeRc(root, { currentDojo: "my-dojo", currentKata: "001-basics", editor: null });
    writeDojoJson(root, "my-dojo", {
      name: "my-dojo",
      version: "1.0.0",
      description: "test",
      test: "echo test",
      katas: [{ template: "katas/001-basics/solution.ts", name: "001-basics" }],
    });
    mkdirSync(resolve(root, ".dojos/my-dojo/katas/001-basics"), { recursive: true });
    writeWorkspaceFile(root, "001-basics", "solution.ts");

    const output = captureLog(() => kata(root, ["intro"]));
    expect(output).toContain("No SENSEI.md found");
  });

  it("does not mark kata as introduced without --done", () => {
    writeRc(root, { currentDojo: "my-dojo", currentKata: "001-basics", editor: null });
    writeDojoJson(root, "my-dojo", {
      name: "my-dojo",
      version: "1.0.0",
      description: "test",
      test: "echo test",
      katas: [{ template: "katas/001-basics/solution.ts", name: "001-basics" }],
    });
    writeSenseiMd(root, "my-dojo", "katas/001-basics", "# Welcome");
    writeWorkspaceFile(root, "001-basics", "solution.ts");

    captureLog(() => kata(root, ["intro"]));

    const rc = readRc(root);
    const progress = rc.progress as Record<string, Record<string, unknown>> | undefined;
    expect(progress?.["my-dojo"]?.kataIntros).toBeFalsy();
  });

  it("marks kata as introduced with --done", () => {
    writeRc(root, { currentDojo: "my-dojo", currentKata: "001-basics", editor: null });
    writeDojoJson(root, "my-dojo", {
      name: "my-dojo",
      version: "1.0.0",
      description: "test",
      test: "echo test",
      katas: [{ template: "katas/001-basics/solution.ts", name: "001-basics" }],
    });
    writeSenseiMd(root, "my-dojo", "katas/001-basics", "# Welcome");
    writeWorkspaceFile(root, "001-basics", "solution.ts");

    captureLog(() => kata(root, ["intro", "--done"]));

    const rc = readRc(root);
    const progress = (rc.progress as Record<string, Record<string, unknown>>)["my-dojo"];
    expect(progress.kataIntros).toContain("001-basics");
  });
});

describe("dojo kata smart mode (intro tracking)", () => {
  let root: string;

  beforeEach(() => { root = makeTmpDir(); });
  afterEach(() => { rmSync(root, { recursive: true, force: true }); });

  const MANIFEST = {
    name: "my-dojo",
    version: "1.0.0",
    description: "test",
    test: "echo test",
    katas: [{ template: "katas/001-basics/solution.ts", name: "001-basics" }],
  };

  it("shows SENSEI.md directly when dojo not yet introduced", () => {
    writeRc(root, { currentDojo: "my-dojo", currentKata: "001-basics", editor: null });
    writeDojoJson(root, "my-dojo", MANIFEST);
    writeWorkspaceFile(root, "001-basics", "solution.ts");

    const output = captureLog(() => kata(root, []));
    expect(output).toContain("No SENSEI.md found for 001-basics.");
  });

  it("shows SENSEI.md directly when dojo introduced but kata not", () => {
    writeRc(root, {
      currentDojo: "my-dojo",
      currentKata: "001-basics",
      editor: null,
      progress: { "my-dojo": { completed: [], lastActive: null, introduced: true } },
    });
    writeDojoJson(root, "my-dojo", MANIFEST);
    writeSenseiMd(root, "my-dojo", "katas/001-basics", "# Sensei says hello");
    writeWorkspaceFile(root, "001-basics", "solution.ts");

    const output = captureLog(() => kata(root, []));
    expect(output).toContain("Sensei says hello");
  });

  it("shows SENSEI.md when both dojo and kata are introduced", () => {
    writeRc(root, {
      currentDojo: "my-dojo",
      currentKata: "001-basics",
      editor: null,
      progress: { "my-dojo": { completed: [], lastActive: null, introduced: true, kataIntros: ["001-basics"] } },
    });
    writeDojoJson(root, "my-dojo", MANIFEST);
    writeSenseiMd(root, "my-dojo", "katas/001-basics", "# Continue working");
    writeWorkspaceFile(root, "001-basics", "solution.ts");

    const output = captureLog(() => kata(root, []));
    expect(output).toContain("Continue working");
  });
});

describe("dojo kata --note", () => {
  let root: string;

  beforeEach(() => { root = makeTmpDir(); });
  afterEach(() => { rmSync(root, { recursive: true, force: true }); });

  it("creates JOURNAL.md with header and kata heading", () => {
    writeRc(root, { currentDojo: "my-dojo", currentKata: "001-basics", editor: null });
    mkdirSync(resolve(root, ".dojos/my-dojo"), { recursive: true });

    const output = captureLog(() => kata(root, ["--note", "Learned about types"]));
    expect(output).toContain("Noted for 001-basics");

    const journal = readFileSync(journalPath(root, "my-dojo"), "utf8");
    expect(journal).toContain("# Learning Journal");
    expect(journal).toContain("## 001-basics");
    expect(journal).toContain("- Learned about types");
  });

  it("appends multiple notes under same kata heading", () => {
    writeRc(root, { currentDojo: "my-dojo", currentKata: "001-basics", editor: null });
    mkdirSync(resolve(root, ".dojos/my-dojo"), { recursive: true });

    captureLog(() => kata(root, ["--note", "First observation"]));
    captureLog(() => kata(root, ["--note", "Second observation"]));

    const journal = readFileSync(journalPath(root, "my-dojo"), "utf8");
    const headingCount = journal.split("## 001-basics").length - 1;
    expect(headingCount).toBe(1);
    expect(journal).toContain("- First observation");
    expect(journal).toContain("- Second observation");
  });

  it("creates separate sections for different katas", () => {
    writeRc(root, { currentDojo: "my-dojo", currentKata: "001-basics", editor: null });
    mkdirSync(resolve(root, ".dojos/my-dojo"), { recursive: true });

    captureLog(() => kata(root, ["--note", "Basics note"]));

    // Switch kata
    writeRc(root, { currentDojo: "my-dojo", currentKata: "002-validation", editor: null });
    captureLog(() => kata(root, ["--note", "Validation note"]));

    const journal = readFileSync(journalPath(root, "my-dojo"), "utf8");
    expect(journal).toContain("## 001-basics");
    expect(journal).toContain("## 002-validation");
    expect(journal).toContain("- Basics note");
    expect(journal).toContain("- Validation note");
  });

  it("throws when no dojo active", () => {
    writeRc(root, { currentDojo: "", currentKata: null, editor: null });

    expect(() => kata(root, ["--note", "test"])).toThrow("No dojo active");
  });

  it("throws when no kata active", () => {
    writeRc(root, { currentDojo: "my-dojo", currentKata: null, editor: null });

    expect(() => kata(root, ["--note", "test"])).toThrow("No kata in progress");
  });

  it("throws when note text missing", () => {
    writeRc(root, { currentDojo: "my-dojo", currentKata: "001-basics", editor: null });

    expect(() => kata(root, ["--note"])).toThrow("Usage:");
  });
});

describe("dojo:learnings emission", () => {
  let root: string;

  const MANIFEST = {
    name: "my-dojo",
    version: "1.0.0",
    description: "test",
    test: "echo test",
    katas: [{ template: "katas/001-basics/solution.ts", name: "001-basics" }],
  };

  beforeEach(() => { root = makeTmpDir(); });
  afterEach(() => { rmSync(root, { recursive: true, force: true }); });

  it("emits <dojo:learnings> in smart mode when journal has content", () => {
    writeRc(root, { currentDojo: "my-dojo", currentKata: "001-basics", editor: null });
    writeDojoJson(root, "my-dojo", MANIFEST);
    writeSenseiMd(root, "my-dojo", "katas/001-basics", "# Sensei content");
    writeWorkspaceFile(root, "001-basics", "solution.ts");
    appendNote(root, "my-dojo", "001-basics", "Prior observation");

    const output = captureLog(() => kata(root, []));
    expect(output).toContain("<dojo:learnings>");
    expect(output).toContain("Prior observation");
  });

  it("does NOT emit <dojo:learnings> when journal is empty", () => {
    writeRc(root, { currentDojo: "my-dojo", currentKata: "001-basics", editor: null });
    writeDojoJson(root, "my-dojo", MANIFEST);
    writeSenseiMd(root, "my-dojo", "katas/001-basics", "# Sensei content");
    writeWorkspaceFile(root, "001-basics", "solution.ts");

    const output = captureLog(() => kata(root, []));
    expect(output).not.toContain("<dojo:learnings>");
  });

  it("emits <dojo:learnings> in kata intro flow", () => {
    writeRc(root, { currentDojo: "my-dojo", currentKata: "001-basics", editor: null });
    writeDojoJson(root, "my-dojo", MANIFEST);
    writeSenseiMd(root, "my-dojo", "katas/001-basics", "# Welcome");
    writeWorkspaceFile(root, "001-basics", "solution.ts");
    appendNote(root, "my-dojo", "001-basics", "Intro observation");

    const output = captureLog(() => kata(root, ["intro"]));
    expect(output).toContain("<dojo:learnings>");
    expect(output).toContain("Intro observation");
  });
});

describe("lifecycle scripts", () => {
  let root: string;

  beforeEach(() => { root = makeTmpDir(); });
  afterEach(() => { rmSync(root, { recursive: true, force: true }); });

  it("runs prepare.sh if present", () => {
    const dojoPath = resolve(root, ".dojos", "test-dojo");
    mkdirSync(dojoPath, { recursive: true });

    const script = `#!/usr/bin/env bash\ntouch "$PROJECT_ROOT/prepare-marker"`;
    writeFileSync(resolve(dojoPath, "prepare.sh"), script);
    chmodSync(resolve(dojoPath, "prepare.sh"), 0o755);

    runLifecycleScript(root, dojoPath, "prepare.sh");

    expect(existsSync(resolve(root, "prepare-marker"))).toBe(true);
  });

  it("runs teardown.sh if present", () => {
    const dojoPath = resolve(root, ".dojos", "test-dojo");
    mkdirSync(dojoPath, { recursive: true });

    const script = `#!/usr/bin/env bash\ntouch "$PROJECT_ROOT/teardown-marker"`;
    writeFileSync(resolve(dojoPath, "teardown.sh"), script);
    chmodSync(resolve(dojoPath, "teardown.sh"), 0o755);

    runLifecycleScript(root, dojoPath, "teardown.sh");

    expect(existsSync(resolve(root, "teardown-marker"))).toBe(true);
  });

  it("is a no-op when script is missing", () => {
    const dojoPath = resolve(root, ".dojos", "test-dojo");
    mkdirSync(dojoPath, { recursive: true });

    // Should not throw
    runLifecycleScript(root, dojoPath, "prepare.sh");
    runLifecycleScript(root, dojoPath, "teardown.sh");
  });

  it("prints warning but does not throw on script failure", () => {
    const dojoPath = resolve(root, ".dojos", "test-dojo");
    mkdirSync(dojoPath, { recursive: true });

    const script = `#!/usr/bin/env bash\nexit 1`;
    writeFileSync(resolve(dojoPath, "prepare.sh"), script);
    chmodSync(resolve(dojoPath, "prepare.sh"), 0o755);

    const output = captureLog(() => runLifecycleScript(root, dojoPath, "prepare.sh"));
    expect(output).toContain("Warning: prepare.sh exited with errors.");
  });

  it("dojo remove runs teardown.sh before deletion", () => {
    const dojoPath = resolve(root, ".dojos", "test-dojo");
    mkdirSync(dojoPath, { recursive: true });
    writeFileSync(resolve(dojoPath, "dojo.json"), JSON.stringify({ name: "test-dojo", version: "1.0.0", description: "test", test: "echo ok", katas: [] }));
    writeRc(root, { currentDojo: "test-dojo", currentKata: null, editor: null });

    const script = `#!/usr/bin/env bash\ntouch "$PROJECT_ROOT/teardown-ran"`;
    writeFileSync(resolve(dojoPath, "teardown.sh"), script);
    chmodSync(resolve(dojoPath, "teardown.sh"), 0o755);

    remove(root, ["test-dojo"]);

    expect(existsSync(resolve(root, "teardown-ran"))).toBe(true);
    expect(existsSync(dojoPath)).toBe(false);
  });
});
