# SENSEI — accuracy-vs-samples-sweep

## Briefing

### Goal

Measure how accuracy scales with N (the number of samples per problem)
under majority voting. Return the accuracy curve as a list of floats —
one per N in `1..max_n`. This is the empirical version of figure 4.2 in
the chapter.

### Tasks

1. Implement `accuracy_sweep(mock_llm, problems, max_n)`.
2. For each `n` in `1..max_n`, run self-consistency on every problem
   and compute fraction-correct.
3. Return a list of length `max_n`.
4. Edge cases: `max_n == 0` -> `[]`; empty `problems` -> list of zeros.

### Hints

- You already wrote self-consistency (sample + majority-vote). Inline
  it or import; either works.
- For each problem at each N, call `mock_llm(prompt, N)` once, vote,
  compare to gold.
- The outer loop is `for n in range(1, max_n + 1)`. Don't off-by-one.

## Prerequisites

- `self-consistency-end-to-end` — you'll call this internally.
- `majority-vote-aggregator` — the voting primitive.

## References

- Self-Consistency paper, Wang et al. 2022 — fig. 2 shows the same kind
  of curve on real benchmarks: https://arxiv.org/abs/2203.11171
- Raschka, *Build a Reasoning Model From Scratch*, ch. 4.5 / 4.6

## Teaching Approach

**Method:** Kata + Socratic on diminishing returns. The student writes
a small function; the *interpretation* is the lesson.

### Socratic prompts

- "Doubling samples should double accuracy gain. Does it? Why does it
  plateau?" (Variance reduction goes as `1/sqrt(N)`, not `1/N`. Once
  the modal answer is stable, more samples just confirm it. Also: any
  systematic error — same misreading every time — *cannot* be voted
  away.)
- "If the per-sample correct rate is 0.3, what does N=infinity
  accuracy approach?" (Zero — or whatever the modal *wrong* answer
  is. Voting only saves you when correct is the modal answer.)
- "How would you decide N for a deployment?" (Look at the elbow of the
  curve. Common practical choice is N=8 or N=16; rarely more than 64.
  Past the elbow you're paying for marginal accuracy.)
- "What would change if you used best-of-N with a verifier instead?"
  (Different curve shape — depends on verifier accuracy. Can keep
  climbing past where majority-vote plateaus, *if* the verifier is
  good.)

### Common pitfalls

1. **Off-by-one** — `range(1, max_n + 1)`, not `range(max_n)`.
2. **Treating the result list as N=0..N=max_n-1** — it's
   `N=1..N=max_n`. Document it; the test cares.
3. **Calling `mock_llm(prompt, 1)` N times instead of `mock_llm(prompt,
   N)` once** — these are *different* if the mock has an RNG; the
   second is what self-consistency expects.
4. **Dividing accuracy by `len(problems)` when `problems` is empty** —
   `ZeroDivisionError`. Return zeros explicitly.

## On Completion

### Insight

You've measured the scaling law of self-consistency on a toy problem.
The shape — a rapid climb, then a plateau — is exactly the shape you
see on MATH-500, GSM8K, and every other reasoning benchmark in the
literature. The numerical values differ; the curve shape is universal.

This is why production systems usually fix N at 8 or 16: that's around
the elbow. Going to 64 or 128 buys a few accuracy points at 4x-8x the
cost. Best-of-N with a good reward model can keep climbing where
majority-vote plateaus — but that requires investing in the reward
model.

You have now built every component of inference-time scaling that
chapter 4 covers, except temperature sampling itself (which is a
PyTorch logits-manipulation kata, not a pure-stdlib one). The next
chapter covers self-refinement: instead of voting across independent
samples, the model reads its own answer and revises it.

### Bridge

Chapter 5 (`build-reasoning` ch. 5) introduces *iterative self-refinement* —
the third inference-time method from figure 4.3. Same goal (better
answers), different mechanism (sequential, not parallel).
