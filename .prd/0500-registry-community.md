# Registry & Community

- **Epic:** 0500
- **Status:** Draft
- **Date:** 2026-07-05
- **Owner:** dojocho core

## Problem & Opportunity

Dojocho ships three first-party dojos (`dojos/effect-ts` — 40 katas, `dojos/build-llm` — 114, `dojos/pydantic-agents` — 3) and a registry that is two hand-edited JSON files served as static assets (`apps/web/public/r/index.json`, `apps/web/public/r/effect-ts.json`). There is no way for anyone outside this repo to publish a dojo, no way for a learner to discover dojos from the CLI, no update story beyond `dojo add <name> --force`, no integrity verification of what gets downloaded, and no trust signal distinguishing a well-maintained dojo from an abandoned or malicious one.

At the same time, the CLI has just grown session tracking (`packages/cli/src/tracking.ts`, `packages/cli/src/commands/track.ts`): every kata session can be recorded as a local cassette in `.dojo/cassettes/`, and the CLI already tells the learner "Submission is voluntary; review the cassette before sharing it to improve courses" — but no submission mechanism exists. The cassette corpus is the raw material for the 0300 telemetry/reviewer loop and the 0200 distillation pipeline; without a consent-first upload path, that flywheel never starts.

The opportunity: turn dojocho from a product with three courses into a platform with a community — authors publish and version dojos, learners discover and rate them, and voluntary cassette submissions feed course quality back to authors and training data back to the distillation pipeline.

## Goals

- Anyone can publish a dojo to the dojocho registry with one command (`dojo publish`), gated on 0400 authoring-toolkit validation.
- Learners can discover dojos from both the CLI (`dojo search`) and the web (`dojocho.ai/dojos`), with quality signals (installs, completions, ratings, 0300 quality scores).
- Installed dojos are versioned: `dojo add` records the installed version, `dojo update` / `dojo outdated` exist, and every artifact is integrity-checked (checksum, later signatures).
- A consent-first cassette submission pipeline (`dojo submit` / `dojo track --share`): explicit opt-in per cassette, local redaction preview, attribution choice, revocation.
- Author identity and trust: publishing requires an account; listings show verified authorship, provenance, and moderation status.
- Registry index schema v2 that is backward-compatible with the v1 consumers baked into shipped CLIs.

## Non-goals

- Paid dojos, marketplace billing, or revenue share (future epic).
- Hosting learner code or running katas server-side (0100 learning web-view owns in-browser execution).
- Building the reviewer/quality-scoring models themselves (0300 owns scoring; we consume and display scores).
- Replacing npm as a distribution channel — npm-sourced dojos (`source.type: "npm"`) remain first-class.
- Real-time community features (forums, chat, comments-on-katas).

## Users & Personas

- **Learner** — installs dojos, practices katas with their agent, may share cassettes. Wants: easy discovery, trustworthy packages, updates that don't clobber progress in `.dojorc`, and absolute control over what leaves their machine.
- **Dojo author** — writes katas (likely with the 0400 authoring toolkit), publishes and maintains a dojo. Wants: one-command publish, download/completion stats, cassette-derived feedback on where learners get stuck.
- **Sensei-agent** — the learner's coding agent (claude/codex/gemini/opencode/pi), bootstrapped via `apps/web/src/routes/llms.txt.ts` and the install prompt in `apps/web/src/components/install-prompt.ts`. Wants: machine-readable discovery (JSON search endpoint, llms.txt listing of dojos) so it can recommend and install dojos mid-conversation.
- **Registry operator** — dojocho maintainers. Wants: cheap-to-run infrastructure, a moderation queue with takedown ability, abuse resistance (name squatting, malicious `prepare.sh`), and legal clarity on hosted cassettes.

## Current State

