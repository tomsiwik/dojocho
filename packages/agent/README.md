# @dojofoo/agent

Eve plus an experimental model provider backed by the official AI SDK
HarnessAgent. No copied Eve source, custom execution backend, workflow runner
or per-adapter provider implementations. One opt-in Eve compaction hook is
maintained as a pinned, two-file dependency patch.

## Boundaries

| Module | Responsibility |
| --- | --- |
| `@dojofoo/agent` | Reexport Eve's root API unchanged |
| `/client`, `/react` | Reexport Eve's existing client integrations |
| `/harness` | Reexport the official HarnessAgent API unchanged |
| `/experimental` | Translate the AI SDK model contract to HarnessAgent |

The provider factory accepts the official adapter and runtime settings. Its
generic type preserves adapter-specific settings and the SDK's mutually exclusive
tool-filter options. There is no switch on Codex, Pi, OpenCode or other names.
Authored skill bundles, including companion files, use HarnessAgent's existing
`skills` option. System messages and host-tool declarations come from Eve's model
call; filesystem discovery and materialization remain outside this provider.
The packed-consumer type matrix covers all ten currently published adapters:
Claude Code, Cline, Codex, Cursor, Deep Agents, FX, GitHub Copilot, Grok Build,
OpenCode and Pi. This is **type compatibility**, not proof that every adapter's
capabilities work. Claude is not exercised at runtime. Unsupported behavior must
not be silently emulated.

Eve's existing ChatGPT model factory informed the boundary: supply a model through
the normal provider interface rather than replace Eve's execution engine. Unlike
that direct HTTP provider, this provider must coordinate a stateful local harness.

An authored Eve `agent.ts` assigns the returned `model` directly to
`defineAgent({ model, modelContextWindowTokens })`. Use the actual selected
model's context limit: Eve needs it to compile compaction settings when the model
is not in its gateway catalog. The packed-consumer tests verify public types and
Eve's compiler classification as an external provider, without gateway queries
or starting a harness at compile time. A disk-authored fixture additionally runs
Eve's discovery/compiler, loads its generated module map, and resolves the official
Pi-backed model through Eve's runtime resolver. It confirms repeated resolutions
reuse the model instance without network access. Deployed Workflow hosting and
real-provider inference through that full host remain separate verification gates.
An additional scripted-adapter test now boots Eve's actual Nitro development
server/local workflow world, loads authored instructions, isolates two HTTP
conversations, and restores the same native session after server shutdown/restart.

## Current status

The provider is experimental and supports function tools. User messages with
attachments pass through the official SDK unchanged; actual media support belongs
to the selected adapter. Native SDK checkpoint
handles travel in standard content-level provider metadata; the model instance
does not retain conversation state. Scripted-adapter tests cover concurrent
conversations and recovery in a fresh process, without a separate session store.

JSON response formats use the official AI SDK `Output.object` / `Output.json`
specifications. The requested schema, name and description reach HarnessAgent,
including external-tool continuations. The calling AI SDK owns output parsing
and validation; the provider does not inject JSON instructions into prompts.
Support for enforcing the format still depends on the selected adapter/model.

The scripted adapter also recovers a pending external tool call in a fresh
process and receives the student's answer exactly once.

