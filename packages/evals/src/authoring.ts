import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { scaffoldAuthoringWorkspace } from "@dojofoo/authoring/scaffold";
import { writeAuthoringFile } from "@dojofoo/authoring/files";
import { messageWithAuthoringEdits } from "@dojofoo/authoring/types";
import { validateManifest } from "@dojofoo/config";
import { parse as parseYaml } from "yaml";
import { AcpClient } from "../../ui/src/server/lesson/codex-client";
import type { HarnessKind } from "../../ui/src/server/harness/adapter";

const workspace = resolve(import.meta.dirname, "../../..");
const contract = await readFile(
  resolve(workspace, "packages/authoring/src/contracts/KYOSHI.md"),
  "utf8"
);
const root = await mkdtemp(join(tmpdir(), "dojofoo-authoring-eval-"));
const harness = (process.env.DOJOFOO_EVAL_HARNESS ?? "codex") as HarnessKind;
const client = new AcpClient(180_000);
const startedAt = Date.now();

try {
  scaffoldAuthoringWorkspace({ root, name: "trim-course", style: "katas" });
  const sessionId = await client.startThread({
    root,
    runtimeKey: `authoring-eval:${harness}:${root}`,
    harness,
    developerInstructions: contract,
    lessonTools: false,
  });
  const response = await client.send(sessionId, [
    "Author a minimal one-lesson kata course for a TypeScript beginner to practice trimming surrounding whitespace.",
    "Create the valid course outline, DOJO.md, learner material, private Sensei guidance, solution scaffold, executable tests, and one learner-persona eval scenario now.",
    "Do not ask a question first. Keep the learner scaffold unsolved and verify the authored structure.",
  ].join(" "));

  const manifestPath = resolve(root, "dojo.yaml");
  const manifest = parseYaml(await readFile(manifestPath, "utf8")) as Record<string, unknown>;
  const entries = Array.isArray(manifest.katas) ? manifest.katas : [];
  const first = entries[0] as Record<string, unknown> | undefined;
  const lessonId = String(first?.name ?? "");
  const lessonRoot = resolve(root, "src", lessonId);
  const senseiPath = ["SENSEI.mdx", "SENSEI.md"]
    .map((name) => resolve(lessonRoot, name))
    .find(existsSync);
  const [kata, sensei, solution, test, evalDefinition] = await Promise.all([
    readOptional(resolve(lessonRoot, "KATA.md")),
    senseiPath ? readOptional(senseiPath) : Promise.resolve(""),
    readOptional(resolve(root, String(first?.template ?? ""))),
    readOptional(resolve(root, String(first?.test ?? ""))),
    readOptional(resolve(root, "evals", "lessons", `${lessonId}.json`)),
  ]);
  const learnerMaterialPath = `src/${lessonId}/KATA.md`;
  writeAuthoringFile(
    root,
    learnerMaterialPath,
    `${kata.trim()}\n\n> Author note: introduce the concept through a concrete comparison before terminology.\n`
  );
  const editResponse = await client.send(
    sessionId,
    messageWithAuthoringEdits(
      "I adjusted the learner material. In one sentence, identify the teaching choice I changed. Do not edit files.",
      [learnerMaterialPath]
    )
  );
  const assertions = [
    assertion("writes a valid manifest", validateManifest(manifest).length === 0, validateManifest(manifest)),
    assertion("authors exactly one focused lesson", entries.length === 1 && lessonId.length > 0, entries.length),
    assertion("separates course-wide guidance", existsSync(resolve(root, "DOJO.md"))),
    assertion("creates learner and private material", kata.length > 0 && sensei.length > 0),
    assertion("creates an unsolved scaffold and executable checks", solution.length > 0 && test.length > 0),
    assertion("creates a learner-persona eval", hasScenarios(evalDefinition)),
    assertion("does not leak a pasteable solution", !/return\s+\w+\.trim\s*\(\s*\)/u.test(`${kata}\n${sensei}`)),
    assertion("keeps the authoring response usable", response.length > 0 && response.length <= 5000, `${response.length}/5000 characters`),
    assertion("reads human UI edits before advising", /concrete comparison/iu.test(editResponse), editResponse.slice(0, 1000)),
    assertion("does not expose UI edit protocol", !editResponse.includes("[dojo:author-edits]")),
  ];
  const score = assertions.filter(({ passed }) => passed).length / assertions.length;
  process.stdout.write(`${JSON.stringify({
    scenario: "kyoshi/author-one-kata",
    harness,
    sessionId,
    durationMs: Date.now() - startedAt,
    root: process.env.DOJOFOO_KEEP_EVAL_WORKSPACE === "1" ? root : undefined,
    response: response.slice(0, 5000),
    editResponse: editResponse.slice(0, 1000),
    score,
    assertions,
  }, null, 2)}\n`);
  if (score !== 1) process.exitCode = 1;
} finally {
  client.shutdown();
  if (process.env.DOJOFOO_KEEP_EVAL_WORKSPACE !== "1") {
    await rm(root, { recursive: true, force: true });
  }
}

async function readOptional(path: string): Promise<string> {
  return readFile(path, "utf8").catch(() => "");
}

function hasScenarios(value: string): boolean {
  if (!value) return false;
  try {
    const scenarios = (JSON.parse(value) as { scenarios?: unknown }).scenarios;
    return Array.isArray(scenarios) && scenarios.length > 0;
  } catch {
    return false;
  }
}

function assertion(name: string, passed: boolean, evidence?: unknown) {
  return { name, passed, ...(evidence === undefined ? {} : { evidence }) };
}
