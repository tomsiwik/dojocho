import { HarnessAgent } from "@ai-sdk/harness/agent";
import { createPi } from "@ai-sdk/harness-pi";
import { createJustBashSandbox } from "@ai-sdk/sandbox-just-bash";
import { introductionScenario, printResult } from "./introduction-scenario";

const scenario = await introductionScenario();

const agent = new HarnessAgent({
  id: "dojofoo-introduction-eval",
  harness: createPi({
    thinkingLevel: "medium",
    ...(process.env.DOJOFOO_EVAL_MODEL ? { model: process.env.DOJOFOO_EVAL_MODEL } : {}),
    ...(process.env.DOJOFOO_EVAL_PI_AGENT_DIR ? { agentDir: process.env.DOJOFOO_EVAL_PI_AGENT_DIR } : {}),
  }),
  instructions: scenario.instructions,
  sandbox: createJustBashSandbox({ cwd: "/lesson" }),
  skills: [{
    name: "dojofoo",
    description: "Use Dojofoo's lesson-scoped teaching capabilities.",
    content: scenario.skill,
  }],
  sandboxConfig: {
    workDir: "lesson",
    onSession: async ({ session, sessionWorkDir }) => {
      await session.writeTextFile({
        path: `${sessionWorkDir}/solution.ts`,
        content: scenario.solution,
      });
    },
  },
});

try {
  const session = await agent.createSession();
  try {
    const result = await agent.generate({
      session,
      prompt: scenario.prompt,
    });
    const text = result.text.trim();
    const toolNames = result.steps.flatMap((step) => step.toolCalls.map((call) => call.toolName));
    printResult("pi", text, toolNames);
  } finally {
    await session.destroy();
  }
} catch (cause) {
  const message = cause instanceof Error ? cause.message : String(cause);
  process.stdout.write(`${JSON.stringify({
    scenario: "starter-kata/002/fresh-introduction",
    harness: "pi",
    status: "blocked",
    reason: message.replace(/(?:sk|key)-[A-Za-z0-9_-]+/gu, "[credential redacted]"),
  }, null, 2)}\n`);
  process.exitCode = 2;
}