The `src/local-sandbox.ts` implementation satisfies the official network
sandbox session contract using POSIX host processes. It preserves binary output,
absolute host paths, cancellation, and course files across teardown. Nine real
filesystem/process/bridge tests cover this boundary, including the official
bridge's rejection of absent/invalid tokens and authenticated protocol shutdown.
It is **not security isolation**. It is exported through `/experimental/local`
and used by the authored host fixtures. Bridge tokens are exercised by the
tests; the upstream bridge's `0.0.0.0` listener and live subscription inference
remain deployment/security considerations, not guarantees of this host runner.
The registry OpenCode 1.0.110 bootstrap and authenticated bridge start/stop now
pass in a separate temporary home with fixture-only authentication and a
pinned pnpm 10.34.5. `port: 0` uses the official OS-assigned-port capability.
The native CLI now completes a turn against a loopback Responses endpoint, then
stops and resumes its serialized checkpoint with the same session ID. A second
turn verifies that its model input includes the first exchange. Both direct
HarnessAgent calls and a newly constructed model provider pass this scenario;
the provider recovers solely from serialized AI SDK response messages. This uses no
paid inference and does not prove lesson completion. A third variant runs each
turn in a separate Node process: the first exits before the second starts, and
only the serialized response messages, workspace path and loopback model URL
are supplied to the next worker. Native history and session identity survive.
The same native runtime also passes through unmodified Eve's tool loop, both
for conversation and for an Eve-owned `lesson_context` tool. The model requests
the advertised tool, Eve executes it exactly once, and native model input receives
the result. Teardown waits for the whole owned POSIX process group, including
background descendants left behind after the bridge's parent process exits.
An Eve-owned `dojo_ui_ask` also passes through real OpenCode: `input.requested`
parks the turn, serialized Eve state accepts an `inputResponses` entry keyed by
its request ID, one `input.resolved` is emitted, and the native model receives
the author's answer exactly once. This verifies the runtime contract, not the
authoring frontend: its current empty-session/bootstrap and ACP answer APIs
still need replacement with Eve's create-with-first-message and request-ID flow.
The native `read` tool is also verified through Eve: OpenCode reads a real
course file, the model receives its contents, and Eve retains the native result
without executing the tool itself. Use official
`sandboxConfig: { workDir: "course" }` to select the course directory; the SDK
otherwise creates a separate per-session working directory. Canonicalize host
paths before passing them to native tools: macOS's `/var` and `/private/var`
aliases can otherwise trigger OpenCode's external-directory permission guard.
This is not proof of every native tool or every adapter's filesystem behavior.

The adapter requires explicit `provider: "openai"` for this fixture's credential
selection, in addition to `model: "openai/gpt-4o"` on HarnessAgent.
An explicit `environment` replaces inherited process variables; use that for
isolated tests so adapter skill installation cannot touch the user's home.

Provider-owned sandbox recovery requires a resumable sandbox and compatible
adapter. The SDK's `just-bash` provider does not support resume and is explicitly
rejected on a subsequent turn. Alternatively, pass the official `sandboxSession`
option as the factory's second argument: the caller retains the sandbox and owns
its cleanup. This supports warm continuation with an existing sandbox, not cold
recovery of an in-memory filesystem. Native OpenCode disk recovery is tested as
described above. Remaining integration gaps include pending native questions
after process termination, the broader native built-in tool set, and the full model-options
contract. Authoring integration is opt-in through `EVE_BASE_URL`; without it,
the existing frontend uses ACP. The Eve page flow is browser-tested with recorded
events, not yet through a live native harness end to end.

One verified parity gap: the SDK preserves the original model and instructions
through a suspended tool continuation. Changes take effect on the next user turn,
not the next Eve tool-loop step. Restarting the local process does not remove
this constraint because the settings are part of the continuation handle.

For session-aware Eve configuration, its existing
`defineDynamic({ events: { "step.started": async (_event, context) => ... } })`
API exposes `context.session.id`. The handler can select the harness/workspace and
return `{ model: experimental_createHarnessModel(runtime, sessionOptions).model,
modelContextWindowTokens }`. Return live provider objects at `step.started`,
not `session.started` or `turn.started` (those scopes serialize model IDs).
For adapters with package-relative bridge assets, retain their package boundary
using Eve's existing `build.externalDependencies` configuration. The hosted
OpenCode fixture externalizes `@ai-sdk/harness-opencode` and `@dojofoo/agent`;
bundling the adapter relocates `import.meta.url` without copying its bridge
assets. Keep native runtime state outside the authored source directory, so
database and journal writes do not trigger Eve's development watcher.
This does not override HarnessAgent's suspended-turn settings. Eve 0.53.0 loses
provider identity for dynamic live models and consequently assigns Gateway Exa
search to external providers. Our narrow dependency patch retains that identity
and uses it for web-search routing. Regression coverage includes external,
OpenAI, Anthropic, Google and Gateway selections; existing static routing stays
unchanged. No tools are silently discarded and no provider-specific session
registry is introduced.

Use the official `prepareCall` callback for dynamic selection; it is accepted
unchanged by this provider. Tests verify changing model, instructions and skills
between completed turns on one native session. A separate test verifies that
the callback is not invoked again during a suspended tool continuation.

The injected function can read a session-scoped selection without rebuilding
the provider:

```ts
const { model } = experimental_createHarnessModel({
  harness,
  sandbox,
  prepareCall: async input => ({
    ...input,
    model: await selections.readModel(sessionId),
  }),
});
```

