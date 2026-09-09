# Roadmap

dojofoo starts with coding katas: small, test-backed exercises that turn an AI
agent into a patient sensei. The longer-term goal is a local-first learning
environment that can teach structured skills, explore a curriculum with the
learner, and adapt its teaching without taking the work away from them.

This document describes product direction, not a compatibility promise. Kata
and interactive runtime contracts are implemented; explorative and mentor
examples remain design sketches until they are implemented and versioned.

## Principles

- Keep the learner doing the work. The Sensei should assess, question, explain,
  and nudge rather than silently complete the lesson.
- Keep productive difficulty in the subject itself. The system should absorb
  avoidable effort spent choosing an order, finding resources, switching
  interfaces, and checking whether an explanation is trustworthy.
- Provide one consistent teacher interface over multiple sources and
  perspectives. Continuity should not require accepting one source as the only
  authority.
- Prefer evidence over self-reported "learning styles." Adapt to teaching
  methods that helped in a particular subject and context, without permanently
  labelling the learner.
- Make adaptation inspectable and correctable. A learner should be able to see
  why a path or method was selected and reset or edit mistaken conclusions.
- Keep personal learning data local by default. Syncing or publishing notes,
  transcripts, and learner models must be explicit.
- Let established tools own their domains: mise prepares development
  environments, native harnesses own conversations, and dojofoo owns learning
  state and orchestration.

## Course modes

A dojo should declare the learning contract it provides. The first proposed
modes are:

```json
{
  "mode": "katas"
}
```

```json
{
  "mode": "interactive",
  "chapters": "chapters.json"
}
```

```json
{
  "mode": "explorative",
  "curriculum": "curriculum.json"
}
```

```json
{
  "mode": "mentor",
  "project": "project.json"
}
```

### `katas`

The current model: ordered, quizzable coding exercises with concrete completion
signals such as tests. Prerequisites may form branches, but progress normally
moves through explicit kata attempts.

### `interactive`

An authored course with a fixed curriculum presented through slides, quizzes,
animations, diagrams, and interactive components. A lesson can follow a
deliberate teaching loop:

```text
present ──▶ question ──▶ Socratic exploration ──▶ answer ──▶ reinforce
```

The learner still participates actively, but the course author controls the
concept sequence, presentation, assessments, and intended destination. The
Sensei facilitates the material, reacts to answers, and gives appropriate
hints without replacing the authored curriculum.

### `explorative`

An adaptive learning environment in which the learner and Sensei explore a
subject together. Topics form areas or clusters in a curriculum graph rather
than a fixed chapter sequence. The learner may lead with notes and questions;
the Sensei assesses coverage, follows productive connections, revisits weak
foundations, and proposes new areas to explore.

The teaching method evolves from contextual evidence about what has helped the
learner understand and retain similar material. It can favor the strongest
approach while deliberately trying alternatives instead of locking the learner
into one assumed style.

```text
learner question or note
          │
          ▼
Sensei answers and probes understanding
          │
          ▼
learner revises, applies, or challenges
          │
          ├──▶ update topic coverage
          ├──▶ update teaching-method evidence
          └──▶ choose the next useful area together
```

### `mentor`

A sustained apprenticeship in which the learner develops an authentic artifact
or performance under the Sensei's guidance. The learner attempts real work, receives
critique, revises it, and gradually becomes more independent.

```text
brief ──▶ plan ──▶ attempt ──▶ critique ──▶ revise ──▶ reflect
                         ▲                         │
                         └──── less scaffolding ◀─┘
```

Examples include building a compiler, writing a research paper, developing a
proof, designing a circuit, composing music, or improving a recurring
performance. The project or practice is the primary organizing structure. The
Sensei introduces concepts when the work creates a need for them and evaluates
both the evolving artifact and the learner's decisions.

Unlike `katas`, attempts contribute to one sustained body of work. Unlike
`interactive`, there need not be a fixed presentation sequence. Unlike
`explorative`, curriculum coverage is supporting evidence rather than the
main route through the course. Progress is demonstrated through artifact
quality, reasoning, reflection, transfer, and increasing independence from the
Sensei.

The mode is a behavioral contract, not only a different UI. It determines the
progress model, assessment signals, navigation rules, and responsibilities of
the course-level and lesson-level Sensei instructions.

Future modes should be added only when they require meaningfully different
learning behavior. A course may eventually embed an interactive lesson or kata
inside an explorative graph, or use either to support a `mentor` project, but
each top-level mode should initially keep authoring and runtime behavior
obvious.

