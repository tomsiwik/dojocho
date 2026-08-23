import { execFileSync } from "node:child_process";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const root = process.env.DOJO_PROJECT_ROOT;
const cli = process.env.DOJO_CLI;
if (!root || !cli) throw new Error("DOJO_PROJECT_ROOT and DOJO_CLI are required");

const server = new McpServer({ name: "dojofoo-lesson", version: "0.1.0" });

server.registerTool("check_lesson", {
  description: "Run the current lesson's machine-readable checks and return the structured test report.",
  inputSchema: {},
}, async () => {
  try {
    const output = execFileSync(process.execPath, [cli, "kata", "--check", "--reporter=json"], {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, DOJO_PROJECT_ROOT: root, DOJO_SKIP_PREPARE: "1" },
      timeout: 90_000,
    });
    const report = JSON.parse(output) as Record<string, unknown>;
    return { content: [{ type: "text", text: output }], structuredContent: report };
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    return { content: [{ type: "text", text: message }], isError: true };
  }
});

server.registerTool("complete_lesson", {
  description: "Ask the learner whether to review the completed lesson, move on, or pause.",
  inputSchema: {},
}, async () => {
  const coordinator = process.env.DOJOFOO_COORDINATOR_URL;
  const capability = process.env.DOJOFOO_RUN_CAPABILITY;
  if (!coordinator || !capability) throw new Error("The lesson run coordinator is unavailable");
  const response = await fetch(new URL("/api/run-command", coordinator), {
    method: "POST",
    headers: { authorization: `Bearer ${capability}`, "content-type": "application/json" },
    body: JSON.stringify({
      method: "run.ask",
      params: {
        title: "What would you like to do next?",
        options: ["Review", "Move on", "Pause"].map((choice) => ({ id: choice, title: choice })),
      },
    }),
  });
  const result = await response.json() as { answers?: Record<string, string[]>; error?: string };
  if (!response.ok || !result.answers) throw new Error(result.error ?? "The learner could not answer the prompt");
  const decision = Object.values(result.answers).flat()[0];
  return {
    content: [{ type: "text", text: decision ?? "No choice was made." }],
    structuredContent: { decision },
  };
});

await server.connect(new StdioServerTransport());
