# SENSEI — weighted-majority

## Briefing

### Goal

Extend majority voting to weighted voting. Each candidate carries a
confidence (a float). Sum the weights per answer; the largest sum wins.
Ties broken alphabetically.

### Tasks

1. Implement `weighted_majority(items)` where `items` is a list of
   `(answer, weight)` tuples.
2. Empty input -> `""`.
3. Same alphabetical tie-break rule as plain majority.

### Hints

- `defaultdict(float)` accumulates weights cleanly.
- Same sort key as the previous kata works here, just with summed
  weights instead of counts.

## Prerequisites

- `majority-vote-aggregator` — same shape of problem.

## References

- Self-Consistency paper, "weighted sum decoding" variant —
  https://arxiv.org/abs/2203.11171
- Raschka, *Build a Reasoning Model From Scratch*, ch. 4

## Teaching Approach

**Method:** Constraint variation on the previous kata. Light Socratic on
where the weights come from.

### Socratic prompts

- "Where would real weights come from? List three sources." (Answer:
  log-probability of the sequence, a learned verifier score, a heuristic
  like answer-length, an ensemble vote count from a different model.)
- "If you weight by answer length, what assumption does that encode?"
  (Longer = more reasoning = more right. Sometimes true. Often not —
  see 'overthinking' in chapter 4.)
- "What happens when one weight dominates all others? Is that a
  feature or a bug?"

### Common pitfalls

1. **Using `Counter`** — Counter is integer-only. Use a plain dict or
   `defaultdict(float)`.
2. **Normalizing weights** — don't. Normalization changes nothing about
   the argmax, so it's wasted work *and* extra floating-point error.
3. **Strict equality on floats** — when two sums are "tied", they may
   differ by 1e-17. The test allows either answer in the float-precision
   case; in real eval code, round before comparing.

## On Completion

### Insight

You just generalized self-consistency. Plain majority is the special
case where every weight is 1. Weighting by per-sample
log-probability is the recipe in many production decoders — the model
literally tells you how confident it is, and you let confident samples
count more. The risk: a model that is *confidently wrong* gets amplified.

### Bridge

Next kata: `best-of-n-with-verifier`. Instead of voting at all, what if
you pick the single best candidate using a separate scoring function?
That's "best-of-N", and it's the other major branch of inference-time
scaling.
