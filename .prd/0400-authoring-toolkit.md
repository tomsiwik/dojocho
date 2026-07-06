# Authoring Toolkit

- **Epic:** 0400
- **Status:** Draft
- **Date:** 2026-07-05
- **Owner:** dojocho core

## Problem & Opportunity

Dojocho's value lives in its content: katas that are solvable, tests that map to the SENSEI.md Test Map, stubs that fail until the learner does the work, and teaching material that the sensei-agent can trust. Today none of that is enforced by tooling. The only validation in the product is manifest shape-checking (`validateManifest` in `packages/config/src/index.ts`), which runs at install time in `packages/cli/src/commands/add.ts` — after the author has already shipped.

Everything deeper was invented ad hoc, per dojo:

- `dojos/build-llm/_validate.py` swaps each kata's `_ref.py` reference solution into `solution.py`, runs pytest via `uv run`, and restores the stub — proving every kata is solvable. It is Python-only, build-llm-only, and lives outside the CLI.
- `dojos/build-llm/_aggregate.py` renames kata dirs into `NNN-slug` order and regenerates `dojo.json` — hand-maintained chapter ordering baked into a script.
- `dojos/build-llm/_recover_refs.py` exists purely to repair a previous authoring accident (references consolidated into one syntactically broken file), which is itself evidence that the current workflow is fragile.
- `dojos/effect-ts` has no reference solutions or validation at all; its 40 katas and 24 `skills/effect-patterns-*` dirs were verified by hand.
- SENSEI.md structure (Briefing/Prerequisites/Skills/Test Map/Teaching Approach/On Completion) is a convention with no linter; a drifted Test Map silently degrades the sensei's hint quality because `kata --check` output titles no longer match the map.

Three other epics amplify the cost of this gap: 0200 (course distillation) will machine-generate dojos and needs a mechanical correctness gate; 0300 (learning reviewer) will emit course patches that must be re-validated; 0500 (registry & community) cannot accept third-party dojos without an objective quality bar. The authoring toolkit is the shared foundation: one `dojo create` / `dojo validate` / `dojo preview` surface that both humans and pipelines target.

## Goals

