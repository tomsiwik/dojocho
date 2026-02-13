import { execSync } from "node:child_process";
import { relative } from "node:path";
import type { KatasCatalog, ResolvedKata } from "./config.js";

export interface TestResult {
  title: string;
  status: "passed" | "failed";
  failureMessages: string[];
}

export interface TestRun {
  total: number;
  passed: number;
  failed: number;
  tests: TestResult[];
  error: string | null;
}

interface VitestJson {
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  testResults: Array<{
    assertionResults: Array<{
      title: string;
      status: string;
      failureMessages: string[];
    }>;
  }>;
}

export function runTests(
  kata: ResolvedKata,
  catalog: KatasCatalog,
  ryuDir: string,
): TestRun {
  const testRelPath = relative(ryuDir, kata.testPath);
  const testCmd = catalog.test.replace("{template}", testRelPath);
  const cmd = `${testCmd} --reporter=json`;

  try {
    const output = execSync(cmd, {
      cwd: ryuDir,
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 60_000,
    });
    return parseVitestJson(output.toString());
  } catch (err: unknown) {
    const e = err as { stdout?: Buffer; stderr?: Buffer; status?: number };
    // vitest exits non-zero when tests fail — stdout still has JSON
    if (e.stdout) {
      try {
        return parseVitestJson(e.stdout.toString());
      } catch {
        // JSON parse failed — real error
      }
    }
    const stderr = e.stderr?.toString() ?? "";
    return {
      total: 0,
      passed: 0,
      failed: 0,
      tests: [],
      error: stderr || "Test execution failed",
    };
  }
}

function parseVitestJson(raw: string): TestRun {
  const json: VitestJson = JSON.parse(raw);
  const tests: TestResult[] = [];
  for (const suite of json.testResults) {
    for (const t of suite.assertionResults) {
      tests.push({
        title: t.title,
        status: t.status === "passed" ? "passed" : "failed",
        failureMessages: t.failureMessages,
      });
    }
  }
  return {
    total: json.numTotalTests,
    passed: json.numPassedTests,
    failed: json.numFailedTests,
    tests,
    error: null,
  };
}
