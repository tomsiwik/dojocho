import { createServer } from "node:http";
import { once } from "node:events";

/** Deterministic Responses endpoint; real harness/CLI, no external inference. */
export async function startLoopbackModel({ toolRequest } = {}) {
  const requests = [];
  const requestedTools = [];
  const server = createServer(async (request, response) => {
    let body = "";
    for await (const chunk of request) body += chunk;
    if (request.method !== "POST") { response.writeHead(404); response.end(); return; }
    const input = JSON.parse(body);
    requests.push(input);
    const part = { type: "output_text", text: "Ready to teach.", annotations: [] };
    const item = { id: `msg_${requests.length}`, type: "message", role: "assistant", status: "completed", content: [part] };
    const result = { id: `resp_${requests.length}`, object: "response", created_at: 1, model: "gpt-4o", status: "completed", output: [item],
      usage: { input_tokens: 10, output_tokens: 5, total_tokens: 15, input_tokens_details: { cached_tokens: 0 }, output_tokens_details: { reasoning_tokens: 0 } } };
    if (!input.stream) { response.setHeader("Content-Type", "application/json"); response.end(JSON.stringify(result)); return; }
    response.writeHead(200, { "Content-Type": "text/event-stream" });
    let events = [
      { type: "response.created", response: { ...result, status: "in_progress", output: [] } },
      { type: "response.output_item.added", output_index: 0, item: { ...item, status: "in_progress", content: [] } },
      { type: "response.content_part.added", item_id: item.id, output_index: 0, content_index: 0, part: { ...part, text: "" } },
      { type: "response.output_text.delta", item_id: item.id, output_index: 0, content_index: 0, delta: part.text },
      { type: "response.output_text.done", item_id: item.id, output_index: 0, content_index: 0, text: part.text },
      { type: "response.content_part.done", item_id: item.id, output_index: 0, content_index: 0, part },
      { type: "response.output_item.done", output_index: 0, item },
      { type: "response.completed", response: result },
    ];
    const contextTool = toolRequest && input.tools?.find(tool => tool.name?.endsWith(toolRequest.name));
    if (contextTool && requestedTools.length === 0) {
      requestedTools.push(contextTool.name);
      const call = { id: "fc_lesson", call_id: "call_lesson", type: "function_call", name: contextTool.name, arguments: JSON.stringify(toolRequest.input), status: "completed" };
      events = [
        { type: "response.created", response: { ...result, status: "in_progress", output: [] } },
        { type: "response.output_item.added", output_index: 0, item: { ...call, arguments: "", status: "in_progress" } },
        { type: "response.function_call_arguments.delta", item_id: call.id, output_index: 0, delta: call.arguments },
        { type: "response.function_call_arguments.done", item_id: call.id, output_index: 0, arguments: call.arguments },
        { type: "response.output_item.done", output_index: 0, item: call },
        { type: "response.completed", response: { ...result, output: [call] } },
      ];
    }
    for (const [sequence_number, event] of events.entries()) response.write(`event: ${event.type}\ndata: ${JSON.stringify({ ...event, sequence_number })}\n\n`);
    response.end();
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  return { requests, requestedTools, baseURL: `http://127.0.0.1:${server.address().port}/v1`,
    close: () => new Promise((resolve, reject) => { server.close(error => error ? reject(error) : resolve()); server.closeAllConnections(); }),
  };
}
