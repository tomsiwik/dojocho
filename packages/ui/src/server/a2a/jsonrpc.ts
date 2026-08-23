import type { Context } from "hono";
import { JsonRpcTransportHandler, ServerCallContext, UnauthenticatedUser } from "@a2a-js/sdk/server";
import type { A2ARequestHandler } from "@a2a-js/sdk/server";

// ServerCallContext signature (from sdk types):
//   constructor(requestedExtensions?: ExtensionURI[], user?: User)

/**
 * Hono POST handler for A2A JSON-RPC.
 *
 * Wraps `JsonRpcTransportHandler.handle()` from @a2a-js/sdk:
 *  - non-streaming methods (`message/send`, `tasks/get`, `tasks/cancel`,
 *    `tasks/pushNotificationConfig/*`, `agent/authenticatedExtendedCard`)
 *    return a single JSON response;
 *  - streaming methods (`message/stream`, `tasks/resubscribe`) return an
 *    AsyncGenerator that we serialize as Server-Sent Events.
 */
export function honoJsonRpcHandler(requestHandler: A2ARequestHandler) {
  const transport = new JsonRpcTransportHandler(requestHandler);

  return async (c: Context) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json(
        {
          jsonrpc: "2.0",
          id: null,
          error: { code: -32700, message: "Parse error" },
        },
        400,
      );
    }

    // ServerCallContext carries requested A2A extensions + a User.
    // v1: empty extension list, unauthenticated user.
    const ctx = new ServerCallContext([], new UnauthenticatedUser());

    const result = await transport.handle(body, ctx);

    if (Symbol.asyncIterator in (result as object)) {
      // Streaming method — emit SSE.
      const stream = result as AsyncGenerator<unknown, void, undefined>;
      const encoder = new TextEncoder();
      const sseStream = new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            for await (const event of stream) {
              const line = `data: ${JSON.stringify(event)}\n\n`;
              controller.enqueue(encoder.encode(line));
            }
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            const line = `event: error\ndata: ${JSON.stringify({ message })}\n\n`;
            controller.enqueue(encoder.encode(line));
          } finally {
            controller.close();
          }
        },
      });

      return new Response(sseStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // Single-response method.
    return c.json(result);
  };
}