- **Registry is static files.** `apps/web/public/r/index.json` lists one item (`effect-ts`); `apps/web/public/r/effect-ts.json` is a hand-written RegistryItem pointing at the `@dojocho/effect-ts` npm package. JSON Schemas live at `apps/web/public/schema/v1/{registry.json,dojo.json}`. `build-llm` and `pydantic-agents` exist in `dojos/` but are not even listed.
- **Install pipeline is solid but trust-blind.** `packages/cli/src/commands/add.ts` classifies sources (local / npm / URL / registry), fetches `https://dojocho.ai/r/{name}.json` (default registry template in `packages/config/src/index.ts` `resolveConfig`, user-extensible via `registries` in config), validates the item shape (`validateRegistryItem`), extracts tarballs with a path-traversal check (`safeExtract`), then runs `pm install` and an arbitrary `prepare.sh` via `runLifecycleScript` — no checksum, no signature, no sandbox.
- **Versioning is vestigial.** RegistryItem and `DojoManifest` (`packages/config/src/index.ts`) carry semver `version` fields, but the CLI never records the installed version, never compares versions, and the only update path is `--force` reinstall, which nukes the dojo dir (progress survives only because it lives in `.dojorc`, not the dojo dir).
- **Manifest already has unused community hooks.** `DojoManifest` supports optional `author`, `homepage`, `repository` and per-kata `difficulty`/`tags`/`prerequisites` — none of the first-party `dojo.json` files set them and nothing displays them.
- **Cassettes exist, submission doesn't.** `packages/cli/src/tracking.ts` normalizes pi/codex/claude/generic session logs into `.dojo/cassettes/<timestamp>-<sessionId>.jsonl` (thinking blocks stripped, codex environment-context filtered); `packages/cli/src/commands/track.ts` records/lists and prints the voluntary-submission notice. No redaction, no consent flow, no upload endpoint anywhere.
- **Web discovery is docs-only.** `apps/web/src/routes/api/search.ts` is fumadocs docs search, not dojo search. `/dojos` is a docs page. The llms.txt endpoints (`llms.txt.ts`, `llms-full.txt.ts`) bootstrap agents but don't enumerate installable dojos from the registry.
- **No PRDs yet.** `.prd/` did not exist before this document.

## Prior Art & Inspiration

Researched 2026-07: three ecosystems solved "community registry" without becoming npm-scale infrastructure. Dojocho's model borrows from all three.

