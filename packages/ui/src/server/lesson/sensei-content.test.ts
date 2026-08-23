import { describe, expect, it } from "vitest";
import { parseSenseiContent, senseiFragmentIds } from "./sensei-content";

describe("SENSEI.mdx content", () => {
  it("exposes only explicitly authored Present blocks to the learner", () => {
    const source = `# Lesson
<TeachingPolicy>Never reveal this.</TeachingPolicy>
<Present id="example">
## Visible example
<RegexWorkbench input="Ada   Lovelace" pattern="\\s+" flags="g" replacement="-" />
</Present>`;

    expect(parseSenseiContent(source).fragments).toEqual({
      example: `## Visible example
<RegexWorkbench input="Ada   Lovelace" pattern="\\s+" flags="g" replacement="-" />`,
    });
    expect(senseiFragmentIds(source)).toEqual(["example"]);
  });
});
