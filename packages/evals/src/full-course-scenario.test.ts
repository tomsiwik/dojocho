import { describe, expect, it } from "vitest";
import {
  matrixHarnesses,
  runFullCourseScenario,
  type CheckEvidence,
  type CourseLesson,
  type FullCourseDriver,
} from "./full-course-scenario";

class CassetteCourseDriver implements FullCourseDriver {
  readonly events: string[] = [];
  private current = "";
  private source = "";
  private completed = new Set<string>();

  async begin(lesson: CourseLesson): Promise<void> {
    this.current = lesson.id;
    this.source = lesson.initialSource;
    this.events.push(`begin:${lesson.id}`);
  }

  async introduce(lesson: CourseLesson): Promise<string> {
    this.events.push(`introduce:${lesson.id}`);
    return `Let’s begin ${lesson.id} with one small step.`;
  }

  async followUp(lesson: CourseLesson): Promise<string> {
    this.events.push(`follow-up:${lesson.id}`);
    return "Let's make that first step more concrete.";
  }

  async writeSource(lesson: CourseLesson, source: string): Promise<void> {
    expect(this.current).toBe(lesson.id);
    this.source = source;
    this.events.push(`write:${lesson.id}`);
  }

  async check(lesson: CourseLesson): Promise<CheckEvidence> {
    expect(this.current).toBe(lesson.id);
    const passed = this.source === lesson.solvedSource;
    this.events.push(`check:${lesson.id}:${passed ? "pass" : "fail"}`);
    return { total: 4, passed: passed ? 4 : 0, failed: passed ? 0 : 4 };
  }

  async complete(lesson: CourseLesson): Promise<void> {
    expect(this.source).toBe(lesson.solvedSource);
    this.completed.add(lesson.id);
    this.events.push(`complete:${lesson.id}`);
  }

  async advance(current: CourseLesson, next: CourseLesson): Promise<void> {
    expect(this.completed.has(current.id)).toBe(true);
    expect(this.current).toBe(current.id);
    this.events.push(`advance:${current.id}:${next.id}`);
  }

  async reload(lesson: CourseLesson): Promise<void> {
    expect(this.completed.has(lesson.id)).toBe(true);
    this.events.push(`reload:${lesson.id}`);
  }
}

describe("full starter-course harness matrix", () => {
  it.each(matrixHarnesses)("%s preserves the complete lesson lifecycle", async (harness) => {
    const driver = new CassetteCourseDriver();
    const report = await runFullCourseScenario(harness, driver);

    expect(report.lessons).toHaveLength(3);
    expect(report.lessons.every(({ failing }) => failing.failed > 0)).toBe(true);
    expect(report.lessons.every(({ passing }) => passing.passed === passing.total)).toBe(true);
    expect(driver.events.filter((event) => event.startsWith("follow-up:"))).toHaveLength(3);
    expect(driver.events.filter((event) => event.startsWith("advance:"))).toHaveLength(2);
    expect(driver.events.at(-1)).toBe("reload:003-summarize-roster");
  });

  it("fails at the precise lifecycle boundary instead of silently continuing", async () => {
    const driver = new CassetteCourseDriver();
    driver.introduce = async () => "";

    await expect(runFullCourseScenario("codex", driver))
      .rejects.toThrow("codex/001-normalize-handle: introduction was empty");
  });

  it("can run one lesson as a cheap live harness smoke", async () => {
    const driver = new CassetteCourseDriver();
    const report = await runFullCourseScenario("fx", driver, [{
      id: "smoke",
      initialSource: "initial",
      solvedSource: "solved",
    }]);

    expect(report.lessons.map(({ id }) => id)).toEqual(["smoke"]);
    expect(driver.events.some((event) => event.startsWith("advance:"))).toBe(false);
  });

  it("fails when a same-session learner follow-up receives no response", async () => {
    const driver = new CassetteCourseDriver();
    driver.followUp = async () => "";

    await expect(runFullCourseScenario("fx", driver, [{
      id: "smoke",
      initialSource: "initial",
      solvedSource: "solved",
    }])).rejects.toThrow("fx/smoke: follow-up was empty");
  });
});
