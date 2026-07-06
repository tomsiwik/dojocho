# Course Distillation

- **Epic:** 0200
- **Status:** Draft
- **Date:** 2026-07-05
- **Owner:** dojocho core

---

## Problem & Opportunity

Dojocho's value scales with the number and quality of its dojos, but authoring one today is expert work. The flagship `dojos/build-llm` pack — 114 katas distilled from Raschka's two books — required a hand-orchestrated fleet of subagents, a bespoke ordering script (`dojos/build-llm/_aggregate.py`), a reference-swap validator (`dojos/build-llm/_validate.py`), and per-kata `_ref.py` reference solutions. That workflow proved the distillation concept but it lives as dev-only scripts inside a single dojo, and it only handles one modality: a book the author has already read and decomposed in their head.

Meanwhile the raw material for courses is everywhere and mostly unstructured:

- **Cassettes.** The new `dojo track` command (`packages/cli/src/commands/track.ts`, `packages/cli/src/tracking.ts`) already normalizes claude/codex/pi/opencode/gemini session logs into a uniform `{role, content}` JSONL format at `.dojo/cassettes/`. The command tells users "Submission is voluntary; review the cassette before sharing it to improve courses" — but nothing consumes cassettes yet. A real debugging session with an agent is a recorded curriculum: it contains the goal, the wrong turns, the diagnostic steps, and the fix, in order.
- **Talks and workshops.** Conference recordings ship with subtitles; `apps/ui/src/data/interviews.ts` already demonstrates VTT parsing (`node-webvtt`, speaker extraction, chapter markers) and `apps/ui/src/data/lessons.ts` models video lessons with duration/URL metadata.
- **Slide decks.** Every internal enablement session produces a PDF/PPTX that decays in a drive folder.

**The opportunity:** "point dojocho at a conference talk, a workshop recording, or your own agent session and get an installable dojo." This inverts dojocho's growth constraint. Instead of a handful of artisanal dojos, every recorded learning moment — community cassettes (epic 0500), a team's onboarding deck, a maintainer's YouTube walkthrough — becomes a candidate training pack. Dojocho stops being a catalog and becomes a compiler for experience.

## Goals

1. Ship a `dojo distill` pipeline that takes a source (cassette, slide deck, video+VTT, plain transcript) and emits a complete, installable dojo: `dojo.json`, ordered `katas/NNN-slug/` directories with `SENSEI.md`, solution templates, tests, and `_ref` reference solutions.
2. Every generated kata passes the reference-swap validation loop (stub fails tests, reference passes tests) before the dojo is considered emitted — generalizing `_validate.py` into a reusable stage.
3. Generated `SENSEI.md` files conform to the established anatomy (Briefing → Prerequisites → Skills → Test Map → Teaching Approach → On Completion) as exemplified by `dojos/effect-ts/katas/001-hello-effect/SENSEI.md`.
4. Support the runners the manifest schema already knows about (`vitest`, `exit-code` per `packages/config/src/index.ts`), covering at least TypeScript and Python targets.
5. Emit into the epic-0400 authoring format so a human author can review, edit, and re-validate before publishing via epic 0500.
6. Close the loop: consume epic-0300 cassette-analysis findings ("learners stall on kata 014's mask shape") to regenerate or patch weak katas.

## Non-goals

