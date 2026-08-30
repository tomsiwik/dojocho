import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const context = vi.hoisted(() => ({ root: "" }));

vi.mock("@dojofoo/config/local-state", () => ({
  observeLocalContext: () => ({ workspaceId: "trial-workspace" }),
}));

const { createAuthoringRoutes } = await import("./routes");
const authoringRoutes = createAuthoringRoutes({
  agent: {
    currentHarness: () => "test",
    start: async () => "test-session",
    resume: async () => {},
    history: async () => [],
    send: async () => "",
    answer: () => {},
  },
  resolveWorkspace: () => context.root,
  stream: () => new Response(null),
});
const repository = resolve(import.meta.dirname, "../../../..");

describe("authoring routes", () => {
  beforeEach(() => {
    context.root = mkdtempSync(resolve(tmpdir(), "dojofoo-authoring-"));
    cpSync(resolve(repository, "packages/authoring/templates/katas"), context.root, {
      recursive: true,
      filter: (source) => !source.includes("/.dojo/")
        && !source.endsWith("/node_modules")
        && !source.includes("/node_modules/"),
    });
    const installed = resolve(repository, "packages/authoring/templates/katas/node_modules");
    if (existsSync(installed)) {
      symlinkSync(installed, resolve(context.root, "node_modules"), "dir");
    }
  });

  it("projects an empty folder without inventing course material", async () => {
    const initial = await authoringRoutes.request("/workspace");
    expect(initial.status).toBe(200);
    const projected = await initial.json();
    expect(projected).toMatchObject({
      lessons: [],
      issues: expect.arrayContaining(['"description" must not be empty']),
    });
    expect(projected.courseChecks).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "intent", ready: false }),
      expect.objectContaining({ id: "curriculum", ready: false }),
    ]));
    expect(existsSync(resolve(context.root, "DOJO.md"))).toBe(false);

    authorLesson();
    const authored = await authoringRoutes.request("/workspace");
    await expect(authored.json()).resolves.toMatchObject({
      lessons: [{
        id: "001-draw-a-boundary",
        hasSensei: true,
        hasEval: true,
      }],
      issues: [],
    });
  });

  it("rejects evaluations with an actionable readiness response", async () => {
    const response = await authoringRoutes.request("/evals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ harness: "cassette" }),
    });
    expect(response.status).toBe(409);
    const result = await response.json();
    expect(result).toMatchObject({
      error: "The draft is not ready to evaluate.",
    });
    expect(result.missing).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "intent", ready: false }),
      expect.objectContaining({ id: "curriculum", ready: false }),
    ]));
  });

  it("runs an authored fixture and creates an isolated learner trial", async () => {
    authorLesson();

    const run = await authoringRoutes.request("/evals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ harness: "cassette" }),
    });
    expect(run.status).toBe(200);
    await expect(run.json()).resolves.toMatchObject({
      report: { harness: "cassette", score: 1 },
    });

    const trial = await authoringRoutes.request(
      "/lessons/001-draw-a-boundary/trials",
      { method: "POST" }
    );
    expect(trial.status).toBe(201);
    await expect(trial.json()).resolves.toEqual({
      workspaceId: "trial-workspace",
      courseId: "systems-thinking",
      lessonId: "001-draw-a-boundary",
    });
  });

  it("edits only supported authoring files and projects the saved content", async () => {
    const save = await authoringRoutes.request("/files/DOJO.md", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content: "# Course intent\n\nTeach through comparison." }),
    });
    expect(save.status).toBe(200);
    await expect(save.json()).resolves.toMatchObject({
      courseGuidance: "# Course intent\n\nTeach through comparison.\n",
    });

    const read = await authoringRoutes.request("/files/DOJO.md");
    await expect(read.json()).resolves.toEqual({
      path: "DOJO.md",
      content: "# Course intent\n\nTeach through comparison.\n",
    });

    const traversal = await authoringRoutes.request("/files/../secrets", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content: "no" }),
    });
    expect(traversal.status).not.toBe(200);
  });

  it("accepts the standard AG-UI message envelope", async () => {
    const response = await authoringRoutes.request("/messages", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", parts: [{ type: "text", content: "Shape one lesson." }] }],
      }),
    });
    expect(response.status).toBe(200);
  });

  function authorLesson() {
    writeFileSync(resolve(context.root, "dojo.yaml"), `mode: katas
name: systems-thinking
version: 0.0.1
description: Reason about systems.
language: TypeScript
test: pnpm test
katas:
  - name: 001-draw-a-boundary
    template: src/001-draw-a-boundary/solution.ts
    test: src/001-draw-a-boundary/solution.test.ts
    description: Draw a useful system boundary.
    difficulty: 1
`);
    const lessonRoot = resolve(context.root, "src/001-draw-a-boundary");
    mkdirSync(lessonRoot, { recursive: true });
    mkdirSync(resolve(context.root, "evals/lessons"), { recursive: true });
    writeFileSync(resolve(context.root, "DOJO.md"), "# Systems thinking\n\nTeach observable boundary decisions.\n");
    writeFileSync(resolve(lessonRoot, "KATA.md"), "# Draw a Boundary\n\nDraw and justify one system boundary.\n");
    writeFileSync(resolve(lessonRoot, "SENSEI.md"), "# Draw a Boundary\n\nHelp the learner compare what is inside and outside.\n");
    writeFileSync(resolve(lessonRoot, "solution.ts"), "");
    writeFileSync(resolve(lessonRoot, "solution.test.ts"), "");
    writeFileSync(resolve(context.root, "evals/lessons/001-draw-a-boundary.json"), `${JSON.stringify({
      lessonId: "001-draw-a-boundary",
      scenarios: [{
        id: "introduction",
        prompt: "Begin the lesson.",
        fixture: "Let us compare what sits inside and outside this system.",
        assertions: [{ type: "includes", value: "inside and outside" }],
      }],
    }, null, 2)}\n`);
  }
});