`selections` belongs to the caller; it is not another provider-owned session
store. Changing it while a host tool is pending takes effect on the next fresh
prompt, including learner input queued behind that tool in the same provider
call. The existing continuation retains its original settings and native
session ID. This is the official `@ai-sdk/harness@1.0.108` contract, not a
provider restriction: `prepareCall` prepares fresh prompts, while
`resolveActiveTurnSettings` restores suspended-turn settings. No checkpoint
rewriting or adapter-specific model setter is used.

## Provider acceptance ledger

| Check | Status and evidence |
| --- | --- |
| Eve host tools | Pass: success/failure executes once, incremental native tool arguments stream before the call/result. |
| Human questions | Pass at tool-loop/SDK boundary: park, serialize, resume, answer once; existing Pi fixture also covers Eve questions. |
| Host tool approvals | Pass: Eve's approval policy requests input; restored state executes once on approval and never on denial. Tests seed Eve's real context container, not a deployed workflow host. |
| Native tool approvals | Pass: allow/deny reach official `continueStream`, including a separate Node-process recovery with the same session ID. |
| Attachments and JSON | Pass at adapter boundary: incoming file representations and structured output use SDK contracts. |
| Request headers | Per-call values override runtime defaults case-insensitively without mutation. HarnessAgent receives custom headers and rejects managed authentication/client headers; the AI SDK user-agent is omitted. |
| Unsupported options | Explicit warnings for sampling/token limits, non-default reasoning/tool choice, provider options and raw-chunk requests. Configure adapter-specific behavior through runtime settings. |
| Sources/generated files | Unsupported by the installed HarnessAgent adapter event union. Provider has standard output mappings, but no end-to-end capability is claimed. |
| Full workflow host | Conversation/isolation, pending-question recovery, persistent filesystem tools, root-copy and declared-specialist delegation with automatic parent wake-up pass through real Nitro and local workflow storage. Specialist instructions, tools, files and conversation are isolated. Real inference through that host remains unverified. |
| Authoring UI | Opt-in via `EVE_BASE_URL`, or `DOJO_EVE_ROOT` for automatic development-host startup. Bound to the startup workspace. Browser fixtures verify creation, reload/answer, failed-answer retry, read-only reconnect and unavailable-session errors. A real Pi/public-Eve-CLI browser test verifies automatic host startup, restored questions, one answer submission, the response and accepted selection after reload, without route mocks. Packaged CLI host startup remains pending. |

Approval checkpoints stay on their associated tool call because AI SDK does not
retain approval-request metadata. When HarnessAgent suppresses a resumed call's
replay, the provider includes that existing call ID beside its native result as
required by AI SDK's model-result contract. Neither case executes the tool again.

When restoring Eve's client, retain both `sessionId` and `streamIndex` from
`session.state`. `respond()` follows the saved cursor, unlike `send()` which
also filters by a new delivery ID. Attaching at cursor zero before responding
can return an old completed turn rather than the new answer. The full-host
test restores this documented client state and verifies one answer receipt
after restarting the server while a question is pending.

The full HTTP-host regression uses real OpenCode with loopback inference.
An Eve-authored question parks, the Eve host restarts, and its public client
restores the saved session/cursor and delivers the answer exactly once. The
following native turn retains the answer and original lesson instructions.
The coordinator owns native processes across Eve worker restarts and explicitly
reaps them at final shutdown; the test checks that none remain.
OpenCode's suspended-turn handle references its live bridge. Killing that native
process is not equivalent to restarting Eve or freezing a cloud sandbox:
pending-question recovery after native-process termination remains unsupported
by this local integration.

