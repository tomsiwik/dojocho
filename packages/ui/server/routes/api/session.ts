import { defineWebSocketHandler } from "nitro";
import { checkLesson } from "../../../src/server/lesson/service";
import { resolveSessionWorkspace } from "../../../src/server/control/workspace";
import { error, notification, parseRequest, result, type JsonRpcId } from "../../../src/server/session/protocol";
import { SessionChannel, type SessionPeer } from "../../../src/server/session/delivery";

export default defineWebSocketHandler({
  upgrade(request) {
    const origin = request.headers.get("origin");
    if (origin && new URL(origin).host !== new URL(request.url).host) throw new Response("Forbidden", { status: 403 });
    if (!new URL(request.url).searchParams.get("session")) throw new Response("Session required", { status: 400 });
  },
  open(peer) {
    new SessionChannel(peer).send(notification("session.snapshot", {}));
  },
  async message(peer, message) {
    let requestId: JsonRpcId | null = null;
    try {
      const request = parseRequest(message.text());
      requestId = request.id ?? null;
      const channel = new SessionChannel(peer);

      if (request.method === "lesson.check") {
        const params = request.params as { courseId?: string; lessonId?: string };
        if (!params.courseId || !params.lessonId) throw new Error("A course and lesson are required");
        const root = resolveSessionWorkspace(channel.id);
        channel.emit(notification("lesson.check.started", {
          courseId: params.courseId,
          lessonId: params.lessonId,
        }));
        // Let the started notification reach the browser before the local test
        // process occupies this worker. The runner can become fully incremental
        // without changing the session protocol.
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
        const checked = await checkLesson(root, params.courseId, params.lessonId);
        for (const test of checked.observation.report.tests) {
          channel.emit(notification("lesson.check.test", { test }));
        }
        channel.emit(notification("lesson.check.completed", checked));
        if (request.id !== undefined) channel.send(result(request.id, checked.observation.report));
        return;
      }

      if (request.id !== undefined) channel.send(error(request.id, -32_601, `Unknown method: ${request.method}`));
    } catch (cause) {
      new SessionChannel(peer).send(error(requestId, -32_000, cause instanceof Error ? cause.message : "Session request failed"));
    }
  },
});
