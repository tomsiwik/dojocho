import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import type { UIMessage } from "@tanstack/ai-client";
import { describe, expect, it } from "vitest";
import { parseAgentQuestions } from "@/components/chat/agent-question";
import { StreamedChatMessage } from "./index";

const fixture = JSON.parse(
  readFileSync(resolve(import.meta.dirname, "../../e2e/fixtures/chat-kitchen-sink.json"), "utf8"),
) as UIMessage[];

describe("TanStack AI UIMessage renderer", () => {
  it("renders kitchen-sink message parts in protocol order", () => {
    const html = fixture.map((message) => renderToStaticMarkup(
      <StreamedChatMessage
        fragments={{ "regex-whitespace": "Whitespace runs use the **one-or-more** quantifier." }}
        message={message}
        onToolAnswer={async () => undefined}
        workspaceId="fixture-workspace"
      />,
    )).join("");

    const ordered = [
      "Help me understand this failure.",
      "Worked",
      "Trimming now works",
      "2 of 3 tests passed",
      "Whitespace runs use the",
      "All checks pass",
    ];
    let cursor = -1;
    for (const text of ordered) {
      const next = html.indexOf(text);
      expect(next, `expected rendered output to contain ${text}`).toBeGreaterThan(cursor);
      cursor = next;
    }
    expect(html).toContain("Which kind of hint would help?");
    const question = fixture.flatMap((message) => message.parts)
      .find((part) => part.type === "tool-call" && part.name === "elicitation");
    expect(question?.type === "tool-call" && parseAgentQuestions(question.input)[0]?.title)
      .toBe("Which kind of hint would help?");
    expect(html).not.toContain("Lesson checks · 3/3 passed");
    expect(html).not.toContain("Parameters");
  });

  it("renders reasoning and each chained tool call with the Assistant UI disclosures", () => {
    const message = {
      id: "assistant-tools",
      role: "assistant",
      parts: [
        { type: "thinking", content: "**Inspecting the lesson**", state: "complete" },
        { type: "tool-call", id: "read-1", name: "read_file", state: "complete", input: { path: "KATA.md" }, output: "brief" },
        { type: "tool-result", toolCallId: "read-1", state: "complete", content: "brief" },
        { type: "tool-call", id: "search-1", name: "search_files", state: "complete", input: { path: "src" }, output: ["src/kata.ts"] },
        { type: "tool-result", toolCallId: "search-1", state: "complete", content: "src/kata.ts" },
        { type: "tool-call", id: "check-1", name: "run_command", state: "complete", input: { command: "dojofoo kata --check" }, output: { passed: 3 } },
        { type: "tool-result", toolCallId: "check-1", state: "complete", content: "3 passed" },
      ],
    } as UIMessage;

    const html = renderToStaticMarkup(
      <StreamedChatMessage fragments={{}} message={message} streaming workspaceId="fixture-workspace" />,
    );

    expect(html.match(/data-slot="reasoning-panel"/gu)).toHaveLength(1);
    expect(html.match(/data-slot="tool-call"/gu)).toHaveLength(3);
    expect(html).toContain("Inspecting the lesson");
    expect(html).not.toContain("Parameters &amp; result");
    expect(html).toContain("dojofoo kata --check");
  });

  it("renders dojo_ui_show as its authored fragment instead of tool machinery", () => {
    const message = {
      id: "assistant-fragment",
      role: "assistant",
      parts: [{
        type: "tool-call",
        id: "show-1",
        name: "dojofoo_dojo_ui_show",
        state: "complete",
        input: { fragmentId: "regex-whitespace" },
        output: { fragmentId: "regex-whitespace" },
      }],
    } as UIMessage;

    const html = renderToStaticMarkup(
      <StreamedChatMessage
        fragments={{ "regex-whitespace": "Whitespace runs use the **one-or-more** quantifier." }}
        message={message}
        workspaceId="fixture-workspace"
      />,
    );

    expect(html).toContain("Whitespace runs use the");
    expect(html).not.toContain("dojo_ui_show");
    expect(html).not.toContain("data-slot=\"tool-call\"");
  });
});
