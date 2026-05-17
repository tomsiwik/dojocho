# SENSEI — refinement-loop

## Briefing

### Goal

Build the core control loop of Self-Refine (Madaan et al., 2023): take
an initial answer, run a critic over it, hand answer+critique to a
reviser, and repeat up to `n_max` times. This is the skeleton of
section 5.8 in build-reasoning — every later acceptance rule and
scorer plugs into this shape.

### Tasks

Implement `refine(initial_answer, critic, reviser, n_max=5) -> str`:

1. Start with `answer = initial_answer`.
2. For up to `n_max` rounds:
   - `critique = critic(answer)` (returns a `str`)
   - `answer = reviser(answer, critique)` (returns a new `str`)
3. Return the final answer.

`critic` and `reviser` are arbitrary callables — in production they
would be LLM calls; here they are plain Python functions you supply
in tests.

### Hints

- `n_max` is a budget, not a quality gate. This kata has no scoring
  and no early stopping — that's deliberate. Stopping criteria come
  in the next kata.
- The loop body has exactly two calls. Don't overthink it.
- `n_max=0` should be a no-op — return the initial answer unchanged.

## Prerequisites

- None beyond Python basics. No torch, no LLM.

## References

- build-reasoning ch5 §5.8 (`self_refinement_loop`, listing 5.12)
- Madaan et al., "Self-Refine: Iterative Refinement with
  Self-Feedback" (2023) — https://arxiv.org/abs/2303.17651

## Teaching Approach

Worked example first, then Socratic on the failure mode.

### Worked example

Walk through one iteration with the student before they write code:

```
initial = "answer is 7"
critique = critic("answer is 7")   # "missing units"
revised  = reviser("answer is 7", "missing units")  # "answer is 7 meters"
```

Then ask: "Now do it again on `revised`. What's the loop?"

### Socratic prompts

- "Will refinement always improve the answer? Suppose the model is
  already correct on iteration 0. What can iteration 1 do to it?"
- "If `critic` is a fixed LLM prompt, can it run out of things to
  say? What does that look like in your output?"
- "Look at table 5.1 in the chapter. Rows 2 vs 3: same setup, 1 vs 2
  iterations. Accuracy went 25.0% → 22.0%. Why?"
- After it works: "What's the smallest change that turns this into the
  loop in listing 5.12?" (Answer: add a scorer + acceptance test.)

### Common pitfalls

1. **Calling `critic` once outside the loop** — the critique must be
   re-computed on each iteration's new answer.
2. **Forgetting to overwrite `answer`** — `reviser` returns the new
   answer; the loop variable must be reassigned.
3. **Treating `n_max=0` as `n_max=1`** — `range(0)` is empty; the
   initial answer must pass through unchanged.

## On Completion

### Insight

You wrote the **outer loop** of every self-refinement system in the
literature. Self-Refine, Reflexion, CRITIC, and the DeepSeekMath-V2
critic-revise pipeline all share this skeleton; what differs is the
prompt template for `critic`, the model used for `reviser`, and
crucially, the stopping/acceptance rule layered on top. This kata
gives you zero of those. The next three katas give you each one in
isolation.

### Bridge

`heuristic-scorer` builds the score function that decides "is the
revised answer better?" — the thing your loop is currently missing.
After that, `stopping-criteria` adds the "when do we quit early?"
logic, and `best-of-refined` combines scoring + refinement across
parallel samples.
