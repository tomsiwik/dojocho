# Learning Reviewer & Telemetry

- **Epic:** 0300
- **Status:** Draft
- **Date:** 2026-07-05
- **Owner:** dojocho core

## Problem & Opportunity

Dojocho already produces rich learning artifacts — session cassettes, a per-dojo journal, and progress state — but nothing reads them. Learners get no picture of how they are actually progressing beyond a `[x]` checklist in `dojo kata --list`. Dojo authors get zero signal about which katas confuse people, which Test Map rows never get used, or which hints are too strong. Most critically, the sensei itself is unaudited: the entire product promise is "the agent never types for you" (dojos/effect-ts/DOJO.md: "**Never give solutions.**"), yet nothing verifies that any of the five supported agents (claude/codex/gemini/opencode/pi) actually honors the Socratic protocol in real sessions. A single leaked solution silently destroys the learning value and we would never know.

The opportunity is a closed loop: cassettes → analysis → findings → concrete course patches → better cassettes. Every learner session becomes fuel that improves the courses for the next learner. Static kata packs are easy to copy; a corpus of real teaching transcripts plus an automated pipeline that continuously sharpens hints, Test Maps, and prerequisites from them is a compounding moat. It also produces the first objective benchmark of "which agent/model teaches best," which is marketing-grade content no competitor can fake without the same telemetry.

## Goals

1. Give learners a `dojo review` view of their own progress: time-per-kata, struggle points, concepts mastered vs. wobbly, and personalized review recommendations.
2. Audit instructor quality per session: solution leakage, Socratic-protocol adherence, Test Map usage, hint calibration, verbatim `<dojo:sensei>` disclosure.
3. Benchmark instructor quality across agents and models using the existing e2e docker + proxy harness.
4. Turn findings into machine-applicable course patches (hint edits, Test Map fixes, prerequisite reordering) and prompt/protocol improvements, routed through the 0400 authoring toolkit for validation.
5. Fix the cassette format so it is a stable, versioned analysis substrate.

## Non-goals

- Building the dashboard UI (epic 0100 renders what this epic computes).
- Regenerating or distilling course content wholesale (epic 0200 consumes our findings).
- Hosting a cassette-collection service or handling uploaded corpora at scale (epic 0500).
- Real-time, in-session intervention (e.g. blocking the agent mid-reply when it starts leaking a solution). Analysis is post-hoc in this epic.
- Grading the learner's code quality; test results already do that.

## Users & Personas

| Persona | Need |
|---|---|
| **Learner** | "Where am I weak? What should I revisit before moving on? How long did kata 007 really take me?" Wants insight, not surveillance — everything stays local unless voluntarily shared. |
| **Dojo author** | "Which of my katas cause the most repeated failing checks? Which Common Pitfalls never fire? Which Test Map rows are wrong?" Wants concrete, reviewable patches against their SENSEI.md/dojo.json. |
| **Sensei-agent (the LLM)** | Indirect user: receives improved teaching material, sharper Test Maps, and refined `<dojo:prompt>` protocol text produced by the pipeline. |
| **Dojocho maintainers** | "Does claude teach better than codex on effect-ts? Did the last protocol change reduce solution leaks?" Wants regression-style benchmark numbers per agent/model/CLI version. |

## Current State

What exists today (all paths real):

