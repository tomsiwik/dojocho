# SENSEI — best-of-refined

## Briefing

### Goal

Combine the three previous katas. Given a list of generator
functions (each models a different sampling configuration of the
same LLM), run each one *with refinement*, score the final answers,
and return the best.

This is the natural extension of build-reasoning §5.8 (self-refinement
loop) crossed with §5.7 / Exercise 5.2 (Best-of-N selection). It is
also the moment you confront the **inference budget question** — see
the bridge below.

### Tasks

Implement:

```python
def best_of_refined(
    prompt: str,
    generate_fns: list[Callable[[str], str]],
    scorer: Callable[[str], float],
    n_refine: int = 3,
) -> str
```

For each `gen` in `generate_fns`:

1. `answer = gen(prompt)` — initial draft.
2. Refine the answer `n_refine` times by calling `gen(answer)`
   on each pass. (We collapse "critic + reviser" into a single
   generator that takes its previous output as the new prompt —
   a common simplification when one model plays both roles.)
3. Score the final answer with `scorer`.

Return the answer with the highest score across all generators.
Ties: return the first one (stable selection).

### Hints

- For each generator, you do `1 + n_refine` calls total: one for
  the draft, then `n_refine` refinement passes.
- The signature `scorer(answer) -> float` matches the keyword-only
  scorers from `heuristic-scorer`.
- `max(candidates, key=lambda x: x[1])` is Python's stable argmax.
- Don't import from `refinement-loop` — re-roll the loop here. It's
  three lines and katas should be self-contained.

## Prerequisites

- `refinement-loop` (the refinement skeleton).
- `heuristic-scorer` (a scorer to plug in).
- `stopping-criteria` (the conceptual cousin — this kata uses a fixed
  `n_refine` instead of an early-stop, which is itself a teaching
  point).

## References

- build-reasoning ch5 §5.7 / §5.8.
- build-reasoning ch4 (self-consistency / best-of-N — this is the
  refinement-flavored version of that idea).
- Wang et al., "Self-Consistency Improves CoT" (2022) — the
  best-of-N family this kata extends.

## Teaching Approach

Kata + a Socratic line on the budget trade-off.

### Socratic prompts (the punch line)

Pose this *after* the tests pass:

- "You have a budget of **12 LLM calls** for one prompt. Which is
  better: best-of-12 with no refinement (`n_refine=0`, 12 generators),
  or best-of-4 with 2 refinement passes each (`n_refine=2`, 4
  generators → 4 × 3 = 12 calls), or 1 generator with 11 refinement
  passes? What does 'better' depend on?"
- "On MATH-500 (ch5 table 5.1), self-refinement gives +5-10% accuracy.
  Self-consistency (ch4) on the same task gives more, for the same
  cost. Why? Hint: think about *diversity* of samples."
- "Best-of-N has a known scaling law: accuracy ∝ log(N) until the
  reward model saturates. What's the analogous law for refinement
  depth? (Open question, no clean answer in the literature.)"
- "Your `scorer` is heuristic — say, `score_boxed_format`. Now
  every generator that doesn't produce a boxed answer scores 0 and
  ties. What's the failure mode of `max()` with many zero-score
  candidates?" → Goodhart again, plus the case for richer scorers.

### Common pitfalls

1. **Off-by-one on `n_refine`** — `n_refine=0` should run each
   generator exactly once (just the draft, no refinement). The total
   call count per generator is `1 + n_refine`.
2. **Threading the original prompt** — after the draft, the
   generator's input is the previous *answer*, not the original
   prompt. (This is a simplification of the critic+reviser pattern.)
3. **Unstable tie-breaking** — `max` over a list of `(answer, score)`
   tuples sorts by full tuple, not just score, and may break ties
   by answer string. Use `key=` to pin to the score, and rely on
   `max`'s left-to-right stability.
4. **Returning the highest-scoring intermediate** — only the final
   answer per generator competes for "best of refined." Intermediate
   refinement steps are discarded.

## On Completion

### Insight

You wrote a tiny version of the **two-axis inference-time scaling
plane**: width (N parallel samples) × depth (K refinement steps per
sample). Every paper in this space picks a point on that plane.
Self-consistency lives at (high N, K=0). Self-Refine lives at
(N=1, high K). DeepSeekMath-V2 lives at (moderate N, moderate K,
with a trained critic). OpenAI o1 lives at (1, very high K, with a
hidden CoT scorer).

The 2025 picture is: **width without diversity is wasted**, and
**depth without a good scorer drifts**. Your `best_of_refined`
demonstrates both failure modes when you swap in toy generators —
which is exactly what the SENSEI prompts above push the student to
discover.

### Bridge

You've now built every piece of section 5.8 except the actual LLM.
Plug `transformers.AutoModelForCausalLM.generate` into `generate_fns`
and `avg_logprob_answer` (listing 5.8) into `scorer` and you have
the production-shape version of the chapter's `self_refinement_loop`.

Chapter 6 of build-reasoning leaves inference-time scaling behind
and starts modifying model weights via RL. The scorers from this
chapter come back there as the *reward model*. Goodhart's Law gets
a lot more dangerous when the reward shapes the gradient.
