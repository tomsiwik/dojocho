import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <main style={{ padding: "1.5rem", maxWidth: 720, margin: "0 auto" }}>
      <h1>dojo</h1>
      <p>
        Web UI placeholder. The A2A server is wired at{" "}
        <code>/api/a2a/jsonrpc</code>; the agent card is at{" "}
        <code>/.well-known/agent-card.json</code>.
      </p>
      <p>Try:</p>
      <pre style={{ overflowX: "auto" }}>
        {`curl http://localhost:4567/.well-known/agent-card.json
curl -X POST http://localhost:4567/api/a2a/jsonrpc \\
  -H 'Content-Type: application/json' \\
  -d '{"jsonrpc":"2.0","id":1,"method":"message/send","params":{"message":{"messageId":"m1","role":"user","parts":[{"kind":"text","text":"hi"}]}}}'`}
      </pre>
    </main>
  );
}
