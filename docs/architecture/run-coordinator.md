# Run coordination

A Dojofoo run is the application boundary. Browser connections, ACP harness threads,
and local tool processes are replaceable attachments to that run; none of them owns
the run or becomes a second session model.

The server coordinates three protocol edges:

- ACP owns harness turns, transcript projection, cancellation, and elicitation when
  the harness supports it.
- MCP exposes lesson tools to every harness.
- HTTP/WebSocket deliver local run commands and browser events. A future CLI-only
  effect transport may use a Unix-domain socket without changing the coordinator.

Native harness thread IDs remain native. Dojofoo persists only their binding to the
run. Local tool processes receive an ephemeral capability, not a run or thread ID.
The capability is valid only while its harness runtime is attached and lets the
coordinator route a command to that run.

Structured questions prefer protocol-native elicitation. OpenCode currently rejects
elicitation initiated by an MCP server, so the `complete_lesson` MCP tool uses the
same coordinator as a compatibility adapter: it blocks while the existing ACP chat
question component collects an answer, then returns that answer as the MCP tool
result. This compatibility is isolated from browser routing and persistent state.

Dojofoo does not persist browser connections, pending questions, capabilities, or
transcript copies. A daemon restart discards unfinished interactions and reconstructs
the run from course progress plus the harness-thread binding.