The internal `local-process-host.ts` now forwards the existing sandbox
`spawn` contract over [Comlink](https://github.com/GoogleChromeLabs/comlink)
and private Node message ports. The coordinator retains real process handles;
workers receive transferable streams and remote wait/kill controls. Tests
terminate the worker, confirm the native process survives, and then verify
explicit coordinator shutdown reaps it. Cancellation preserves the caller's
abort reason. No PID database or conversation registry is added.
The coordinator registers a process host once; Eve workers acquire a private
port using Node's thread messaging and inject the resulting `processHost` into
their local sandbox. All commands execute under the coordinator-owned sandbox's
environment. The full host test exercises this wiring without patching Eve's
worker startup or any harness adapter. The authoring application has not yet
adopted this integration.

The Node-only entry point is `@dojofoo/agent/experimental/local`. In the
coordinator, create a local sandbox and pass it to `registerLocalProcessHost`.
Supply its serializable `connection` to the authored agent configuration.
In the Eve worker, call `requestLocalProcessHost(connection)` and inject the
returned `processHost` into `createLocalSandbox`. Keep the coordinator alive
across Eve restarts and await `coordinator.close()` on final application shutdown.
The native package-consumer tests use these exports exclusively, including
separate-process history recovery; no implementation files are copied beside
the consumer. This API executes with host permissions and is not a security
sandbox.

For Pi, the package-consumer test also verifies the public `eve dev --no-ui`
hosting path: a complete CLI-process restart restores a pending question from
the native journal, accepts its answer once, and retains the lesson history.
The restored question is hydrated through the production authoring routes and
answered by the real TanStack `ChatClient` over its SSE adapter. Assertions cover
the AG-UI interrupt, accepted-answer metadata, one native tool receipt, and no
synthetic learner message. Only inference is mocked; Eve, Pi, the provider,
authoring routes, and TanStack's stream/interrupt handling execute normally.
The same scenario also runs through the actual authoring page in Chromium. Its
temporary Vite server uses `DOJO_EVE_ROOT` (the authored agent directory) and
`DOJO_PROJECT_ROOT` (the course directory), without `EVE_BASE_URL`. Requests are
not intercepted or mocked. The test clicks Review, observes the response,
reloads, and confirms the accepted choice and native history. It checks for
browser errors and unexpected POSTs, then closes the browser and servers.
Run just these public-CLI cases with
`node experiments/model-provider/run.mjs --cli-only` after building this package.
The authored application must declare `eve` directly in `package.json` for
Eve's project discovery, even when its source imports use `@dojofoo/agent`.
This test requires no private Eve server imports or process coordinator. It
does not establish the same cold-restart behavior for bridge-based adapters.

The authoring UI uses Eve when its server has `EVE_BASE_URL` configured;
otherwise the existing ACP path remains active. The CLI does not yet start an
Eve host automatically. There is no `--execution-backend` build mode.

For Vite development, set `DOJO_EVE_ROOT` to an existing Eve application.
`@dojofoo/agent/sveltekit` reexports Eve's public Vite plugin unchanged. The UI
uses it only in serve mode and runs it before Nitro initializes, so Eve's
resolved host URL reaches the API worker. Eve owns host discovery, locking and
startup; there is no Dojo-specific process registry or launcher. This does not
yet scaffold an Eve application or select the user's harness automatically.

## Native compaction

`patches/eve@0.53.0.patch` adds `experimental_compact` dispatch at Eve's existing
compaction entry point and a public capability type. Models without the method
follow the unchanged Eve path. This is an experimental Eve extension, not an
AI SDK standard. The patch is applied by this workspace's pnpm configuration;
installing the packed agent package alone does not patch a consumer's Eve.

The patch is shipped in this package and resolves through
`@dojofoo/agent/eve.patch`. Keep it in the consuming application's package-manager
patch configuration, pinned to Eve `0.53.0`. For pnpm, use `pnpm patch eve@0.53.0`,
apply the shipped patch in the resulting edit directory, then run
`pnpm patch-commit <edit-directory>` and commit the generated patch and lockfile.
The clean-consumer tests resolve and apply the packed artifact, never a file
from this repository. No postinstall hook mutates a consumer's dependencies.

The provider resumes the checkpoint, calls official `session.compact()`, stops
the session and returns its refreshed checkpoint plus any unsent trailing messages.
The native harness owns the summary and durable history; Eve sends no duplicate
summary prompt. No adapter code or opaque checkpoint data is rewritten.

Missing checkpoints and native failures are explicit errors. Compaction requested
during a suspended tool turn is deferred: its messages and checkpoint remain
unchanged so the result can be delivered exactly once. Eve retries compaction at
a later boundary, once the native turn has finished.
There is no silent fallback to a new session or Eve-generated summary. Unsupported
manual compaction remains unsupported. Use the harness model itself for compaction:
a separately configured summary model follows its own capabilities instead.
Arbitrary history edits/imports and in-flight compaction cancellation are not
covered by this extension. It does not establish full Eve parity.

## Verification

```sh
pnpm --filter @dojofoo/agent test
```

Type-checks/builds the provider, packs it, installs it with unmodified registry
dependencies in a temporary consumer, tests the unpatched baseline, then applies
the compaction and dynamic-provider-routing patch and reruns the tests. Native Pi compaction
uses a real journal with loopback inference. No paid models or local login state
are used.
See [the experiment gates](experiments/model-provider/README.md) for the remaining
requirements before production integration.