## Interactive lessons

Interactive courses need an authored sequence format that can combine:

- Explanatory slides and progressive disclosure.
- Questions, quizzes, and confidence checks.
- Socratic follow-ups selected from the learner's response.
- LaTeX, diagrams, animations, and safe interactive components.
- Short simulations or manipulable examples.
- Explicit answers, corrections, and reinforcement.
- Fixed prerequisites and completion criteria.

The Sensei should be able to vary the explanation and depth while preserving
the author's sequence and learning objectives. Interactive progress is based
on position and assessment within that curriculum, rather than discovering the
curriculum dynamically.

## Curriculum graphs

Explorative courses should describe knowledge as a graph of areas, clusters,
and relationships rather than a numbered list:

```text
foundations ──▶ core concept ──▶ application
      │               │               │
      └──▶ misconception ◀─────────────┘
                      │
                      └──▶ extension
```

A curriculum node may contain:

- Learning objectives and prerequisites.
- Suggested assessments and evidence of mastery.
- Misconceptions to look for.
- Remediation and extension edges.
- Difficulty and expected depth.
- A subject-specific `SENSEI.md`.
- Optional notebook components, diagrams, exercises, or code workspaces.
- Visibility rules for material that should be revealed only when useful.

"Hidden" chapters are pedagogically hidden, not a security boundary. A local
learner can inspect installed dojo files. Their purpose is to avoid spoiling a
diagnostic path or overwhelming the learner, while allowing the Sensei to
unlock remediation, enrichment, and surprising connections.

Progress should be recorded per objective with confidence and supporting
evidence, not only as a completed checkbox. The learner must be able to revisit
any revealed node and challenge an incorrect mastery assessment.

The authored curriculum graph and the learner's teaching plan are different
artifacts:

- The **coverage graph** comes from the dojo template. It describes the subject,
  dependencies, misconceptions, and possible areas to explore.
- The **teaching DAG** is generated for one learner and goal after probing their
  current understanding. It selects a path through the coverage graph and can
  include remediation or omit knowledge the learner already demonstrates.

The Sensei should show the proposed teaching DAG before teaching. This gives
the learner an inspectable map of what is coming and forces the system to make
its reasoning and dependencies explicit instead of improvising an unexamined
sequence.

## Explorative learning loop

An explorative session should follow a deliberate calibration loop:

```text
goal
  │
  ▼
probe broadly, then narrow toward each edge of understanding
  │
  ▼
plan a personalized teaching DAG and verify its material
  │
  ▼
teach one digestible reasoning step
  │
  ▼
question, application, or teach-back
  │
  ├── understood ──▶ advance along the DAG
  ├── uncertain ───▶ change method or add a prerequisite
  └── misconception ▶ revise the learner model and replan
```

Probing should begin with broad questions and narrow only where necessary,
approximately locating the learner's boundary on every prerequisite strand.
The objective is to avoid spending time on what they already understand and to
avoid explanations whose prerequisites they do not yet hold.

Teaching should then move one reasoning step at a time. The Sensei pauses for
questions and periodically requires the learner to retrieve, apply, explain,
or distinguish the new idea. Feedback serves the learner, recalibrates the
plan, and helps the material consolidate.

Planning and teaching may use specialized research, verification, and visual
subagents, but they remain behind one stable Sensei interface. Factual and
source-backed claims should carry verification evidence so that trust is built
into the system rather than demanded from the learner.