- **shadcn/ui registries** — an open, spec-first model: `registry.json` / `registry-item.json` are published JSON Schemas, so *any* static URL can be a registry ([registry-item.json](https://ui.shadcn.com/docs/registry/registry-item-json), [registry.json](https://ui.shadcn.com/docs/registry/registry-json)). The CLI resolves plain names (official registry), full URLs, and namespaced items: `components.json` maps `@acme` to a URL template `https://registry.acme.com/r/{name}.json` (with optional `${ENV}`-expanded auth headers for private registries), and `npx shadcn add @acme/button` fills the template, fetches, validates against the schema, and recursively resolves cross-registry `registryDependencies` ([Namespaces](https://ui.shadcn.com/docs/registry/namespace)). Curated community registries are listed in a [directory](https://ui.shadcn.com/docs/directory) and become built-in namespaces requiring no config. *Why it works:* zero gatekeeping on hosting (a registry is just static JSON — exactly what dojocho already serves), while the vendor site stays valuable as directory/default namespace rather than chokepoint. *Copy:* the URL-template namespace mechanism (dojocho's `DojoUserConfig.registries` already has this exact `{name}` shape, it just isn't reachable from `dojo add @ns/name` syntax), publishing the schema as a self-hosting spec, the directory-of-registries. *Avoid:* shadcn's trust model is "review code on installation" — insufficient for dojocho because `prepare.sh` executes arbitrary bash.
- **Vercel skills / skills.sh** — skills are directories with a `SKILL.md` in any public GitHub repo; `npx skills add owner/repo` installs from GitHub shorthand, full git URLs, GitLab, or local paths; "publishing" is pushing a repo and sharing the command ([vercel-labs/skills](https://github.com/vercel-labs/skills), [changelog](https://vercel.com/changelog/introducing-skills-the-open-agent-skills-ecosystem)). [skills.sh](https://www.skills.sh/) is a leaderboard/directory ranked by install counts reported through the CLI — the only infra Vercel runs is the aggregator, not storage. *Why it works:* zero publish friction bootstrapped an ecosystem fast; the CLI's install telemetry gives the directory its ranking signal for free. *Copy:* GitHub-repo-as-package install source, install-count pings powering directory ranking, "publish = push + share a command". *Avoid:* no versioning or integrity — installs track default-branch HEAD; dojocho must pin commit SHAs and record versions.
- **Hyper terminal plugins** — plugins are ordinary npm packages tagged with the `hyper-plugin` / `hyper` keyword ([PLUGINS.md](https://github.com/vercel/hyper/blob/canary/PLUGINS.md)); discovery is [npm keyword search](https://www.npmjs.com/search?q=keywords:hyper-plugin), and [hyper.is/plugins](https://hyper.is/plugins) is a website aggregating those npm search results; the app installs via npm into `.hyper_plugins`. *Why it works:* npm supplies hosting, versioning, sha512 integrity (`dist.integrity`), scoped-name ownership, and search — the "registry" costs Vercel one crawler and a webpage. *Copy:* a keyword convention (`dojocho-dojo`) as the zero-infra publish path — dojocho's `add.ts` already installs from npm via `npm pack`, so tagged packages are installable today. *Avoid:* keyword squatting is unmoderated; the aggregator must validate (0400 suite) before listing, not mirror npm search raw.
- **Adjacent signals** — Homebrew taps (`brew tap user/repo` → GitHub naming convention resolved by the CLI) and GitHub topics ([`hyper-plugin` topic](https://github.com/topics/hyper-plugin)) confirm the pattern: a well-known tag (`dojocho-dojo` topic) plus the GitHub search API is free discovery for repos not published to npm. VS Code's Marketplace is the counterexample — fully centralized store with heavy moderation/infra and periodic malware incidents anyway; not worth the cost at dojocho's scale.

**Synthesis:** the winning pattern is *open spec + storage you don't run + one curated aggregator*. Nobody successful at this scale hosts community tarballs on day one.

## Proposed Solution & Architecture Sketch

A federated registry with a curated hub, in three layers:

### Layer 1 — Open registry spec (federated read path)

Keep the read path static and CDN-cacheable — shipped CLIs already fetch `https://dojocho.ai/r/{name}.json`, so v2 must be additive at those URLs. Publish schema v2 (`apps/web/public/schema/v2/`) as a documented, self-hostable spec (shadcn-style): any static host serving `/r/index.json` + `/r/{name}.json` conforming to the schema *is* a dojocho registry. The CLI resolves namespaced sources — `dojo add @acme/rust-basics` — via the existing `registries` URL-template map in `DojoUserConfig` (`packages/config/src/index.ts` already resolves `{ dojocho: "https://dojocho.ai/r/{name}.json" }`); dojocho.ai is simply the default namespace, and directory-listed community registries ship as built-in namespaces. Note: `classifySource` in `add.ts` currently routes anything starting with `@` to npm, so namespace syntax needs explicit disambiguation (resolve against configured registries first, fall back to npm scope).

### Layer 2 — Zero-infra community publishing (conventions, not uploads)

Community dojos are *not* uploaded to dojocho. Instead:

- **npm convention**: publish the dojo as an npm package with keyword `dojocho-dojo` (hyper model). npm provides hosting, semver, sha512 integrity, and name ownership for free; `addNpm` in `add.ts` installs these today.
- **GitHub convention**: tag the repo with topic `dojocho-dojo` and support direct install `dojo add github:owner/repo[@ref]` (skills/homebrew-tap model), pinned to a commit SHA on install.
- `dojo publish` becomes a thin wrapper: run the 0400 validation gate locally → `npm publish` (or verify the repo/topic) → ping the dojocho.ai index endpoint so the crawler picks it up immediately. No auth infrastructure needed for publishing itself — npm/GitHub identity is the identity.

### Layer 3 — dojocho.ai as curated aggregator (hyper.is / skills.sh model)

A small service (TanStack server routes in `apps/web` or a separate `apps/registry`; Postgres for metadata, **no blob storage of tarballs initially** — npm and GitHub are the storage layer) that:

```
crawl: npm search keywords:dojocho-dojo + GitHub search topic:dojocho-dojo
gate:  run the 0400 validation suite + script scan on each candidate
list:  regenerate static /r/index.json and /r/{name}.json (v2, with
       source: {type:"npm"|"github", ref, sha512}, stats, quality scores)

GET  /r/index.json            v2 index: all listed dojos + stats + quality scores
GET  /r/{name}.json           v2 item: versions[], integrity, author, stats
GET  /r/{name}@{version}.json pinned version item
GET  /api/registry/search?q=  ranked search for CLI + web + agents
POST /api/registry/ping       publish notification + opt-in install/completion pings
POST /api/cassettes           authenticated, consented cassette upload
DELETE /api/cassettes/{id}    revocation
```

Listing is curation, not hosting: a dojo that fails validation or is reported gets *delisted* from dojocho.ai but remains installable by explicit npm name/GitHub URL (user's choice, with warnings). This converts moderation from a takedown/liability problem into an editorial one. First-party-hosted tarballs in blob storage (`source: {type:"tarball", url, sha512}` via the existing `addUrl` path) remain a phase-2 option for authors who want neither npm nor GitHub.

### Versioning & integrity

- Record `installedVersion` and full resolved `source` (npm version / git commit SHA / tarball sha512) per dojo in `.dojorc` on `dojo add`.
- `dojo outdated` / `dojo update [name]` compare against the resolved registry item; updates preserve `.dojorc` progress and warn when installed kata slugs disappear in the new version.
- Integrity is source-appropriate: npm items verify the registry-recorded `sha512` against npm's `dist.integrity`; GitHub installs pin and record the commit SHA (never floating HEAD, unlike the skills CLI); tarball items carry `sha512` verified before `safeExtract`. Phase 2: sigstore-style signing with author identity attestation.
- `prepare.sh` hardening: print the script and require confirmation before first run of any non-first-party dojo (`runLifecycleScript` in `add.ts` gains a consent gate). This is the gap none of the prior-art models had to solve — shadcn installs source you read, dojocho executes scripts.

### Cassette submission pipeline (consent → redact → upload)

1. **Consent**: `dojo submit [cassette]` (alias: `dojo track --share`) is always explicit — never automatic. First run shows a plain-language summary of what a cassette contains, where it goes, and the license granted (see Risks).
2. **Redaction**: a local pass over the cassette (`packages/cli/src/redact.ts`) strips absolute paths outside the project, env-var-shaped strings, secrets (entropy + known-token regexes), emails, and anything matching user-configured patterns; the learner is shown a diff/preview and must confirm. Raw agent logs never leave the machine — only the normalized `CassetteEntry[]` format from `tracking.ts`, post-redaction.
3. **Upload**: POST with dojo name, dojo version, kata slug, agent type, anonymized or attributed submitter ID (learner's choice), and a client-computed content hash. Server stores it keyed to the submitter for later revocation (`dojo submit --revoke <id>`).
4. **Fan-out**: accepted cassettes feed the 0300 telemetry corpus (stuck-point analysis, quality scores) and are sampled as 0200 distillation examples; aggregate stats (completion rate per kata, median session length) flow back into registry listings and author dashboards.

### Discovery UX

- **CLI**: `dojo search <query>` hits `/api/registry/search`, prints name, description, version, installs, rating, quality score; `dojo add` suggests near-matches on registry miss (replacing the current bare "not found" error in `addFromRegistry`).
- **Web**: `/dojos` becomes a registry-driven directory (cards with stats, per-dojo pages rendering `DOJO.md` and the kata list from the manifest with `difficulty`/`tags`).
- **Agents**: `llms.txt.ts` / `llms-full.txt.ts` additionally enumerate registry dojos so a sensei-agent can recommend and install the right dojo; `install-prompt.ts` AGENT_PROMPT gains a "discover dojos" step.
- **Ratings/completion**: 1–5 star rating prompt after a dojo's final kata completes (opt-in, via CLI); completion stats derived from consented cassettes and anonymous ping-on-completion (also opt-in).

## Candidate Feature Breakdown

- **0501 `registry-index-v2`** — Define registry index/item schema v2 at `apps/web/public/schema/v2/` (versions array, sha512 checksums, author, stats block, quality score) with strict backward compatibility for v1 consumers of `/r/{name}.json`; add all three first-party dojos to the index; update `validateRegistryItem` in `packages/cli/src/commands/add.ts` to accept v1 and v2.
- **0502 `installed-version-tracking`** — Record installed version and source in `.dojorc` per dojo (extend `DojoRc` in `packages/config/src/index.ts`); implement `dojo outdated` and `dojo update` with progress preservation and removed-kata warnings; deprecate the `--force` reinstall as the update path.
- **0503 `artifact-integrity`** — Source-appropriate integrity verification before `safeExtract`: registry-recorded `sha512` checked against npm `dist.integrity` for npm items, pinned commit SHA for github items (0513), `sha512` for direct tarball URLs in `addUrl`/`addFromRegistry`; consent gate before executing `prepare.sh` from non-first-party dojos; groundwork interfaces for phase-2 signing/attestation.
- **0504 `aggregator-service`** — Stand up the curated-aggregator service (Postgres metadata, static artifact regeneration for `/r/*.json`, search endpoint, listing/delisting moderation queue; **no tarball blob storage in v1** — npm/GitHub are storage); decide TanStack server routes in `apps/web` vs. separate `apps/registry` and document the choice.
- **0505 `dojo-publish`** — CLI `dojo publish` command as a thin convention wrapper: 0400 validation gate, then `npm publish` with the `dojocho-dojo` keyword (or GitHub repo/topic verification), then index ping to the aggregator; `--dry-run`; server-side re-validation and first-publish moderation hold before listing. Name ownership delegates to npm scopes / GitHub repo ownership.
- **0506 `dojo-search-cli`** — `dojo search <query>` against `/api/registry/search` with ranked results and quality/rating columns; near-match suggestions on `dojo add` registry misses.
- **0507 `web-dojo-directory`** — Replace the static `/dojos` docs page with a registry-driven directory and per-dojo detail pages (README, kata list with difficulty/tags, stats, author, version history); extend `llms.txt.ts`/`llms-full.txt.ts` and `install-prompt.ts` so agents can discover registry dojos.
- **0508 `cassette-redaction`** — Local redaction engine (`packages/cli/src/redact.ts`): secret/PII detection over `CassetteEntry[]`, user-configurable patterns, mandatory interactive preview; ship as a standalone step usable on any cassette (`dojo track --redact`).
- **0509 `cassette-submission`** — `dojo submit` / `dojo track --share`: consent screen with data-use and license disclosure, redaction gate, upload to `/api/cassettes` with dojo/kata/agent metadata and attribution choice, `--revoke` for deletion; server storage keyed for revocation and 0300/0200 consumption.
- **0510 `ratings-and-stats`** — Post-completion rating prompt in the CLI, opt-in anonymous completion pings, aggregation into registry stats blocks, display in `dojo search` and the web directory; ranking function that blends installs, completions, ratings, and 0300 quality scores.
- **0511 `author-identity-trust`** — Author identity anchored to npm/GitHub ownership (no separate account system for publishing), verified-publisher badges, provenance display (repo link cross-check against `DojoManifest.repository`), report-a-dojo flow, and the operator listing/delisting dashboard. Accounts only where unavoidable: cassette submission/revocation (0509).
- **0512 `third-party-registry-resolution`** — `dojo add @namespace/name`: resolve namespaces against `DojoUserConfig.registries` URL templates (shadcn model) with `${ENV}` auth-header support for private registries; fix the `classifySource` ambiguity in `add.ts` (`@…` currently always means npm — resolve configured namespaces first, fall back to npm scope); `dojo registry add|list|remove` config helpers; ship directory-listed registries as built-in namespaces.
- **0513 `github-source-install`** — New `github` source type in `add.ts`: `dojo add github:owner/repo[@ref]` (skills/homebrew-tap model), fetch via codeload tarball, pin and record the resolved commit SHA in `.dojorc`, reuse `safeExtract` + the 0503 prepare.sh consent gate.
- **0514 `convention-crawler`** — Aggregator crawler over npm search (`keywords:dojocho-dojo`) and GitHub search (`topic:dojocho-dojo`): candidate discovery, 0400 validation + script scan as the listing gate, periodic re-crawl for new versions, delist-on-failure/report; feeds 0504's static artifact regeneration.
- **0515 `registry-spec-publication`** — Publish schema v2 as an open spec: JSON Schemas at `apps/web/public/schema/v2/`, a "host your own dojo registry" guide (docs), a "publish a dojo" guide (npm keyword / GitHub topic conventions), and a community-registry directory page with the listing process (shadcn-directory model).

## CLI / Schema Surface Changes

New commands (wired in `packages/cli/src/index.ts`):

```
dojo add @namespace/name              (0512: configured-registry resolution)
dojo add github:owner/repo[@ref]      (0513: pinned GitHub source)
dojo registry add|list|remove <ns>    (0512: manage registries config)
dojo publish [--dry-run] [--tag <dist-tag>]
dojo search <query>
dojo update [name] | dojo outdated
dojo submit [cassette] [--anonymous|--attributed] [--revoke <id>]
dojo track --share | dojo track --redact
dojo login | dojo logout | dojo whoami   (cassette submission only; publishing uses npm/GitHub auth)
```

Schema changes:

- `schema/v2/registry-item.json`: adds `versions[]`, `source` integrity fields (`sha512` for npm/tarball, `commit` for github), new `source.type: "github"`, `author {name, id, verified}`, `stats {installs, completions, rating, qualityScore}`, `publishedAt`; `schema/v2/registry-index.json` mirrors item summaries for one-request CLI search fallback. Published as an open, self-hostable spec (0515).
- `schema/v1/dojo.json` (manifest): promote `author`/`homepage`/`repository` from ignored-optional to publish-required; no breaking changes for installed dojos.
- `.dojorc` (`DojoRc`): per-dojo `{ installedVersion, source, installedAt }` map.
- `DojoUserConfig.registries` keeps the `{name}` URL-template contract and becomes the resolution table for `@namespace/name` (0512); entries gain optional `{ url, headers, params }` object form for authenticated private registries (shadcn model).
- Cassette submission payload schema: `schema/v1/cassette.json` formalizing `CassetteEntry[]` plus submission envelope (dojo, version, kata, agent, redactionVersion, contentHash).

## Dependencies on Other Epics

- **0400 Authoring Toolkit** — hard dependency for 0505: `dojo publish` refuses to upload unless 0400's validation suite passes; server-side re-runs the same suite.
- **0300 Learning Reviewer / Telemetry** — consumer of 0509's cassette corpus; producer of the quality scores that 0501/0510 surface in listings. Submission envelope schema must be co-designed.
- **0200 Course Distillation** — 0500 distributes distilled courses like any other dojo (publish path) and supplies it consented community cassettes as few-shot/eval examples.
- **0100 Learning Web-View** — per-dojo directory pages (0507) deep-link into the web-view; completion events it emits can feed 0510 stats.

## Risks & Open Questions

- **Malicious dojos execute code.** `prepare.sh` runs arbitrary bash via `runLifecycleScript` (`add.ts`), and `pm install` runs package lifecycle scripts. Mitigations: consent gate + script display (0503), server-side scanning and moderation hold (0504/0511), possibly `--ignore-scripts` install by default. Open: do we sandbox `prepare.sh` (container/deno-style permissions) or accept npm's trust model?
- **Cassette privacy/PII.** Cassettes contain full conversation transcripts — file contents, paths, potentially secrets and personal context. Redaction is best-effort; a mandatory human preview and default-anonymous submission reduce but don't eliminate risk. Open: retention period, GDPR deletion SLA on `--revoke`, whether server does a second redaction pass, and whether cassettes from non-registry (private) dojos are accepted at all.
- **License of cassettes and derived courses.** What license do submitters grant (CC-BY? custom contributor agreement?), and what does that imply for 0200-distilled courses built from community cassettes — must derived dojos credit submitters or share a license? Needs legal review before 0509 ships.
- **Moderation cost & liability.** The federated model converts most of this from takedown/DMCA (we'd host the bytes) to editorial delisting (npm/GitHub host the bytes and own abuse handling) — first-publish review gates *listing*, not *existence*. Still needed: delisting policy, report flow, and namespace rules for `@ns` registry names in the directory. Residual liability: cassettes, which dojocho does host.
- **Keyword/topic squatting and crawler trust.** Anyone can tag `dojocho-dojo` on npm/GitHub (hyper's unmoderated weakness); the 0400 validation gate plus moderation hold before listing is the defense — the crawler must never mirror search results raw.
- **Namespace ambiguity.** `@acme/foo` is both an npm scope (today's `classifySource` behavior) and a 0512 registry namespace. Resolution order (configured registries first, npm fallback) must be deterministic and documented, or shipped CLIs and docs will disagree.
- **Floating GitHub sources.** `github:owner/repo` without a ref tracks HEAD (the skills-CLI mistake); 0513 must always pin and record the resolved commit SHA, and `dojo update` is the only sanctioned way to move it.
- **Registry compatibility.** Old CLIs in the wild validate `/r/{name}.json` with the current strict `validateRegistryItem` (`additionalProperties: false` in schema v1 but a permissive runtime check). Must verify v2 fields don't break any shipped version before flipping the static files.
- **Stats gaming.** Installs/completions/ratings are trivially inflatable (skills.sh leaderboards have the same problem); ranking must weight 0300 quality scores and verified-completion signals over raw counts.
- **Operator cost.** Materially lower than a hosting registry: no blob storage in v1, Postgres metadata + crawler + static regeneration only; the read path stays static/CDN so cost scales with publishes and crawl frequency, not installs. Open: whether phase-2 first-party tarball hosting (for authors avoiding npm/GitHub) is ever worth reintroducing.
- **Federation vs. quality signal.** Dojos installed from third-party registries (0512) or direct GitHub/npm never pass through the aggregator's validation gate; the CLI should label their provenance ("unlisted source") without blocking — mirroring shadcn's review-it-yourself stance but with the prepare.sh consent gate as the hard floor.

## Success Metrics

- ≥ 25 published community dojos (non-first-party) within 6 months of `dojo publish` GA; ≥ 10 distinct authors.
- ≥ 40% of `dojo add` installs originate from `dojo search` or the web directory (vs. direct name entry) after 0506/0507 ship.
- ≥ 500 consented cassette submissions in the first quarter after 0509, with 0 confirmed secret/PII leak incidents.
- ≥ 30% of active learners on the latest version of their installed dojos within 30 days of a release (0502 update flow working).
- 100% of registry-resolved installs integrity-verified (npm sha512 / pinned commit SHA / tarball checksum); 0 successful integrity-mismatch installs.
- Median publish-to-listed time under 24h including first-publish moderation.
