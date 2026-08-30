import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type {
  AuthoringEvalReport,
  EvalAssertion,
  LessonEvalDefinition,
  LessonEvalHarness,
  LessonEvalResult,
  LessonScenario,
} from "./types";
import { createHarness } from "./harnesses";

const root = resolve(import.meta.dirname, "..");
const requestedHarness = process.argv.find((argument) =>
  argument.startsWith("--harness=")
)?.split("=")[1] ?? "cassette";
const harness: LessonEvalHarness = createHarness(requestedHarness, root);

const course = await requiredFile("DOJO.md");
const definitions = await readDefinitions();
if (definitions.length === 0) {
  stop("No lesson evals exist yet. Add evals/lessons/<lesson-id>.json before running evaluations.");
}
const lessons = [];
for (const definition of definitions) {
  const lesson = await readLessonInstructions(definition.lessonId);
  const scenarios: LessonEvalResult[] = [];
  for (const scenario of definition.scenarios) {
    const startedAt = Date.now();
    const response = await harness.generate({ course, lesson, scenario });
    const assertions = scoreScenario(scenario, response);
    scenarios.push({
      lessonId: definition.lessonId,
      scenarioId: scenario.id,
      response,
      assertions,
      score: passedRatio(assertions),
      durationMs: Date.now() - startedAt,
    });
  }
  lessons.push({
    id: definition.lessonId,
    score: average(scenarios.map(({ score }) => score)),
    scenarios,
  });
}
const report: AuthoringEvalReport = {
  version: 1,
  teachingStyle: "katas",
  harness: harness.name,
  generatedAt: new Date().toISOString(),
  score: average(lessons.map(({ score }) => score)),
  lessons,
};
const reportDirectory = resolve(root, ".dojo", "evals");
await mkdir(reportDirectory, { recursive: true });
await writeFile(
  resolve(reportDirectory, "report.json"),
  `${JSON.stringify(report, null, 2)}\n`
);
process.stdout.write(`${JSON.stringify(report)}\n`);
if (lessons.some(({ scenarios }) =>
  scenarios.some(({ assertions }) => assertions.some(({ passed }) => !passed)))) {
  process.exitCode = 1;
}

async function readDefinitions(): Promise<LessonEvalDefinition[]> {
  const directory = resolve(root, "evals", "lessons");
  const files = await readdir(directory).catch(() => []);
  return Promise.all(files.filter((file) => file.endsWith(".json")).sort().map(async (file) =>
    JSON.parse(await readFile(resolve(directory, file), "utf8")) as LessonEvalDefinition
  ));
}

async function requiredFile(path: string): Promise<string> {
  try {
    return await readFile(resolve(root, path), "utf8");
  } catch {
    stop(`${path} is missing.`);
  }
}

function stop(reason: string): never {
  process.stderr.write(`The draft is not ready to evaluate.\n\n${reason}\n`);
  process.exit(1);
}

async function readLessonInstructions(lessonId: string): Promise<string> {
  for (const name of ["SENSEI.mdx", "SENSEI.md"]) {
    try {
      return await readFile(resolve(root, "src", lessonId, name), "utf8");
    } catch {
      // Try the other supported authoring format.
    }
  }
  throw new Error(`Lesson ${lessonId} has no SENSEI.md or SENSEI.mdx`);
}

function scoreScenario(scenario: LessonScenario, response: string): EvalAssertion[] {
  return scenario.assertions.map((assertion) => {
    if (assertion.type === "includes") {
      return {
        name: assertion.name ?? `includes ${assertion.value}`,
        passed: response.toLocaleLowerCase().includes(assertion.value.toLocaleLowerCase()),
      };
    }
    if (assertion.type === "excludes") {
      return {
        name: assertion.name ?? `excludes ${assertion.value}`,
        passed: !response.toLocaleLowerCase().includes(assertion.value.toLocaleLowerCase()),
      };
    }
    const questions = (response.match(/\?/gu) ?? []).length;
    return {
      name: assertion.name ?? `uses at most ${assertion.value} questions`,
      passed: questions <= assertion.value,
      evidence: `${questions} questions`,
    };
  });
}

function passedRatio(assertions: Array<{ passed: boolean }>): number {
  return assertions.filter(({ passed }) => passed).length / assertions.length;
}

function average(values: number[]): number {
  return values.length === 0
    ? 0
    : values.reduce((total, value) => total + value, 0) / values.length;
}
