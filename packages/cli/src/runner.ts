import { execSync } from "node:child_process";
import { relative } from "node:path";
import type { DojoManifest, ResolvedKata } from "./config";

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

export interface RunnerAdapter {
  prepareCommand(cmd: string): string;
  parseOutput(stdout: string, stderr: string, exitCode: number): TestRun;
}

// --- Vitest adapter ---

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

const vitestAdapter: RunnerAdapter = {
  prepareCommand(cmd: string) {
    return `${cmd} --reporter=json`;
  },
  parseOutput(stdout: string, _stderr: string, exitCode: number): TestRun {
    // vitest exits non-zero when tests fail — stdout still has JSON
    try {
      return parseVitestJson(stdout);
    } catch {
      if (exitCode !== 0) {
        return {
          total: 0, passed: 0, failed: 0, tests: [],
          error: _stderr || "Test execution failed",
        };
      }
      return { total: 0, passed: 0, failed: 0, tests: [], error: "Failed to parse vitest output" };
    }
  },
};

// --- Exit-code adapter ---

const exitCodeAdapter: RunnerAdapter = {
  prepareCommand(cmd: string) {
    return cmd;
  },
  parseOutput(stdout: string, stderr: string, exitCode: number): TestRun {
    if (exitCode === 0) {
      return {
        total: 1, passed: 1, failed: 0,
        tests: [{ title: "all tests", status: "passed", failureMessages: [] }],
        error: null,
      };
    }
    return {
      total: 1, passed: 0, failed: 1,
      tests: [{ title: "all tests", status: "failed", failureMessages: [stderr || stdout || "Tests failed"] }],
      error: null,
    };
  },
};

function getAdapter(manifest: DojoManifest): RunnerAdapter {
  const adapterName = manifest.runner?.adapter ?? "vitest";
  return adapterName === "exit-code" ? exitCodeAdapter : vitestAdapter;
}

export function runTests(
  kata: ResolvedKata,
  catalog: DojoManifest,
  dojoDir: string,
): TestRun {
  const adapter = getAdapter(catalog);
  const testRelPath = relative(dojoDir, kata.testPath);
  const testTemplate = kata.test ?? catalog.test;
  const testCmd = testTemplate.replace("{template}", testRelPath);
  const cmd = adapter.prepareCommand(testCmd);

  try {
    const output = execSync(cmd, {
      cwd: dojoDir,
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 60_000,
    });
    return adapter.parseOutput(output.toString(), "", 0);
  } catch (err: unknown) {
    const e = err as { stdout?: Buffer; stderr?: Buffer; status?: number };
    const stdout = e.stdout?.toString() ?? "";
    const stderr = e.stderr?.toString() ?? "";
    const exitCode = e.status ?? 1;

    const result = adapter.parseOutput(stdout, stderr, exitCode);
    if (result.error === null && result.total === 0 && stdout === "" && stderr !== "") {
      return { total: 0, passed: 0, failed: 0, tests: [], error: stderr || "Test execution failed" };
    }
    return result;
  }
}