This loop is informed by Eero Alvar's demonstration in
[How I Use AI to Learn Things](https://www.youtube.com/watch?v=kzcI5F4tGiU):
probe the learner, plan and expose the dependency path, teach slowly, verify
sources, and continuously test understanding. dojofoo extends that session
pattern with authorable coverage graphs, durable learner evidence, course
modes, and cross-session continuity.

## Explorative assessment and navigation

An explorative Sensei should be able to:

1. Sample the curriculum to establish what the learner already understands.
2. Ask questions, inspect notes or code, and propose small exercises.
3. Record evidence for or against individual objectives.
4. Select the next useful concept from prerequisites, weaknesses, interests,
   and desired depth.
5. Reassess after time has passed instead of treating mastery as permanent.
6. Explain why it recommends a particular branch.

Assessment signals may include tests, explanations in the learner's own words,
worked examples, notebook revisions, generated examples, error diagnosis, and
successful application in a different context. Course authors decide which
signals are appropriate; dojofoo provides the common evidence model.

The learner should always be able to answer "I don't know." That is useful
calibration evidence, not a failed lesson.

## Mastery and curriculum coverage

A curriculum graph describes what can be learned; it does not by itself show
what the learner can retrieve, explain, or apply. Each dojo should therefore
be able to author an assessment contract alongside its curriculum:

- Observable outcomes for each objective, with optional weights and depth.
- Rubrics describing what constitutes partial and strong evidence.
- Diagnostic questions, exercises, transfer tasks, and misconception probes.
- Rules for which evidence types may establish or challenge mastery.
- Reassessment intervals for knowledge that should be retained over time.

For example, an objective might require the learner to recognize a concept,
explain it in their own words, apply it to a familiar problem, transfer it to
a novel problem, and retrieve it after a delay. These are separate dimensions;
a fluent explanation immediately after teaching should not imply durable
mastery.

The runtime should keep three layers distinct:

1. **Authored expectations** come from the dojo's objectives, rubrics, and
   probes.
2. **Learner evidence** points to attributable notebook passages, learner
   messages, answers, code, test results, revisions, and later recall.
3. **Derived assessment** records a mastery estimate, confidence, detected
   misconceptions, scorer and rubric versions, and the next useful probe.

An AI scorer can evaluate notes and interaction history, but its result must be
structured and auditable. Every claim should cite the evidence that supports or
contradicts it, distinguish mastery from confidence, and permit `insufficient
evidence`. Teacher-authored explanations do not become learner evidence merely
because they appear in the transcript; the learner must retrieve, transform,
explain, or apply the idea themselves. A fresh scoring pass should receive the
rubric and selected evidence without inheriting the teaching agent's desire to
declare its own lesson successful.

"Hidden tests" are pedagogically hidden probes, not secrets or a security
boundary. The learner should be able to see the objectives and understand how
progress is assessed, while answer keys and the next exact prompt can remain
unrevealed until attempted. Useful probe types include:

- Questions selected from an authored diagnostic bank.
- Novel transfer problems that cannot be answered by copying the notes.
- Counterexamples and misconception-specific distinctions.
- Delayed retrieval after the original teaching context is gone.
- Deterministic tests for code or other machine-checkable work.
- AI-generated variants checked against an authored rubric and constraints.

Objective state can move through `unseen`, `probing`, `learning`,
`demonstrated`, `retained`, and `needs-review`. Contradictory or stale evidence
can lower confidence and trigger reassessment without erasing the evidence
history. The UI may summarize curriculum coverage, but it should expose the
underlying dimensions, confidence, and evidence instead of presenting an
opaque course-completion percentage.

All scoring inputs and results remain local by default. A dojo may recommend a
model or scorer, but sending notes or transcripts to a remote model requires
the same explicit data controls as any other synchronization.

## Adaptive teaching methods

The Sensei may try methods such as:

- Socratic questioning.
- Formal or mathematical derivation.
- Visual explanation and diagrams.
- Analogy and concrete examples.
- Worked-example completion.
- Retrieval practice.
- Debugging or counterexample exploration.
- Implementation and experimentation.
- Teach-back in the learner's own words.

Dojofoo can maintain contextual weights for these methods—for example, formal
derivations may work well for algorithms while visual explanations help with a
particular geometry topic. Evidence should include the subject, difficulty,
assessment outcome, learner feedback, and confidence. The weights can be
updated continuously from questions, answers, revisions, transfer exercises,
and later recall—not merely from whether the learner clicked "understood."

Method selection should balance exploitation and exploration:

- Usually choose a method with strong evidence in the current context.
- Sometimes try the second-best method to keep gathering evidence.
- Occasionally introduce a more difficult or unfamiliar method when the
  subject is going well.
- Reduce confidence over time and after contradictory evidence.
- Always allow the learner to request or reject a method directly.

Percentages should represent uncertain, evolving evidence—not an identity or a
claim that a learner has one fixed style.

## Evolving learner notebook

Explorative courses should provide a shared notebook that follows the learner
through the curriculum and can itself influence where the exploration goes. It
can contain:

- Learner-written notes and questions.
- Sensei explanations and proposed corrections.
- LaTeX formulas and derivations.
- Diagrams, illustrations, and interactive components.
- Code snippets and experiment results.
- Links between notes and curriculum objectives.
- Open questions, misconceptions, and later revisions.
- Checkpoints that help a successor session continue on another machine.

Learner and Sensei authorship must remain distinguishable. The Sensei should
normally suggest or annotate corrections instead of silently rewriting the
learner's words. Notebook history should be recoverable, and the learner should
control what is committed to Git, synchronized, or kept only in
`~/.dojofoo`.

The notebook can become the portable continuation surface: when an exact native
agent session is unavailable, a new owned session can inspect the repository,
current curriculum state, and selected notebook checkpoints before continuing.

## Sessions and continuity

The local session model uses three ownership states:

- `external`: discovered transcript or session that dojofoo cannot control.
- `managed`: created elsewhere and successfully connected to dojofoo.
- `owned`: created by dojofoo and controlled from the beginning.

Dojofoo should resume an exact native session when it remains available. When
it does not, dojofoo should create an owned successor using portable repository
and notebook evidence. The ordinary experience should stay simple:

```sh
git pull
npx dojofoo ui
```

If the project includes `mise.toml`, dojofoo prepares its declared tools and
`setup` task before restoring or creating the learning session.

## Delivery path

### Foundation

- Durable local workspace, run, session, and event index.
- Disposable local daemon and course-selection UI.
- Native session discovery and AI SDK-compatible lifecycle pointers.
- `external`, `managed`, and `owned` session semantics.
- Optional mise-based project preparation.

### Portable continuation

- Make SQLite the source of truth for course, kata, and session associations.
- Reconcile native harness sessions at daemon startup.
- Resume exact sessions in another checkout on the same machine.
- Start an owned successor from repository and checkpoint context when exact
  restoration is unavailable.
- Keep private lifecycle state out of Git.

### Course-mode prototypes

- Add the versioned `mode` field without breaking existing kata manifests.
- Define an interactive chapter format for presentation, questions, Socratic
  follow-ups, answers, and rich components.
- Build one fixed-curriculum interactive dojo and validate authored navigation
  and assessment.
- Define the smallest useful curriculum graph schema.
- Build one explorative dojo with diagnostic, remediation, extension, and
  learner-led paths.
- Define a `mentor` project contract for briefs, milestones, artifacts, critique,
  reflection, and diminishing scaffolding.
- Build one `mentor` dojo that evaluates an evolving artifact and the learner's
  growing independence across multiple sessions.
- Define an authorable objective, rubric, and hidden-probe schema.
- Add an append-only evidence ledger with source and authorship references.
- Add a versioned scorer contract with cited evidence, confidence,
  misconceptions, and an `insufficient evidence` result.
- Add evidence-backed objective state, curriculum-coverage UI, and explainable
  next-node selection.
- Calibrate AI scoring against course-author examples and deterministic tests
  before using it to claim mastery.
- Test hidden-node authoring and reveal behavior.

### Notebook and adaptive Sensei

- Add a versioned notebook with learner/Sensei provenance.
- Render Markdown, code, LaTeX, and safe interactive components.
- Attach notebook entries and evidence to curriculum objectives.
- Track contextual teaching-method outcomes and confidence.
- Add controlled exploration, learner overrides, correction, and reset tools.

### Longer-term exploration

- Encrypted, opt-in synchronization across machines.
- Collaborative or teacher-reviewed courses without weakening local ownership.
- Course-author tooling for graph visualization and assessment simulation.
- Aggregate, privacy-preserving signals that help authors improve confusing
  lessons without uploading transcripts or personal learner models.

## Questions to answer through prototypes

- What is the smallest graph schema authors can use without building a full
  learning-management system?
- What common project schema can support code, writing, research, design, and
  performance without flattening their domain-specific review practices?
- How should a `mentor` course measure independence without withholding help the
  learner genuinely needs?
- Which assessment evidence can be normalized across mathematics, conceptual
  subjects, and programming?
- How should confidence decay, and when should the Sensei reassess mastery?
- How accurately can an AI scorer reproduce an author's rubric across models,
  and how should disagreement be surfaced?
- How do hidden probes avoid answer leakage and teaching narrowly to a test?
- Which transcript and notebook evidence should be retained, summarized, or
  deliberately excluded from scoring?
- Which notebook components can remain portable and safely render locally?
- How much adaptation is useful before it becomes surprising or opaque?
- What information is sufficient for a successor session without carrying a
  complete private transcript?
- How should learners inspect, correct, export, or delete their learning model?