- Scaffold a new dojo and new katas in seconds with `dojo create`, producing manifest, SENSEI.md skeleton, stub, test, and reference solution that already pass `dojo validate`.
- Formalize the reference-solution convention (build-llm's `_ref.py`) across languages and both runner adapters, and keep references invisible to learners.
- Ship a validation suite (`dojo validate`) covering schema, structural, consistency, and executable checks — including "ref solution passes" and "stub does not pass".
- Make skills packaging (the `skills/` dirs symlinked by `symlinkDojo` in `add.ts`) a first-class, validated part of a dojo.
- Provide `dojo preview` — a dry-run of the learner/sensei experience against a local dojo source without polluting a real project.
- Emit machine-readable validation output so 0200 and 0300 can gate on it in CI, and 0500 can require it for publishing.

## Non-goals

- Authoring the *content* itself (pedagogy, prose) — that is 0200's job for machine distillation and the human author's job otherwise.
- A web-based authoring UI (belongs to 0100/0500 if ever).
- Registry publishing flow, signing, or moderation (0500).
- Changing the learner-facing runtime (`kata.ts`, `runner.ts`) beyond what preview and ref-solution hiding require.
- Grading or telemetry of learner sessions (0300).

## Users & Personas

- **Human dojo author** — writes katas for a stack they know. Wants scaffolding that encodes the conventions (kata dir anatomy, SENSEI.md sections, Test Map format) so they don't reverse-engineer them from `dojos/effect-ts`, and a validator that tells them exactly what is broken before they publish.
- **Pipeline author (0200 distillation)** — a machine emitting dozens of katas from source material. Needs deterministic scaffolding primitives, a strict validator with JSON output and stable rule IDs to retry against, and no interactive prompts.
- **Learner** — never runs these commands, but benefits indirectly: every installed kata is guaranteed solvable, stubs genuinely fail, Test Maps match test titles. Must never be able to see reference solutions (spoilers), including via their agent.
- **Sensei-agent** — consumes SENSEI.md through `dojo kata` / `dojo status` XML framing. Depends on the Test Map being accurate to translate failing test titles into hints, and on Skills sections referencing skills that actually shipped.

## Current State

- **Manifest validation**: `packages/config/src/index.ts` — `validateManifest`/`parseManifest` check required fields (`name`, `version`, `description`, `test`, `katas[]`), optional `runner.adapter` (`vitest` | `exit-code`), and optional per-kata `name`/`description`/`difficulty` (1–3)/`tags`/`prerequisites`. The optional pedagogy fields exist in the schema but no shipped dojo uses them (`dojos/build-llm/dojo.json` and `dojos/effect-ts/dojo.json` carry `template` only).
- **JSON Schemas**: published at `apps/web/public/schema/v1/dojo.json` and `registry.json`; dojo.json manifests reference `https://dojocho.ai/schema/v1/dojo.json` via `$schema`.
- **Install pipeline**: `packages/cli/src/commands/add.ts` — classifies source (local path / npm / registry / tarball URL), packs via the source's package manager, safe-extracts, installs deps, moves into `.dojos/<name>`, wires tsconfig paths, symlinks `commands/*.md` and `skills/*` dirs into agent dirs (`symlinkDojo`), and runs `prepare.sh` (`runLifecycleScript`; used by `dojos/pydantic-agents/prepare.sh` and `dojos/build-llm/prepare.sh` for `uv sync`).
- **Runner**: `packages/cli/src/runner.ts` — `vitest` adapter (JSON reporter, per-test titles) and `exit-code` adapter (single pass/fail). `runTests` substitutes `{template}` in the manifest's `test` command.
- **Kata anatomy**: `katas/NNN-slug/{SENSEI.md, solution.ts|py, solution.test.ts|test_solution.py}`. Test path derivation is convention-bound: `resolveKata` in `packages/config/src/index.ts` computes `testPath` as `<stem>.test<ext>` next to the template (Python dojos override per-kata behavior through the `test` command template instead).
- **SENSEI.md anatomy** (convention only): Briefing (Goal/Tasks/Hints), Prerequisites, Skills and/or References, Test Map table (vitest dojos, e.g. `dojos/effect-ts/katas/001-hello-effect/SENSEI.md`), Teaching Approach (Socratic prompts, Common pitfalls), On Completion (Insight, Bridge).
- **Reference solutions**: only `dojos/build-llm` has them, as `_ref.py` beside each stub, exercised by `dojos/build-llm/_validate.py` (swap-in, pytest, restore). Nothing hides them from learners today beyond the blanket `.dojos/**` read-deny.
- **Learner shielding**: `CLAUDE_SETTINGS` in `packages/cli/src/commands/setup.ts` denies `Read/Glob/Grep(.dojos/**)` for Claude Code — the only agent with settings support (`hasSettings: true` in `AGENTS`). Other agents (opencode/codex/gemini/pi) have no equivalent deny mechanism wired.
- **Skills**: `dojos/effect-ts/skills/` ships 24 `effect-patterns-*` dirs, each a `SKILL.md` with YAML frontmatter (`name`, `description`); SENSEI.md files reference them by name ("Invoke `effect-patterns-getting-started` before teaching this kata"). No check that referenced skills exist.
- **Registry**: `apps/web/public/r/index.json` + `apps/web/public/r/effect-ts.json` (`RegistryItem`: npm or tarball source), consumed by `addFromRegistry` in `add.ts`.

## Proposed Solution & Architecture Sketch

New workspace package `packages/authoring` (imported by the CLI) holding scaffold templates, the rule engine, and preview orchestration, so 0200 can also consume it programmatically without shelling out.

### `dojo create`

```
dojo create dojo <name> [--runner vitest|exit-code] [--lang ts|py] [--test-command "..."]
dojo create kata <slug> [--after <kata>] [--difficulty 1-3] [--tags a,b]
dojo create skill <name>
```

- `create dojo` scaffolds: `dojo.json` (with `$schema`), `DOJO.md`, `package.json`/`pyproject.toml`, `tsconfig.json` + `vitest.config.ts` (ts) or `conftest.py` + `prepare.sh`/`teardown.sh` (py), `katas/`, `skills/`, and one example kata that passes `dojo validate` out of the box.
- `create kata` computes the next `NNN` prefix (or renumbers with `--after`, absorbing `_aggregate.py`'s ordering job), writes `katas/NNN-slug/` with SENSEI.md skeleton (all required sections, placeholder Test Map), stub with a failing marker, test file, and reference solution stub, and appends the entry to `dojo.json` `katas[]`.
- All prompts have flag equivalents; `--json` and non-TTY detection make it pipeline-safe for 0200.

### `dojo validate`

```
dojo validate [path] [--kata <slug>] [--rules <ids>] [--fix] [--json] [--skip-exec]
```

Runs a rule catalog against a dojo source directory (default cwd). Exit non-zero on any error-severity finding. `--json` emits `{rule, severity, kata, file, message}` records for CI and for 0200/0300 retry loops. `--skip-exec` runs only static rules (fast pre-commit); full mode includes executable checks.

**Validation rules catalog (initial):**

| ID | Severity | Check |
|----|----------|-------|
| `manifest/schema` | error | `dojo.json` parses and passes `validateManifest` + JSON Schema |
| `manifest/templates-exist` | error | every `katas[].template` file exists |
| `manifest/ordering` | error | kata dirs follow `NNN-slug`, prefixes are unique and match manifest order |
| `manifest/prereq-refs` | error | `prerequisites[]` reference existing kata names, no cycles, no forward refs |
| `kata/anatomy` | error | each kata dir has SENSEI.md, stub, and test file per runner convention (`resolveKata` derivation) |
| `sensei/sections` | error | SENSEI.md contains required sections: Briefing (Goal/Tasks), Teaching Approach, On Completion (Insight/Bridge) |
| `sensei/test-map` | error (vitest) / warn (exit-code) | Test Map rows exactly match test titles extracted from the test file (vitest JSON `--reporter=json --run` list, or static `it("...")` parse) |
| `sensei/skill-refs` | error | every skill named in a Skills section exists in `skills/` |
| `sensei/bridge-target` | warn | Bridge references the actual next kata |
| `skills/frontmatter` | error | every `skills/*/SKILL.md` has `name` + `description` frontmatter; dir name matches `name` |
| `skills/orphans` | warn | shipped skills never referenced by any SENSEI.md |
| `exec/ref-passes` | error | reference solution swapped in → all tests pass (generalizes `_validate.py`) |
| `exec/stub-fails` | error | pristine stub → at least one test fails (a passing stub means the kata teaches nothing) |
| `exec/test-runs` | error | test command executes at all (deps installed, `{template}` substitution valid) |
| `pack/no-leaks` | error | `npm pack` dry-run of the dojo excludes reference solutions and authoring artifacts (`files` / `.npmignore` correct) — or, if references ship (see below), they live only under `references/` |
| `pack/lifecycle` | warn | `prepare.sh`/`teardown.sh` are executable and shellcheck-clean |

Executable checks reuse `runTests`/`RunnerAdapter` from `packages/cli/src/runner.ts`; the swap-in/restore is done in a temp copy of the kata dir (never mutating the author's tree, fixing `_validate.py`'s restore-on-crash fragility).

### Reference solution convention

- Canonical location: `katas/NNN-slug/_ref.<ext>` in the author's source tree (matches build-llm precedent; underscore prefix = authoring artifact).
- Optionally multiple files: `_ref/` dir mirroring the stub layout for multi-file katas (future-proofing; single file is v1).
- Packaging default: references are **stripped** from the published tarball (`pack/no-leaks`). A dojo may opt in to shipping them (`"references": "bundled"` in manifest) so 0300's reviewer can consult them at runtime — in which case they are relocated under `.dojos/<name>/references/**` at install time and covered by the read-deny (see CLI/schema section).

### `dojo preview`

```
dojo preview [path] [--kata <slug>] [--script "start,check,intro"]
```

Creates a throwaway sandbox (temp dir), runs `dojo setup` non-interactively + `dojo add <path>` into it, then replays the learner loop: scaffolds the kata, prints exactly what the sensei-agent would receive (`<dojo:sensei>`, `<dojo:prompt>`, `<dojo:status>` framing from `packages/cli/src/format.ts` and `kata.ts`), runs `--check` against the stub (should fail) and against the ref (should pass), and tears down. `--kata` limits to one kata; without it, previews the dojo intro flow. This gives authors the "what will my student's agent actually see" view without a second repo, and gives 0100's web view a data source for rendering course previews.

### Skills packaging

`create skill` scaffolds `skills/<name>/SKILL.md` with frontmatter; `validate` enforces frontmatter and reference integrity; `pack` rules ensure skills are included in `files`. No runtime change needed — `symlinkDojo` in `add.ts` already links `skills/*` dirs into agent dirs.

## Candidate Feature Breakdown

- **0401 `validate-core`** — `dojo validate` command skeleton in `packages/cli` plus new `packages/authoring` rule engine: rule registry with stable IDs, severities, `--json` reporter, path/`--kata`/`--rules` filtering, exit-code contract. Implements all static rules (`manifest/*`, `kata/anatomy`, `sensei/sections`, `skills/frontmatter`). This is the gate 0200/0300/0500 depend on, so it lands first.

- **0402 `test-map-consistency`** — the `sensei/test-map` rule: a SENSEI.md parser for the rigid anatomy (section extractor + Test Map table parser) and a test-title extractor (vitest `--reporter=json` listing for executable mode, static `it()`/`describe()` regex-AST fallback for `--skip-exec`; pytest node-id extraction for exit-code dojos as a warn-level check). Also `sensei/skill-refs` and `sensei/bridge-target`, since they share the parser.

- **0403 `ref-solutions`** — formalize the `_ref.<ext>` / `_ref/` convention: `exec/ref-passes` and `exec/stub-fails` rules running swap-in in a temp copy via the existing `RunnerAdapter`s; migration of `dojos/build-llm/_validate.py` (delete script, katas already conform) and authoring of `_ref.ts` files for `dojos/effect-ts` as the dogfood proof; manifest `references` field.

- **0404 `create-scaffolding`** — `dojo create dojo|kata|skill`: language/runner-aware templates, `NNN` numbering and `--after` renumbering (absorbing `_aggregate.py`), manifest mutation, non-interactive/`--json` mode. Acceptance: a freshly created dojo passes `dojo validate` with zero findings and installs cleanly via `dojo add ./`.

- **0405 `preview-dry-run`** — `dojo preview`: sandboxed setup+add+kata loop, rendering the exact agent-facing output (sensei/prompt/status framing), stub-fail + ref-pass smoke in one command, teardown. Reuses `kata.ts` flows rather than reimplementing them.

- **0406 `pack-and-leak-checks`** — `pack/no-leaks`, `pack/lifecycle`, and install-time relocation/read-deny hardening for bundled references: extend `CLAUDE_SETTINGS` deny handling in `setup.ts`, document the gap for non-Claude agents, and add a `dojo add` post-install assertion that no `_ref*` files landed outside `references/`.

- **0407 `ci-and-migration`** — turbo task `dojo validate --json` wired into the monorepo CI for `dojos/*`; migrate `dojos/build-llm` (retire `_aggregate.py`, `_validate.py`, `_recover_refs.py`), `dojos/effect-ts`, `dojos/pydantic-agents` to pass clean; publish rule documentation to `apps/web` docs so 0500 can point community authors at it.

## CLI / Schema Surface Changes

**New CLI commands** (routed via `packages/cli/src/commands/root.ts` / `index.ts`): `dojo create`, `dojo validate`, `dojo preview`. Author-facing only; no change to `/kata` learner flows.

**Manifest v2 fields** (additive; `apps/web/public/schema/v1/dojo.json` gains them as optional, so v1 consumers keep working — bump to `/schema/v2/dojo.json` only if a breaking change becomes necessary):

```json
{
  "references": "stripped" | "bundled",
  "katas": [
    {
      "template": "katas/001-x/solution.ts",
      "ref": "katas/001-x/_ref.ts",
      "skills": ["effect-patterns-getting-started"]
    }
  ],
  "skillsDir": "skills",
  "chapters": [{ "title": "...", "katas": ["001-x"] }]
}
```

- `ref` defaults by convention (`_ref.<template ext>` beside the template) — explicit only for exceptions.
- `chapters` captures what build-llm's `_aggregate.py` `ORDER` table encoded ad hoc; consumed by 0100's web view and `dojo kata --list` grouping.
- Existing-but-unused `difficulty`/`tags`/`prerequisites` become validated (rule `manifest/prereq-refs`) and are emitted by `create kata` flags, so 0200 populates them from day one.

**Reference-solution hiding contract**: learner installs place any bundled references under `.dojos/<name>/references/**`. Claude Code is already covered by the `Read/Glob/Grep(.dojos/**)` deny written by `setup.ts` (`CLAUDE_SETTINGS`); validation additionally guarantees references never appear in `katas/` workspace copies (only `template` is copied out by `scaffold` in `kata.ts`). For agents without settings-based denies, the fallback is `references: "stripped"` (the default) — the spoiler simply isn't on disk. `dojo kata --check` and future 0300 flows that need the ref read it through the CLI (which is allowed to touch `.dojos`), never through agent file tools.

**Programmatic API**: `packages/authoring` exports `validateDojo(path, opts): Finding[]` and `scaffoldKata(...)` for 0200's pipeline and 0300's patch re-validation, avoiding subprocess overhead.

## Dependencies on Other Epics

- **0200 course distillation** — hard consumer: its emitters must produce `create`-shaped output and its CI gate is `dojo validate --json`. 0400's rule IDs and JSON finding format are a contract 0200 retries against; coordinate before freezing.
- **0300 learning reviewer/telemetry** — course patches (SENSEI.md edits, new pitfalls) flow through `validateDojo` before merge; bundled-references mode exists largely for 0300's runtime review features.
- **0500 registry & community** — publishing precondition: registry submission requires a clean `dojo validate` run (and `pack/no-leaks` specifically, to keep spoilers out of `apps/web/public/r` distributed tarballs).
- **0100 learning web-view** — soft: consumes `chapters`, `difficulty`, `tags` metadata and potentially `dojo preview` output for course pages; no blocking dependency either direction.
- Depends on nothing external itself; builds directly on `packages/config` and `packages/cli/src/runner.ts`.

## Risks & Open Questions

- **Executable validation cost**: `exec/ref-passes` on build-llm is 114 pytest runs with torch — minutes in CI. Mitigations: per-kata caching keyed on content hash, `--kata` filtering, `--skip-exec` tiering. Open: do we cache in `.dojo/` or turbo's cache?
- **Test-title extraction for exit-code dojos**: pytest titles aren't surfaced by the `exit-code` adapter, so `sensei/test-map` can only warn there. Open: add a `pytest` runner adapter (JSON report plugin) so Python dojos get first-class Test Map validation — that's a runner change bleeding beyond this epic's non-goals.
- **Spoiler surface on non-Claude agents**: only Claude has settings-based deny (`hasSettings: true` in `setup.ts`). Bundled references are readable by opencode/codex/gemini/pi agents. Default-stripped mitigates; document loudly. Open: per-agent ignore mechanisms (e.g. `.geminiignore`) worth wiring?
- **SENSEI.md rigidity vs. authorial voice**: strict section linting may fight good teaching prose (build-llm and effect-ts already differ — References vs Skills, Test Map presence). Rules must define required vs optional sections precisely or authors will fight the linter. Open: is Test Map required for all vitest dojos, or only warn when absent?
- **Renumbering churn**: `create kata --after` renumbering rewrites dirs, manifest, prerequisite refs, and Bridge prose references. Bridge text can't be safely auto-rewritten — likely a warn from `sensei/bridge-target` plus manual fix. Accepted?
- **Schema versioning**: additive v1 vs new v2 endpoint. Additive is proposed; confirm no consumer does `additionalProperties: false` enforcement against fetched schema (the published schema currently sets `additionalProperties: false`, so it must be regenerated in lockstep).
- **Windows**: swap-in temp copies and symlink behavior untested on Windows; the CLI already uses symlinks heavily, so no new class of problem, but preview sandboxing should avoid symlinks where possible.

## Success Metrics

- `dojos/build-llm`, `dojos/effect-ts`, `dojos/pydantic-agents` all pass `dojo validate` in CI; `_aggregate.py`, `_validate.py`, `_recover_refs.py` deleted.
- 100% of katas in shipped dojos have a reference solution with `exec/ref-passes` and `exec/stub-fails` green (today: build-llm ~114/114 refs exist but unenforced; effect-ts 0/40).
- Zero Test Map ↔ test-title mismatches in shipped vitest dojos (baseline: unknown, unmeasured today).
- Time-to-first-valid-kata for a new author: under 10 minutes from `dojo create dojo` to a green `dojo validate` (measured via dogfooding a new sample dojo).
- 0200 pipeline integration: distilled courses gate on `validate --json` with zero manual correction passes for rule-catalog violations.
- Zero spoiler incidents: no reference solution readable via learner-agent file tools in default (`stripped`) mode, verified by an e2e test in `e2e/`.
