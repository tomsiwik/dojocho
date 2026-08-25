import { appendFile } from "node:fs/promises";
import { lessonCapabilities, uiCapabilities } from "@dojofoo/protocol";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const callsFile = process.env.DOJOFOO_EVAL_CALLS;
if (!callsFile) throw new Error("DOJOFOO_EVAL_CALLS is required");
const callsPath = callsFile;

const server = new McpServer({ name: "dojofoo-eval", version: "0.0.1" });

async function record(name: string, input: unknown = {}): Promise<void> {
  await appendFile(callsPath, `${JSON.stringify({ name, input, at: Date.now() })}\n`);
}

server.registerTool(lessonCapabilities.check.tool, {
  description: lessonCapabilities.check.description,
  inputSchema: {},
}, async () => {
  await record(lessonCapabilities.check.tool);
  const report = { total: 4, passed: 0, failed: 4, unchanged: true };
  return { content: [{ type: "text", text: JSON.stringify(report) }], structuredContent: report };
});

server.registerTool(lessonCapabilities.context.tool, {
  description: lessonCapabilities.context.description,
  inputSchema: {},
}, async () => {
  await record(lessonCapabilities.context.tool);
  const context = {
    phase: "resume",
    course: { id: "kata-capabilities" },
    lesson: { id: "001-transformation", title: "Transform a Display Name", objective: "Normalize varied whitespace.", state: "ongoing" },
    learner: { file: { path: "solution.ts", language: "typescript", content: "" }, latestCheck: null },
  };
  return { content: [{ type: "text", text: JSON.stringify(context) }], structuredContent: context };
});

server.registerTool(uiCapabilities.ask.tool, {
  description: uiCapabilities.ask.description,
  inputSchema: {
    title: z.string(),
    options: z.array(z.object({ id: z.string(), title: z.string(), description: z.string().optional() })).min(2),
  },
}, async (input) => {
  await record(uiCapabilities.ask.tool, input);
  const answers = { decision: [input.options[0]!.id] };
  return { content: [{ type: "text", text: JSON.stringify(answers) }], structuredContent: { answers } };
});

server.registerTool(uiCapabilities.show.tool, {
  description: uiCapabilities.show.description,
  inputSchema: { fragmentId: z.string() },
}, async ({ fragmentId }) => {
  await record(uiCapabilities.show.tool, { fragmentId });
  return { content: [{ type: "text", text: fragmentId }], structuredContent: { fragmentId } };
});

server.registerTool(lessonCapabilities.complete.tool, {
  description: lessonCapabilities.complete.description,
  inputSchema: {},
}, async () => {
  await record(lessonCapabilities.complete.tool);
  return { content: [{ type: "text", text: "Pause" }], structuredContent: { decision: "Pause" } };
});

await server.connect(new StdioServerTransport());
