export type EvalAssertion = {
  name: string;
  passed: boolean;
  evidence?: string;
};

export type LessonScenario = {
  id: string;
  prompt: string;
  fixture?: string;
  assertions: Array<
    | { type: "includes"; value: string; name?: string }
    | { type: "excludes"; value: string; name?: string }
    | { type: "max-questions"; value: number; name?: string }
  >;
};

export type LessonEvalDefinition = {
  lessonId: string;
  cases: LessonScenario[];
};

export type LessonEvalResult = {
  lessonId: string;
  scenarioId: string;
  score: number;
  response: string;
  assertions: EvalAssertion[];
  durationMs: number;
};

export type AuthoringEvalReport = {
  version: 1;
  teachingStyle: "katas";
  harness: string;
  generatedAt: string;
  score: number;
  lessons: Array<{
    id: string;
    score: number;
    scenarios: LessonEvalResult[];
  }>;
};

export interface LessonEvalHarness {
  readonly name: string;
  generate(input: {
    course: string;
    lesson: string;
    scenario: LessonScenario;
  }): Promise<string>;
}
