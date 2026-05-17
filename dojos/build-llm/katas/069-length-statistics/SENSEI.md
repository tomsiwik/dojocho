# SENSEI — length-statistics

## Briefing

### Goal

Compute basic length statistics over a batch of model responses so
that you can pair them with the accuracy numbers from kata 4. The
unspoken question of chapter 3 (and chapter 4, on inference-time
scaling): **does longer reasoning actually pay off?**

This kata uses **character lengths**, not token counts. Token counts
require a tokenizer — a separate kata in the build-llm dojo.

### Tasks

Implement `length_stats(responses) -> dict` returning:

- `n` — count of responses
- `mean` — arithmetic mean (float)
- `min`, `max` — int extremes (use `len`)
- `median` — middle value for odd n, average of two middles for even n
- `p90` — 90th percentile via linear interpolation between order
  statistics:
  - Sort the lengths.
  - Compute `rank = 0.9 * (n - 1)` (a float in `[0, n-1]`).
  - If `rank` is an integer, return `xs[rank]`.
  - Otherwise interpolate:
    `xs[floor(rank)] + (rank - floor(rank)) * (xs[ceil(rank)] - xs[floor(rank)])`.

Empty input returns all-zero stats (see solution.py docstring).

### Hints

- `statistics.median` does exactly what you want for median.
- `statistics.mean` likewise; or roll it: `sum(xs) / len(xs)`.
- For p90, `math.floor` and `math.ceil` on a float rank.
- Convert to a sorted list first; don't recompute it.
- Stdlib only — no numpy.

## Prerequisites

- `accuracy-on-mini-math` (you'll pair these stats with accuracy
  later).
- Knowledge that "median" and "percentile" are different things.

## References

- Raschka, *Build a Reasoning Model (From Scratch)*, ch. 3.8 and
  ch. 4 — length-vs-accuracy trade is a recurring theme.
- `statistics` module: https://docs.python.org/3/library/statistics.html

## Teaching Approach

**Method:** demo + Socratic.

### Demo

Run mentally: model A averages 200 chars per response, gets 40%
accuracy. Model B averages 2000 chars, gets 50% accuracy. Same dataset.

- **Accuracy delta:** +10 points.
- **Length multiplier:** 10×.
- **Cost-per-correct-answer:** A is `200 / 0.40 = 500` chars/correct;
  B is `2000 / 0.50 = 4000` chars/correct. **Model B is 8× more
  expensive per correct answer.**

Is model B "better"? Depends entirely on your cost model.

### Socratic prompts

- "When is +10 accuracy at 10× tokens worth it? When isn't it?"
- "Reasoning models are *defined* by the length trade. Why does the
  chapter 4 technique (test-time scaling) make this trade explicit?"
- "Why might p90 matter more than mean for serving costs?" (Hint:
  request timeout, batch SLA.)
- "Could two distributions have the same mean but vastly different
  p90s? Sketch an example."

### Common pitfalls

1. **Integer division for mean.** Python 3 doesn't, but if you write
   `sum(xs) // n` you get one anyway.
2. **Off-by-one in p90 rank.** `0.9 * n` is wrong; use `0.9 * (n - 1)`
   so the max value sits at `rank = n - 1`.
3. **Sorting in place** with `.sort()` instead of using `sorted()`
   when the caller might re-use the list.
4. **Not handling n = 1.** All stats collapse to the single value;
   p90 with rank 0 should just be that value.

## On Completion

### Insight

You've now built both axes of the evaluation chart: accuracy (kata 4)
and cost (this kata). Every reasoning-model paper from here on plots
one against the other. When you see "Model X achieves 60% on AIME
with 8k tokens", what you're looking at is one point on this plane.
Chapter 4 (inference-time scaling) generates more points by letting
the model think longer; chapter 6 (GRPO) tries to push the whole
frontier up and to the left.

### Bridge

You've completed the build-reasoning chapter 3 evaluation pipeline:
extract → normalize → match → aggregate → measure cost. Chapter 4
plugs in compute knobs (best-of-n, longer thinking budgets) and asks
the chart to bend. You now have the tools to know whether it did.
