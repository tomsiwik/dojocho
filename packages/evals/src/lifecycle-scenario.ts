import type { Assertion } from "./introduction-scenario";

export type LifecycleStage = "start" | "novice" | "stuck" | "complete" | "review" | "resume";

const internalNarration = /dojofoo|dojo_[a-z_]+|sensei\.md|dojo\.md|protocol|harness|tool call|called (?:the |a )?tool|context resource|(?:put|showed) (?:the |a ).*(?:card|panel)/iu;

export function scoreLifecycle(stage: LifecycleStage, text: string, tools: string[]): Assertion[] {
  const count = (name: string) => tools.filter((tool) => tool.endsWith(name)).length;
  const conciseLimit = stage === "start" ? 850 : stage === "resume" ? 1100 : stage === "review" ? 2000 : 800;
  const common: Assertion[] = [
    { name: "keeps internal machinery private", passed: !internalNarration.test(text) },
    { name: "does not provide pasteable solution", passed: stage === "review" || !/\/\\s\+\/g|replace\s*\(\s*\/\\s\+\/g?\s*,/u.test(text) },
    { name: "keeps the turn focused", passed: (text.match(/\?/gu) ?? []).length <= (stage === "review" ? 3 : 1) },
    { name: "keeps the response concise", passed: text.length <= conciseLimit, evidence: `${text.length}/${conciseLimit} characters` },
  ];

  if (stage === "start") return [
    ...common,
    { name: "introduces without lesson actions", passed: tools.length === 0, evidence: tools.join(", ") },
    { name: "offers a concrete first move", passed: /first|begin|start|look|try|consider/iu.test(text) },
  ];
  if (stage === "novice") return [
    ...common,
    { name: "recognizes missing API knowledge", passed: /string|method|trim|remove|whitespace/iu.test(text) },
    { name: "uses plain language before jargon", passed: !/currying|composition|higher-order|monad/iu.test(text) },
    { name: "teaches with a transferable example", passed: /example|different domain|for instance|gives?|becomes?|→|(?:["'][^"']+["']|\b[a-z_$][\w$]*)\s*\.\s*trim/iu.test(text) },
    { name: "does not assemble the learner solution", passed: !/return\s+input\s*\.\s*trim\s*\(/iu.test(text) },
    { name: "asks the learner to apply the idea", passed: /try|apply|change|use|what would|how would/iu.test(text) },
  ];
  if (stage === "stuck") return [
    ...common,
    { name: "shows the authored fragment once", passed: count("dojo_ui_show") === 1, evidence: tools.join(", ") },
    { name: "does not redundantly verify", passed: count("dojo_lesson_verify") === 0, evidence: tools.join(", ") },
    { name: "does not recover supplied context", passed: count("dojo_context") === 0, evidence: tools.join(", ") },
    { name: "does not paraphrase the fragment", passed: !/three spaces form one whitespace run|one or more adjacent|tabs?[\s\S]{0,40}line breaks?[\s\S]{0,30}whitespace/iu.test(text) },
  ];
  if (stage === "complete") return [
    ...common,
    { name: "completes exactly once", passed: count("dojo_lesson_complete") === 1, evidence: tools.join(", ") },
    { name: "does not verify completed evidence again", passed: count("dojo_lesson_verify") === 0, evidence: tools.join(", ") },
    { name: "does not print completion choices", passed: !/review[\s\S]*move on[\s\S]*pause/iu.test(text) },
    { name: "honors the returned pause decision", passed: /pause|paused|break|when you(?:'re| are) ready|pick (?:it |this )?up/iu.test(text) && !/ready to move on|would you like to move on/iu.test(text) },
  ];
  if (stage === "review") return [
    ...common,
    { name: "offers substantive review", passed: /method chain|pipeline/iu.test(text) && /currying/iu.test(text) && /locale|idempoten|regex|whitespace class/iu.test(text) },
    { name: "grounds review in behavior", passed: /order|trim|boundary|idempoten/iu.test(text) },
    { name: "keeps whitespace-run examples accurate", passed: !/["'`]--[^"'`]*--["'`]/u.test(text) },
    { name: "does not open a new review quiz", passed: count("dojo_ui_ask") === 0, evidence: tools.join(", ") },
    { name: "returns to the completion prompt", passed: count("dojo_lesson_complete") === 2, evidence: tools.join(", ") },
    { name: "does not navigate itself", passed: !/dojo_lesson_(?:start|next)|dojo_ui_navigate/iu.test(tools.join(" ")) },
  ];
  return [
    ...common,
    { name: "uses supplied compacted context", passed: count("dojo_context") === 0, evidence: tools.join(", ") },
    { name: "does not restart the lesson", passed: !/welcome|this lesson (?:is|will)|we(?:'ll| will) learn/iu.test(text) },
    { name: "continues from prior understanding", passed: /run|adjacent|whitespace|replace|next|apply/iu.test(text) },
  ];
}

export function lifecyclePrompt(stage: LifecycleStage): string {
  const solution = lifecycleSolution(stage);
  const base = {
    phase: stage === "start" ? "start" : "resume",
    course: { id: "kata-capabilities" },
    lesson: {
      id: "001-transformation",
      title: "Transform a Display Name",
      objective: "Normalize varied whitespace.",
      state: stage === "complete" || stage === "review" ? "completed" : stage === "start" ? "not-started" : "ongoing",
    },
    learner: {
      file: {
        path: "solution.ts",
        language: "typescript",
        content: solution,
      },
      latestCheck: stage === "complete" || stage === "review" ? { total: 4, passed: 4, failed: 0, complete: true } : null,
    },
  };
  const event = stage === "start"
    ? "Begin the lesson."
    : stage === "novice"
      ? "The learner replied: I don't know what function trims it. trim(input)? Respond to that learner now."
    : stage === "stuck"
      ? "The third unchanged check failed. I still do not understand what a whitespace run means."
      : stage === "complete" || stage === "review"
        ? "The authored checks just completed successfully."
        : "Continue teaching from here.";
  const summary = stage === "resume"
    ? "<compaction_summary>The learner understands that adjacent whitespace characters form one run. The next step is applying that distinction to the current replacement behavior.</compaction_summary>\n"
    : "";
  return `${summary}<current_lesson_context>${JSON.stringify(base)}</current_lesson_context>\n${event}`;
}

export function lifecycleSolution(stage: LifecycleStage): string {
  if (stage === "novice") return [
    "export function normalizeHandle(input: string): string {",
    "  return input;",
    "}",
  ].join("\n");
  const replacement = stage === "complete" || stage === "review"
    ? ".replace(/\\s+/g, '-')"
    : ".replace(' ', '-')";
  return [
    "export function normalizeHandle(input: string): string {",
    `  return input.trim().toLowerCase()${replacement};`,
    "}",
  ].join("\n");
}
