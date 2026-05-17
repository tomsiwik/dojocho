# SENSEI — self-consistency-end-to-end

## Briefing

### Goal

Assemble the full self-consistency pipeline: call a sampler N times,
majority-vote the answers. The sampler is a generic callable so the
same function works for a mock or a real LLM.

### Tasks

1. Implement `self_consistency(mock_llm, prompt, n_samples)`.
2. Call `mock_llm(prompt, n_samples)` to get a list of candidates.
3. Majority-vote those candidates (same rule as kata 1).
4. `n_samples <= 0` -> `""`.

### Hints

- Reuse the `majority_vote` you wrote in the first kata. The pipeline
  is two lines: sample, vote.
- The mock's signature is `(prompt: str, n_samples: int) -> list[str]`.
  Don't try to call it once per sample; the mock is responsible for
  giving you all N.

## Prerequisites

- `majority-vote-aggregator` — voting logic.
- Concepts: temperature sampling (chapter 4, section 4.4) — why
  multiple samples differ in the first place.

## References

- Self-Consistency Improves Chain-of-Thought Reasoning in Language
  Models, Wang et al. 2022 — https://arxiv.org/abs/2203.11171
- Raschka, *Build a Reasoning Model From Scratch*, ch. 4.5

## Teaching Approach

**Method:** Demo + Socratic on the *why*. The implementation is small;
the insight is large.

### Socratic prompts

- "Majority voting beats single-shot accuracy. Why?" (Variance
  reduction. If the model gets it right >50% of the time, the modal
  answer across many samples converges to correct. This is the
  Condorcet jury theorem applied to LLM sampling.)
- "What is the necessary condition for self-consistency to help?" (The
  correct answer must be more likely than any single wrong answer. If
  the model is *systematically* wrong — e.g., misreads the problem the
  same way every time — voting cannot save it.)
- "What changes if you set temperature=0?" (All samples become
  identical; N=1 effectively. Self-consistency needs diversity to work.)
- "How does the cost scale?" (Linear in N. Doubling samples doubles
  inference cost. The accuracy gain does *not* scale linearly — see
  the next kata.)

### Common pitfalls

1. **Calling the mock N times instead of once with `n_samples=N`** —
   the signature is "give me N answers", not "give me one answer".
   This matters when the mock has internal state (RNG, batch
   counters).
2. **Forgetting to use your majority-vote** — re-implementing it here
   is correct code but a missed reuse opportunity. Real pipelines
   compose; so should yours.
3. **Edge case `n_samples=0`** — must return `""`, not crash.

## On Completion

### Insight

You implemented the protocol from one of the most-cited reasoning
papers of the 2020s (Wang et al., 2022). The whole technique fits in
two lines. The cleverness is not in the code — it's in the recognition
that **sampling variance is information**: when the model is uncertain,
its samples disagree; when it's confident, they agree. Majority voting
extracts that signal for free.

### Bridge

Final kata: `accuracy-vs-samples-sweep`. Now that the pipeline works,
measure *how* accuracy scales with N. Diminishing returns are the rule,
not the exception, and seeing the curve is the only way to choose N for
a real deployment.