- Fully autonomous publishing. Distillation output is a **draft dojo**; a human (or the 0400 review flow) gates release.
- Video/audio understanding beyond transcripts. V1 requires subtitles/VTT or a transcript; speech-to-text and frame OCR are follow-ons.
- Hosting or streaming source media. We ingest files/URLs; we do not become a video platform (that is 0100's learning web-view concern at most).
- Replacing hand-authored dojos. `build-llm`-grade curricula will still outperform generated ones; distillation raises the floor, not the ceiling.
- General note-taking or summarization. If the output is not an installable dojo, it is out of scope.

## Users & personas

- **Learner.** Records their own agent session (`dojo track`), then runs `dojo distill` on the cassette to turn "that gnarly afternoon where we fixed the race condition" into a repeatable kata set for teammates — or for their future self. Also the downstream consumer of community-distilled dojos.
- **Dojo author.** A workshop presenter or educator who has a talk recording + slides and wants a dojo without spending the weeks that `build-llm` took. Uses distillation as a first draft, then the 0400 authoring toolkit to polish. Cares about pedagogical fidelity to their material and attribution.
- **Sensei-agent.** The coding agent (claude/codex/gemini/opencode/pi) that ultimately teaches from the generated `SENSEI.md`. It is a consumer with a strict contract: it needs an accurate Test Map, honest Common Pitfalls, and a working Insight/Bridge chain, because the protocol tags (`<dojo:sensei>`, `<dojo:prompt>`) render whatever the file says. A hallucinated pitfall poisons every session downstream. The sensei-agent is also the *executor* of distillation itself — the pipeline runs as agent tool-calls, not a hosted service.

## Current state

What exists in the repo today, by file:

- **Cassette recording (unlanded, on main working tree):** `packages/cli/src/tracking.ts` detects the active agent via env vars (`PI_CODING_AGENT`, `CODEX_THREAD_ID`, `CLAUDECODE`, `OPENCODE`, `GEMINI_CLI`), finds its session log under `~/.pi/agent/sessions`, `~/.codex/sessions`, `~/.claude/projects`, etc., and normalizes per-agent event shapes into `CassetteEntry = {role: "user"|"assistant"|"toolResult", content}` written to `.dojo/cassettes/<ts>-<sessionId>.jsonl`. `packages/cli/src/commands/track.ts` exposes `dojo track [--source <path>] [--list]`. `refreshCassette` is wired into the kata flow (`packages/cli/src/commands/kata.ts` imports it) so cassettes accumulate automatically. A real sample lives at `cassettes/202605172132-019e375d-bfd1-7fb1-8ae5-8279d64449fd.jsonl` — it captures a full install-and-learn session including tool calls and results. **No consumer of cassettes exists.**
- **Manifest schema:** `packages/config/src/index.ts` defines `DojoManifest` (`name`, `version`, `description`, `test` command template, `katas[]`, optional `runner.adapter: "vitest"|"exit-code"`) and `KataEntry` (`template`, optional `test`/`name`/`description`/`difficulty: 1|2|3`/`tags`/`prerequisites`), plus `validateManifest`/`parseManifest` and registry types (`RegistryItem`, `RegistryIndex`).
- **Authoring precedent:** `dojos/build-llm/_aggregate.py` (chapter-ordered slug list → numeric prefixes → consolidated `dojo.json`), `dojos/build-llm/_validate.py` (per-kata `_ref.py` swap-in, pytest via `uv run`, restore stub), `dojos/build-llm/_recover_refs.py`, and per-kata `_ref.py` files (e.g. `dojos/build-llm/katas/011-simplified-self-attention/_ref.py`). `dojos/build-llm/DOJO.md` codifies the teaching rules and a per-chapter pedagogical mix (Socratic / Use-Modify-Create / Parsons / drill).
- **SENSEI.md anatomy:** rigid section structure demonstrated across `dojos/effect-ts/katas/*/SENSEI.md` and `dojos/build-llm/katas/*/SENSEI.md`: Briefing (Goal/Tasks/Hints), Prerequisites, Skills, Test Map table (Test | Concept | Verifies), Teaching Approach (Socratic prompts, Common pitfalls), On Completion (Insight, Bridge). `dojos/effect-ts` additionally ships a `skills/` directory referenced from the Skills section.
- **Transcript/video plumbing:** `apps/ui/src/data/interviews.ts` parses VTT via `node-webvtt` (typed in `apps/ui/src/data/node-webvtt.d.ts`), extracting `{start, end, speaker, text}` cues plus `chapters: {start, title}[]`; `apps/ui/src/data/lessons.ts` models `Module`/`Lesson` with video metadata. These are the reference types for the transcript ingestion adapter.
- **Not present:** no `distill` command, no ingestion adapters, no concept-extraction or kata-synthesis code, no generalized validator outside `dojos/build-llm/_validate.py`.

## Proposed solution & architecture sketch

A five-stage pipeline, `dojo distill <source> [--out <dir>]`, executed by the sensei-agent with deterministic scaffolding in the CLI. LLM calls are marked ★; everything else is plain code.

```
source ──▶ [1 Ingest] ──▶ SourceDocument
                              │
                              ▼
          [2 Concept extraction ★] ──▶ ConceptGraph
                              │
                              ▼
          [3 Curriculum planning ★] ──▶ CoursePlan
                              │
                              ▼
          [4 Kata synthesis ★, per kata] ──▶ katas/NNN-slug/{SENSEI.md, solution.*, test, _ref.*}
                              │
                              ▼
          [5 Validation loop] ──▶ dojo.json + PASS/FAIL report
              │  fail → bounded re-synthesis (back to 4 with failure context)
              ▼
          .dojos-draft/<name>/  (0400 authoring format)
```

**Stage 1 — Ingestion adapters (deterministic).** One adapter per modality, all normalizing to a common `SourceDocument = { meta: {title, origin, license?, attribution?}, segments: Segment[] }` where `Segment = { kind: "utterance"|"toolCall"|"toolResult"|"slide"|"chapter"|"code", t?: number, speaker?: string, text: string, code?: string }`:

- `cassette`: reads the already-normalized `CassetteEntry[]` from `.dojo/cassettes/` (or `--source` path) — `role` maps to `speaker`, tool calls/results become `toolCall`/`toolResult` segments carrying the commands and code the session actually produced. This is the richest source because it includes *verified executable artifacts*.
- `vtt`: reuses the parsing approach in `apps/ui/src/data/interviews.ts` — cues with timestamps and speakers, chapter markers become section boundaries.
- `slides`: PDF/PPTX → per-slide text + extracted code blocks + speaker notes; slide order is the segment order.
- `transcript`/`markdown`: plain text fallback with heading-based segmentation.

Adapters live in a new `packages/distill` workspace package so both the CLI and future 0400 tooling can import them.

**Stage 2 — Concept extraction ★.** One LLM pass over the `SourceDocument` (chunked with overlap for long sources) producing a `ConceptGraph`: nodes `{id, name, evidence: segmentRefs[], difficulty, kind: "concept"|"skill"|"pitfall"}` and prerequisite edges. Every node must cite segment refs — concepts without evidence in the source are rejected at this stage (the primary anti-hallucination gate). Pitfalls are first-class: in cassettes they are literally the failed tool results and corrections; in talks they are the "people always get this wrong" moments.

**Stage 3 — Curriculum planning ★.** An LLM pass that topologically orders the concept graph into a `CoursePlan`: chapters → kata slugs with `{name, goal, concepts[], prerequisites[], difficulty, pedagogicalMode}` following the pedagogical-mix taxonomy from `dojos/build-llm/DOJO.md` (Socratic / Use-Modify-Create / Parsons / drill). Deterministic numbering and slug prefixing then reuses the `_aggregate.py` linearization logic, ported to TypeScript. Target size heuristics: one kata per concept cluster, 5–30 katas per distilled dojo (a 45-minute talk is not a 114-kata book).

**Stage 4 — Kata synthesis ★ (per kata, parallelizable).** For each planned kata, generate four artifacts against the target runner:

1. `_ref.{ts,py}` reference solution — grounded in code evidence from the source where it exists (cassette tool calls, slide code blocks), synthesized only when the source has none.
2. Test file (`solution.test.ts` / `test_solution.py`) exercising the reference.
3. Stub `solution.{ts,py}` — the reference with the learning-critical parts hollowed out.
4. `SENSEI.md` — generated section-by-section against the fixed anatomy, with the Test Map derived mechanically from the test file's test names (not free-generated), Socratic prompts and Common Pitfalls drawn from concept-graph pitfall nodes, and On Completion's Bridge pointing at the next planned kata.

**Stage 5 — Validation loop (deterministic harness, ★ only on repair).** Generalizes `dojos/build-llm/_validate.py`: for each kata, (a) run tests against the stub — must **fail**; (b) swap in `_ref` — must **pass**; (c) restore stub; (d) lint `SENSEI.md` structure and Test-Map/test-name agreement; (e) run 0400's dojo-level validation (`validateManifest` from `packages/config/src/index.ts` plus prerequisite-cycle and bridge-chain checks). Failures feed a bounded repair loop (max N re-synthesis attempts with the failure output in context); katas that never converge are emitted as `DRAFT`-flagged with the failure report attached rather than silently dropped.

Output lands as a standard dojo directory in 0400's authoring layout (katas + `_ref` files + `dojo.json` + `DOJO.md` + a `distill.lock.json` recording source hash, adapter, model, and per-kata evidence refs for provenance).

## Candidate feature breakdown

- **0201 `distill-core-pipeline`** — New `packages/distill` workspace package defining the `SourceDocument`, `ConceptGraph`, and `CoursePlan` types, the stage orchestration, chunking, and the provenance `distill.lock.json` format. Ships the `dojo distill` command skeleton in `packages/cli` with `--out`, `--target <runner>`, `--dry-run` (stop after planning, print the course outline), and progress reporting. No adapters or synthesis yet — this is the spine everything else plugs into.

- **0202 `cassette-adapter`** — Ingestion adapter for `.dojo/cassettes/*.jsonl`, consuming the `CassetteEntry` format produced by `packages/cli/src/tracking.ts`. Maps user/assistant turns to utterances and tool calls/results to executable-evidence segments; detects kata-session cassettes (dojo protocol tags in content) and strips sensei scaffolding so we don't distill a dojo out of a dojo. Includes a redaction pre-pass (paths, tokens, env leakage) since cassettes are raw session logs. This makes `dojo track`'s "to improve courses" promise real and is the flagship demo: "your session, replayed as a course."

- **0203 `vtt-video-adapter`** — Ingestion adapter for VTT/SRT subtitles plus optional chapter markers, generalizing the parsing in `apps/ui/src/data/interviews.ts` (`node-webvtt`, speaker tags, `{start, end, speaker, text}` cues). Accepts a local file or a URL; chapters become curriculum section hints; timestamps flow into evidence refs so generated katas can cite `[12:34]` in SENSEI.md References. Plain-transcript and markdown fallback ingestion is included here.

- **0204 `slide-deck-adapter`** — Ingestion adapter for PDF and PPTX decks: per-slide text extraction, code-block detection (monospace runs / fenced blocks in speaker notes), and slide-order segmentation. Decks are the weakest solo source (terse bullets, no narration), so this adapter supports **multi-source fusion**: `dojo distill talk.vtt --with deck.pdf` aligns slides to transcript time ranges and merges them into one `SourceDocument`.

- **0205 `concept-extraction`** — The stage-2 LLM pass: chunked extraction of concepts, skills, and pitfalls with mandatory evidence citations; prerequisite-edge inference; deduplication and merge across chunks; rejection of evidence-free nodes. Emits the `ConceptGraph` with a human-readable review rendering (`concepts.md`) so an author can prune before planning.

- **0206 `curriculum-planner`** — The stage-3 LLM pass plus deterministic ordering: topological sort of the concept graph into chapters and kata slugs, difficulty assignment (manifest's `1|2|3`), pedagogical-mode tagging per the `dojos/build-llm/DOJO.md` taxonomy, and Insight→Bridge chain planning so consecutive katas hand off coherently. Ports `_aggregate.py`'s linearize-and-number logic to TypeScript. `--dry-run` output of 0201 renders this plan.

- **0207 `kata-synthesizer`** — The stage-4 per-kata generator: `_ref` reference solution (evidence-grounded), test file, hollowed stub, and anatomy-conformant `SENSEI.md` with a mechanically derived Test Map. Supports `vitest` and `exit-code`/pytest targets matching `RunnerConfig` in `packages/config/src/index.ts`. Parallel per-kata execution with a shared style guide prompt derived from existing exemplar katas (`dojos/effect-ts/katas/001-hello-effect/SENSEI.md` et al.).

- **0208 `validation-repair-loop`** — Generalizes `dojos/build-llm/_validate.py` into `packages/distill`: stub-must-fail / ref-must-pass test execution per runner, SENSEI.md structural lint, Test-Map/test-name agreement check, manifest and prerequisite-graph validation, bounded LLM repair attempts with failure context, and the final `distill report` (per-kata PASS/DRAFT/FAIL). This component is also independently useful to hand-authors and becomes shared infrastructure with epic 0400.

- **0209 `improvement-loop`** — Consumes epic-0300 telemetry findings (cassette analyses of learners running a distilled dojo: stall points, hint-request density, abandonment) and maps them back to kata evidence refs via `distill.lock.json`, then runs targeted re-synthesis: regenerate a pitfall section, split an overloaded kata, insert a missing prerequisite kata. `dojo distill --refine <dojo> --findings <report>`. This turns distillation from a one-shot compiler into a course that gets better the more it is taught.

- **0210 `provenance-and-licensing`** — Source attribution and rights handling: `distill.lock.json` provenance (source hash, origin URL, adapter, model, timestamps), required `attribution`/`license` fields surfaced into `dojo.json`'s `author`/`homepage` and `DOJO.md`'s credits (mirroring the existing EffectPatterns credit in the root `README.md`), a consent prompt when the source is third-party material, and a "derived-from" marker the 0500 registry can display and filter on.

## CLI / schema surface changes

CLI (`packages/cli`):

```sh
dojo distill <source> [--with <source>...] [--target vitest|exit-code]
             [--out <dir>] [--name <dojo-name>] [--dry-run]
dojo distill --refine <dojo> --findings <report.json>
dojo distill report [<dir>]
```

- `<source>` accepts a cassette path (or bare session id resolved against `.dojo/cassettes/`), `.vtt`/`.srt`, `.pdf`/`.pptx`, `.md`/`.txt`, or a URL.
- `dojo track` gains `--distill` as a convenience: record the current session, then immediately distill it.

Schema (`packages/config/src/index.ts`):

- New optional manifest fields validated by `validateManifest`: `license?: string`, `derivedFrom?: { type: "cassette"|"video"|"slides"|"transcript"; origin: string; hash: string }`.
- `KataEntry` gains optional `references?: string[]` (evidence refs like `talk.vtt#12:34`, rendered by SENSEI.md and the 0100 web view).
- New sibling file convention, not schema: `distill.lock.json` next to `dojo.json` (ignored by `parseManifest`, consumed by 0209/0400/0500).

No breaking changes: all additions are optional, and existing dojos remain valid.

## Dependencies on other epics

- **0400 Authoring toolkit (hard dependency, bidirectional).** Distillation emits into 0400's authoring layout and its output must pass 0400's validation suite; conversely, 0208's stub-fail/ref-pass loop should be built once and shared. Sequencing: agree the authoring format and validation contract with 0400 before 0207/0208 land.
- **0300 Learning reviewer / telemetry (soft, feeds 0209).** 0300's cassette-analysis findings (where learners stall, which hints get requested) are the input to the improvement loop. 0209 should be scheduled after 0300 defines its findings format.
- **0500 Registry & community (downstream + upstream).** 0500 publishes distilled dojos (needs 0210's provenance/license markers to display and gate) and is the channel through which community cassettes arrive as distillation sources.
- **0100 Learning web-view (soft).** Timestamped `references` from 0203 let the web view deep-link a kata back to the moment in the talk it came from; the VTT types already living in `apps/ui/src/data` should be lifted into a shared package rather than duplicated.

## Risks & open questions

- **Copyright of source material.** Distilling someone's conference talk or book chapter into a redistributable dojo is derivative work. Mitigations: 0210's mandatory attribution/license fields, a consent prompt for third-party sources, registry-side "derived-from" disclosure, and defaulting distilled-from-third-party dojos to local/private (not publishable) until license is asserted. Open question: do we require an explicit license allowlist (CC-BY, etc.) for 0500 publication?
- **Test-generation quality.** The reference and the tests are generated by the same model and can be consistently wrong together (tests that pass but verify the wrong behavior). Mitigations: evidence-grounding (prefer code the cassette actually executed successfully), mutation-style checks in 0208 (perturb the ref, tests must fail), and DRAFT-flagging. Open question: is a second-model adversarial test review worth the cost per kata?
- **Hallucinated curricula.** The planner can invent concepts the source never taught, producing a confident course about the wrong thing. The evidence-citation gate in 0205 is the primary control; `--dry-run` human review of the plan is the second. Open question: minimum evidence density per kata before we refuse to synthesize it?
- **Cassette privacy.** Cassettes contain real paths, repo contents, and potentially secrets. 0202's redaction pre-pass is necessary but not sufficient; distilled output must never embed raw cassette excerpts verbatim. Review-before-share stays the contract (as `track.ts` already prints).
- **Thin sources.** A 30-minute talk may only support 4–6 katas; the pipeline must resist padding to look like a "real" dojo. Sizing heuristics in 0206 and honest `--dry-run` reporting.
- **Cost and latency.** Stages 2–4 are LLM-heavy; a long workshop could mean 50+ synthesis calls plus repair loops. Open question: run distillation through the user's own agent session (zero marginal cost to us, variable quality) vs. a dedicated pipeline with pinned models (consistent, but who pays)? V1 leans agent-executed.
- **Sensei-agent contract drift.** If generated SENSEI.md subtly violates the anatomy (e.g. Test Map names not matching test titles), every downstream teaching session degrades. The mechanical Test-Map derivation and structural lint in 0207/0208 exist for exactly this; keep them non-LLM.

## Success metrics

- **Time-to-dojo:** a 1-hour talk with VTT distills to a validated draft dojo in under 30 minutes of wall time; a cassette in under 10. (Baseline: `build-llm` took weeks.)
- **Validation pass rate:** ≥ 90% of synthesized katas pass the stub-fail/ref-pass loop within the repair budget; 0 katas shipped without either PASS or an attached DRAFT report.
- **Fidelity:** ≥ 95% of concepts in generated dojos carry evidence refs to the source; spot-audit hallucination rate below an agreed threshold.
- **Adoption:** number of dojos in the 0500 registry marked `derivedFrom`; number of `dojo distill` runs per month; ratio of distilled dojos that get human-edited via 0400 vs. abandoned.
- **Learning quality parity:** 0300 telemetry shows distilled-dojo completion and stall rates within an acceptable band of hand-authored dojos, and improving release-over-release via 0209.
- **Loop closure:** at least one distilled dojo goes through a full 0209 refine cycle driven by real 0300 findings within two releases of GA.