- **Cassette recording** — `packages/cli/src/tracking.ts` detects the active agent via env vars, locates its session log (`~/.claude/projects`, `~/.codex/sessions`, `~/.pi/agent/sessions`, etc.), and normalizes it into entries of shape `{role: "user"|"assistant"|"toolResult", content: string | object[]}` written to `.dojo/cassettes/<yyyymmddhhmm>-<sessionId>.jsonl`.
- **Format wart:** despite the `.jsonl` extension, `recordCassette` writes a pretty-printed **JSON array** (`JSON.stringify(cassette, null, 2)`), and `normalizeSessionLog` even special-cases re-reading files that start with `[`. One of the first deliverables is cassette schema v2: true JSONL, one entry per line, plus a header record.
- **`dojo track`** — `packages/cli/src/commands/track.ts` supports `--source <path>` and `--list`, and already prints "Submission is voluntary; review the cassette before sharing" (hook for 0500).
- **Auto-refresh** — `refreshCassette(root)` is called best-effort (errors swallowed) from `start`, `check`, and `change` in `packages/cli/src/commands/kata.ts`.
- **Progress state** — `.dojorc` via `packages/config/src/index.ts` (`DojoRc`/`KataProgress`: `completed[]`, `lastActive`, `kataIntros[]`). Note: no timestamps anywhere — completion time cannot currently be computed from `.dojorc` alone.
- **Journal** — `packages/cli/src/journal.ts` appends `dojo kata --note` observations to `.dojos/<dojo>/JOURNAL.md`; `emitLearnings` in kata.ts feeds it back as `<dojo:learnings>`. The claude `/kata` template (`packages/cli/src/commands/setup.ts`, `DEFAULT_KATA_MD_CLAUDE`) instructs the agent to record 1–3 observations per session — an existing, noisy-but-real learner-model signal.
- **Test results** — `packages/cli/src/runner.ts` parses vitest JSON into per-test `{title, status, failureMessages}`, which joins directly against SENSEI.md Test Map rows (test title → concept), e.g. `dojos/effect-ts/katas/007-tagged-errors/SENSEI.md` with its Test Map, Socratic prompts, Common pitfalls, Insight/Bridge sections. Results are printed and discarded — never persisted.
- **Rubric source** — `dojos/*/DOJO.md` Teaching Rules ("Never give solutions", "SENSEI.md is the authority", concept-accuracy rules) are effectively a written rubric with no enforcement.
- **Benchmark substrate** — `e2e/` drives agents headlessly in docker: `e2e/agents-table.ts` (per-agent headless invocations), `e2e/container.ts` (`execScript` against the `dojocho-e2e` container), `e2e/proxy/index.mjs` (Hono proxy to Groq's OpenAI-compatible `/v1/responses`, making model choice a config knob).
- **Sample corpus** — one checked-in cassette at `cassettes/202605172132-019e375d-bfd1-7fb1-8ae5-8279d64449fd.jsonl` (a full setup + kata session).

## Proposed Solution & Architecture

Five layers, each shippable independently:

```
 cassettes + .dojorc + JOURNAL.md + test events
        │
        ▼
 ┌─────────────────┐   deterministic parse: sessions → kata episodes,
 │ 1. Cassette      │   dojo commands, test runs, timing
 │    pipeline      │
 └───────┬─────────┘
         │  episodes (schema v2)
   ┌─────┴─────────────┐
   ▼                   ▼
 ┌───────────┐   ┌───────────────┐
 │ 2. Learner │   │ 3. Instructor │  rubric checks (deterministic)
 │  metrics   │   │  reviewer     │  + LLM-judge (graded)
 └─────┬─────┘   └──────┬────────┘
       │                │
       │          ┌─────┴────────┐
       │          │ 4. Benchmark │  e2e proxy + scripted learner
       │          │   harness    │  personas, per agent/model
       │          └─────┬────────┘
       ▼                ▼
 ┌────────────────────────────┐
 │ 5. Improvement pipeline    │  findings → course patches +
 │    (dojo review --patches) │  protocol diffs → 0400 validation
 └────────────────────────────┘
```

**1. Cassette analysis pipeline.** A new `packages/cli/src/review/` module (or a `@dojocho/review` package) that ingests cassette v2 files and segments them into *kata episodes*: contiguous spans bounded by `dojo kata --start` / all-tests-green events, extracting per-episode timelines of user messages, sensei replies, tool calls, and `dojo kata --check` results. Deterministic, no LLM. This layer also owns migration of v1 array-style cassettes.

**2. Learner metrics model.** Joins episodes with the SENSEI.md Test Map: each failing test title maps to a concept, so repeated failures on the same concept across katas mark it "wobbly," first-try passes mark it "mastered." Adds wall-clock timing (from cassette entry timestamps — a v2 requirement), hint-request counts ("Help me" selections), and check-attempt counts. Output is a local `.dojo/metrics.json` snapshot plus a `dojo review` terminal report and `<dojo:sensei>`-wrapped review-recommendation output the agent can teach from. Epic 0100 renders the same JSON as dashboards.

**3. Instructor reviewer.** Two tiers. *Deterministic checks:* did the sensei paste `<dojo:sensei>` content verbatim (string containment against the kata's SENSEI.md)? Did it edit or read the workspace file before the student (violating the "Do NOT read … until the student runs /kata again" directive from `kataIntroDone`)? Did tool calls write solution code into the kata workspace? *LLM-judge tier:* an evaluator prompt built from DOJO.md Teaching Rules + the kata's SENSEI.md that grades each sensei turn on solution leakage (0–3 severity), Socratic form, Test Map grounding, and hint calibration (was the hint appropriate for attempt #N?). Judge outputs per-session scorecards to `.dojo/reviews/<cassette>.json`.

**4. Instructor benchmarking.** Reuse `e2e/container.ts` + `e2e/proxy` to run scripted "learner personas" (stuck-on-pitfall-1, silent-struggler, solution-begging learner who asks "just show me the code") against each agent from `e2e/agents-table.ts` and each model behind the proxy. Every run produces a cassette; the instructor reviewer scores it; results aggregate into an agent×model leaderboard and act as regression tests for protocol/prompt changes.

**5. Improvement pipeline.** Aggregated findings become *proposals*: structured patch candidates such as "pitfall #2 in `007-tagged-errors/SENSEI.md` fired in 9/12 struggling sessions but the hint resolved it only twice — strengthen hint," "kata 019 fails frequently on a concept introduced in 023 — add prerequisite," "Test Map row X never matches a real test title — title drifted." Proposals render as reviewable diffs against SENSEI.md / dojo.json / `/kata` command templates, are validated by the 0400 authoring toolkit, and feed epic 0200 course distillation as evidence. Human-in-the-loop by default; no auto-merge.

## Candidate Feature Breakdown

1. **0301 `cassette-schema-v2`** — Fix the `.jsonl`-but-JSON-array wart in `packages/cli/src/tracking.ts`: true line-delimited JSONL, a `{type:"header", schema:2, agent, sessionId, dojo, kata, cliVersion, startedAt}` first record, per-entry ISO timestamps, and explicit `dojoCommand` / `testRun` event entries emitted at `kata --start`/`--check` time so episodes and timing are computable. Ship a v1→v2 migrator and keep `normalizeSessionLog` reading both.

2. **0302 `episode-segmentation`** — Deterministic parser that turns a cassette stream into kata episodes (kata name, start/end, attempts, per-check test results joined to Test Map concepts, hint interactions, elapsed time). Pure functions with fixture cassettes per agent (claude/codex/pi/opencode/gemini normalizer outputs differ); this is the shared substrate for 0303–0306.

3. **0303 `learner-metrics-and-review`** — `dojo review` command: concept mastery ledger (mastered / wobbly / not-seen, derived from Test Map joins across episodes), time-per-kata, struggle hotspots, and spaced-review recommendations ("revisit catchTag before kata 012"). Writes `.dojo/metrics.json`, prints a human report, and exposes a `--sensei` mode that wraps recommendations in `<dojo:sensei>`/`<dojo:prompt>` so the agent can run a personalized review session. Also adds timestamps to `KataProgress` in `packages/config/src/index.ts`.

4. **0304 `instructor-rubric-checks`** — Deterministic sensei audit over episodes: verbatim `<dojo:sensei>` disclosure detection, workspace-write detection (sensei typed the solution), premature workspace reads, and solution-shaped code blocks in assistant turns matched against the kata's reference solution/test expectations. Zero-LLM, runs in CI against fixture cassettes, output is a per-session violations list with severity.

5. **0305 `llm-judge-scorecards`** — LLM-judge layer grading sensei turns on the DOJO.md rubric: Socratic form, leak severity, Test Map grounding, hint calibration vs. attempt count, concept accuracy (did it attribute `runSync` to the student?). Prompt built from DOJO.md + SENSEI.md of the kata under review; calibrated against a small human-labeled cassette set; judge model configurable and pinned per scorecard for reproducibility. Writes `.dojo/reviews/*.json`.

6. **0306 `instructor-benchmark-harness`** — Extend `e2e/` with scripted learner personas driven through `e2e/container.ts` against every agent row in `e2e/agents-table.ts`, with model selection via `e2e/proxy`. Each matrix cell produces a cassette scored by 0304+0305; emits an agent×model×dojo leaderboard artifact and a regression gate ("no new leak-severity-3 findings") for CI on protocol changes.

7. **0307 `improvement-proposals`** — Aggregation + patch generation: cross-session findings (pitfall efficacy, Test Map drift, prerequisite inversions, hint over/under-strength) become structured proposals rendered as concrete diffs against `dojos/*/katas/*/SENSEI.md`, `dojo.json`, and the `/kata` command templates in `packages/cli/src/commands/setup.ts`. Proposals carry their supporting evidence (episode IDs, counts) and are emitted for 0400 validation and 0200 distillation; `dojo review --patches` lists them, never auto-applies.

8. **0308 `privacy-and-consent`** — Redaction pass (secrets, absolute paths, non-kata file contents) applied before any cassette leaves the machine, a `dojo track --redact`/`--export` flow, an explicit consent record in the cassette header, and documentation of what is collected. Prerequisite for 0500's voluntary submission channel; local analysis (0302–0305) never requires it.

## CLI / Schema Surface Changes

- **New command `dojo review`** — flags: `(none)` learner report, `--instructor <cassette>` scorecard, `--patches` list improvement proposals, `--json` machine output for 0100, `--sensei` agent-consumable output.
- **`dojo track` additions** — `--redact`, `--export <path>`, `--migrate` (v1→v2 cassettes); `--list` shows schema version and episode count.
- **Cassette schema v2** — real JSONL, header record (schema, agent, sessionId, dojo/kata context, cliVersion, consent), `ts` on every entry, new roles/events: `dojoCommand`, `testRun` (persisted `TestRun` from `packages/cli/src/runner.ts`).
- **`KataProgress` extension** (`packages/config/src/index.ts`) — optional `startedAt`/`completedAt` per kata and `checkCount`; validated leniently for backward compatibility.
- **New local artifacts** — `.dojo/metrics.json` (learner model), `.dojo/reviews/*.json` (instructor scorecards), benchmark leaderboard artifact under `e2e/`.
- **New protocol tag (candidate)** — `<dojo:review>` for personalized review-session material, mirroring `<dojo:learnings>` in `packages/cli/src/format.ts`.

## Dependencies on Other Epics

- **0100 learning web-view** — renders `.dojo/metrics.json` and scorecards; we define the JSON contracts, 0100 consumes them.
- **0200 course distillation** — consumes 0307 proposals and aggregated findings as regeneration evidence.
- **0400 authoring toolkit** — all course patches from 0307 flow through its SENSEI.md/dojo.json validation before landing; Test Map machine-parsing rules should be shared with it.
- **0500 registry & community** — voluntary cassette submission (0308 consent + redaction is the gate) supplies the multi-learner corpus that makes 0307 statistically meaningful.

## Risks & Open Questions

- **Transcript privacy.** Cassettes contain everything the learner typed, including possibly secrets, unrelated repo content, and personal phrasing. Mitigation: local-first by default, 0308 redaction + explicit consent header before export; open question whether redaction can ever be reliable enough for automatic submission, or must stay review-before-share.
- **Judge reliability.** LLM-judge scores drift across models and prompt versions; "is this hint a leak?" is genuinely fuzzy (a type signature is allowed per DOJO.md, a near-complete snippet is not). Mitigation: deterministic tier (0304) carries the hard guarantees, judge is calibrated against human labels, judge model+prompt pinned per scorecard. Open question: target inter-rater agreement threshold before scores gate CI.
- **Goodhart / gaming.** If "fewer checks per kata" becomes a score, an aggressive sensei can leak solutions to look efficient; if "leak rate" dominates, it can become uselessly withholding. Metrics must be paired (progress *and* protocol adherence) and leak detection must not be optimizable by paraphrase alone. Learners might also game their own mastery ledger by re-running easy katas — recommendations should weight first encounters.
- **Cross-agent normalizer fragility.** Session log formats (`~/.claude/projects`, `~/.codex/sessions`, …) are undocumented and change with agent releases; `tracking.ts` already needs per-agent normalizers. Fixture-based tests per agent version are mandatory; expect ongoing maintenance.
- **Timing signal quality.** Wall-clock time-per-kata conflates thinking, breaks, and unrelated work. Treat time as a weak signal; prefer attempt counts and concept-failure joins.
- **Benchmark cost & flakiness.** Full agent×model×persona matrices are slow and paid; the e2e container timeout is ~110s per exec (`e2e/container.ts`). Start with a small pinned matrix as a regression gate, run the full matrix on demand.
- **Open question:** should instructor review run automatically after each session (piggybacking on `refreshCassette`) or only on `dojo review`? Auto-run gives coverage but adds LLM cost and latency to a flow that is currently deliberately best-effort and silent.

## Success Metrics

- **Adoption:** ≥40% of active learners run `dojo review` at least once a week within two months of release.
- **Cassette health:** ≥95% of sessions on supported agents produce a parseable v2 cassette with ≥1 segmentable episode.
- **Instructor quality:** solution-leak rate (severity ≥2) per benchmarked session measurably decreases release-over-release once the regression gate (0306) is active; zero severity-3 leaks in the pinned CI matrix.
- **Judge trust:** ≥85% agreement between LLM-judge leak classifications and a human-labeled holdout set before scores are surfaced to users.
- **Improvement loop throughput:** ≥10 proposal-driven course patches merged into `dojos/*` within the first quarter, each carrying cassette evidence; at least one measurable downstream effect (e.g. reduced repeat-failure rate on a patched kata's target concept).
- **Learner outcome proxy:** for katas patched via 0307, median check-attempts-to-green decreases against the pre-patch baseline.
