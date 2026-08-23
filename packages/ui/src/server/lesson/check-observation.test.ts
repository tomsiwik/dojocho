import { describe, expect, it } from "vitest";
import { checkObservationInstruction, solutionBoundary, type CheckObservation } from "./service";

const failingReport = { complete: false } as CheckObservation["report"];

describe("check observation teaching guidance", () => {
  it("forbids renamed copies of the learner's solution", () => {
    expect(solutionBoundary).toContain("isomorphic example");
    expect(solutionBoundary).toContain("renaming the learner's parameter or function");
    expect(solutionBoundary).toContain("cannot be mechanically substituted into the kata");
  });

  it("turns repeated unchanged checks into progressively more concrete help", () => {
    const first = checkObservationInstruction({ attempt: 1, codeChanged: false, report: failingReport });
    const second = checkObservationInstruction({ attempt: 2, codeChanged: false, report: failingReport });
    const repeated = checkObservationInstruction({ attempt: 4, codeChanged: false, report: failingReport });

    expect(first).toContain("Leave room");
    expect(second).toContain("more concrete");
    expect(repeated).toContain("implicit request for help");
    expect(repeated).toContain("Do not stay silent");
    expect(repeated).toContain("present the relevant authored fragment");
    expect(repeated).toContain("different problem domain");
    expect(repeated).toContain("Do not write code that can be pasted into the kata");
  });
});
