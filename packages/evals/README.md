# Dojofoo evaluations

This package runs teaching scenarios through AI SDK `HarnessAgent`. It is
separate from the production lesson server so prompt experiments cannot change
live behavior accidentally.

The first scenario assembles:

1. the internal `DOJOFOO.md` platform contract;
2. the starter course's `DOJO.md`;
3. lesson 002's `SENSEI.md`;
4. the generic Dojofoo skill;
5. a fresh in-memory lesson workspace.

Run it with:

```sh
pnpm --filter @dojofoo/evals eval:introduction
```

To run the same scenario through the locally authenticated OpenCode harness:

```sh
pnpm --filter @dojofoo/evals eval:introduction:opencode
```

The OpenCode runner creates and removes a disposable workspace and reuses the
local OpenCode provider login. It shares the scenario and assertions with the
HarnessAgent runner; only the execution adapter differs.

By default it runs a context ablation matrix: lesson only, lesson plus skill,
platform plus lesson and skill, course plus lesson and skill, and the complete
stack. Run one cell with `DOJOFOO_EVAL_VARIANT`, for example:

```sh
DOJOFOO_EVAL_VARIANT=lesson+skill pnpm --filter @dojofoo/evals eval:introduction:opencode
```

The official Pi harness resolves credentials from its own agent directory or
provider environment variables. It does not reuse a Codex or OpenCode login.
Use `DOJOFOO_EVAL_MODEL` to select a configured model, or
`DOJOFOO_EVAL_PI_AGENT_DIR` to point at an existing Pi agent configuration.

The result is JSON containing the visible response, semantic tool calls, and
deterministic assertions. Tool activity is recorded rather than treated as a
failure: whether reading or checking was pedagogically appropriate belongs to
the scenario's quality evaluation. Private reasoning and UI labels such as
“Worked” are not scored.

The kata capability scenario evaluates whether the teacher inspects the
learner's current solution, retrieves authoritative documentation, teaches the
missing API without editing the file or exposing the completed expression, and
keeps the response focused:

```sh
pnpm --filter @dojofoo/evals eval:transformation
```

The scenario uses the harness's normal file-reading and web-fetching tools.
Dojofoo contributes only the same lesson capabilities registered in production.

The lifecycle matrix evaluates fresh introduction, repeated failure requiring an
authored fragment, successful completion, and resume from server-supplied compacted
context:

```sh
pnpm --filter @dojofoo/evals eval:lifecycle
```

Use `DOJOFOO_EVAL_STAGE=start|stuck|complete|resume` to run one stage.
