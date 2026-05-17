# SENSEI — stopping-criteria

## Briefing

### Goal

Implement three factory functions that produce stopping predicates
for a self-refinement loop. Each predicate takes the *history of
scores so far* and returns `True` when the loop should stop.

This isolates a question the chapter sweeps under the rug: **how do
you know you're done?** Listing 5.12 hard-codes "run exactly N
iterations." Real systems need cheaper or smarter stops.

### Tasks

Each factory returns a callable `should_stop(history: list[float]) -> bool`.

1. `stop_after_k(k: int)` — stop once the history has `>= k` scores.
   - `stop_after_k(3)([0.1, 0.5])` → `False`
   - `stop_after_k(3)([0.1, 0.5, 0.7])` → `True`
   - `stop_after_k(0)([])` → `True` (don't even start)

2. `stop_at_score(threshold: float)` — stop once the most recent
   score is `>= threshold`. Empty history → never stop (`False`).
   - `stop_at_score(0.9)([0.5, 0.8])` → `False`
   - `stop_at_score(0.9)([0.5, 0.9])` → `True`
   - `stop_at_score(0.9)([])` → `False`

3. `stop_if_no_improvement(patience: int)` — stop if `patience` or
   more entries have been appended *since the first occurrence of
   the global best*. "Improved" means *strictly greater than* the
   previous best.
   - count = `(len(history) - 1) - argmax_first(history)`. Stop iff
     `count >= patience`. Empty history → `False`.
   - `stop_if_no_improvement(2)([0.5, 0.6, 0.6, 0.6])` → `True`
     (best 0.6 first at idx 1; 2 non-improving entries follow)
   - `stop_if_no_improvement(2)([0.5, 0.6, 0.7])` → `False`
     (latest entry is a new best, count = 0)
   - `stop_if_no_improvement(2)([0.5])` → `False`
     (only one entry; count = 0 < patience)

### Hints

- Each factory is a closure. The returned function captures the
  parameter (`k`, `threshold`, or `patience`).
- For `stop_if_no_improvement`, walk the history once and track the
  index of the **first** occurrence of the best score so far. Stop
  when `len(history) - best_idx - 1 >= patience`. Use strict `>`
  when checking for a new best so that ties don't reset the counter.
- All three predicates take *only* the score history. They don't see
  the answer text or the prompt — keep the interface narrow.

## Prerequisites

- `refinement-loop` (the consumer of these predicates).
- `heuristic-scorer` (the source of the scores).

## References

- build-reasoning ch5 §5.8, listing 5.12 (the iterations parameter
  this kata generalizes).
- "Early stopping" in classical ML — same idea, different setting.

## Teaching Approach

Strong Socratic. The implementations are short; the *choice* of
criterion is the lesson.

### Socratic prompts (the meat of this kata)

- "Three criteria. For a *math problem with a verifier*, which one is
  best? Why?" → `stop_at_score(1.0)` (verifier returns 0/1; stop
  the instant we hit a verified answer).
- "For an *essay refined with a heuristic scorer*, which one? Why?"
  → `stop_if_no_improvement(patience=2)`. Heuristic scores plateau
  long before the essay is good; you want to detect "no signal left"
  without picking an arbitrary cutoff.
- "For a *cost-bounded production system* with a paying user, which
  one?" → `stop_after_k`. The other two have unbounded worst-case
  budget; only `stop_after_k` gives a hard cap on latency / spend.
- "When would you *combine* two criteria?" → almost always:
  `stop_after_k OR stop_at_score`. Hard cap + early exit.
- "`stop_if_no_improvement(0)` — what does that mean? Is it useful?"
  → It stops after a single non-improving step. Useful when each
  refinement is expensive and you trust the scorer to be monotone.
- "Why does `stop_at_score` return `False` on empty history?
  Wouldn't `True` be the safer default?" → Because empty history
  means we haven't *generated* an initial answer yet; stopping
  before generation is incoherent. `stop_after_k(0) = True` is the
  only exception, and it's a degenerate-by-design escape hatch.

### Common pitfalls

1. **Off-by-one in `stop_after_k`** — the spec is "history has `>=
   k` scores," not `> k`.
2. **Treating equal-to-best as "improved"** in
   `stop_if_no_improvement` — the spec is *strictly* greater. A
   plateau counts as no improvement.
3. **Crashing on empty history** — `max([])` raises. Guard against it.
4. **Reading the wrong index** in `stop_at_score` — use `history[-1]`,
   not `max(history)` (those are different criteria).

## On Completion

### Insight

These three predicates correspond to the three philosophies of
inference-time scaling. **`stop_after_k`** is the "fixed compute
budget" world — what every paper benchmarks with, because you need
apples-to-apples comparisons. **`stop_at_score`** is the
"verifier-driven" world — what self-consistency on math and what
code-with-tests both implicitly do. **`stop_if_no_improvement`** is
the "exploration with diminishing returns" world — what every RL
training loop uses for early stopping, and what self-refinement on
open-ended tasks needs but rarely gets.

The chapter chooses `stop_after_k` for didactic clarity. Real
systems choose mixtures. The DeepSeekMath-V2 critic-revise pipeline
(November 2025) uses verifier-driven stops for the math problems
where a verifier exists, and falls back to fixed-k for the rest.

### Bridge

`best-of-refined` puts a scorer + a stopping rule together with
parallel sampling. That's where you finally see the *budget*
question: given a fixed total of LLM calls, do you spend them on
*more samples* (best-of-N) or *more refinements per sample*
(deeper refinement)?
