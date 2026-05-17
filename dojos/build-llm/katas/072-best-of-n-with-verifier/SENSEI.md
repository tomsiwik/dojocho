# SENSEI — best-of-n-with-verifier

## Briefing

### Goal

Implement Best-of-N selection: from N candidate answers, pick the one a
*verifier* function scores highest. Ties resolve to the first
candidate (stable argmax). The verifier is your contract with the
caller — they pass any callable `str -> float`.

### Tasks

1. Implement `best_of_n(candidates, verifier)`.
2. Empty `candidates` -> `""`.
3. Tie at the top -> earliest candidate wins.
4. Call the verifier exactly once per candidate.

### Hints

- `max()` with `key=` is one-liner territory. Read the docs on tie
  behavior — it returns the *first* max, which is exactly what you want.
- Pre-compute scores in a list-comprehension if you find that clearer;
  same time complexity either way.

## Prerequisites

- `majority-vote-aggregator` and `weighted-majority` — same family of
  selectors, different mechanism.

## References

- "Best-of-N" / "rejection sampling" in the RLHF literature.
- OpenAI WebGPT (Nakano et al., 2021), which popularized verifier-guided
  best-of-N — https://arxiv.org/abs/2112.09332

## Teaching Approach

**Method:** Strong Socratic. The interesting question isn't "how do you
implement argmax"; it's "when does best-of-N beat majority voting, and
when does it catastrophically fail?"

### Socratic prompts

- "Best-of-N strictly dominates single-sample IF... what?" (The
  verifier is at least as accurate at ranking as the model is at
  generating. If the verifier is wrong, more samples mean more
  opportunities for it to mislead you.)
- "When does best-of-N fail catastrophically?" (Adversarial / Goodhart:
  the model finds candidates that score high under the verifier but are
  actually wrong. Classic reward-hacking.)
- "Self-consistency vs. best-of-N: which would you choose for math?
  For creative writing? Why?" (Math: self-consistency — multiple
  reasoning paths often converge on the same correct answer. Creative:
  best-of-N with a quality verifier — no "correct" answer to vote on.)
- "Why does the test require stable tie-breaking by input order?"
  (Reproducibility. With a sampler that returns candidates in a
  deterministic order, you want the *whole* pipeline deterministic.)

### Common pitfalls

1. **Calling the verifier twice per candidate** — `max(candidates,
   key=v)` calls it once; a hand-rolled "compute scores, then look up
   winner" pattern can accidentally call twice if done wrong.
2. **Using `>` instead of `>=`** for the running-max — that gives
   *first* on tie (correct). `>=` gives *last* (wrong here).
3. **Conflating verifier score with probability** — verifiers can
   return any real number; don't normalize.

## On Completion

### Insight

Best-of-N and self-consistency are the two pillars of inference-time
scaling. They make different bets:

- **Self-consistency**: "the model's right answer is also its modal
  answer." Cheap, no extra components, works when reasoning paths
  converge.
- **Best-of-N**: "I trust an external scorer more than I trust the
  model's frequency." Requires a verifier — a learned reward model, a
  unit-test runner, an exact-match check. When the verifier is good,
  this destroys self-consistency. When it isn't, you get
  reward-hacking.

### Bridge

Next kata: `self-consistency-end-to-end`. Glue the sampler (mock LLM)
and the aggregator together into the actual self-consistency pipeline.
You've built every piece; time to assemble.
