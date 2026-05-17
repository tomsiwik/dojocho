# SENSEI — win-rate-with-ci

## Briefing

### Goal

Given outputs from two models on the same prompts plus a judge
function, compute the **win rate of A over B with a 95% bootstrap
confidence interval**.

The win rate alone is meaningless. "A wins 60%" with `n=10` is
indistinguishable from random; with `n=10000` it's decisive. The
confidence interval is what turns "A wins 60%" into a publishable
claim — or kills it.

### Tasks

Implement `win_rate(model_a_outputs, model_b_outputs, judge) -> dict`:

- `model_a_outputs` and `model_b_outputs` are aligned lists. Each
  element is a tuple `(question, response, reference)`.
- `judge(question, response, reference) -> int` returns a 1-5 score
  (use the `llm-judge-mock` kata's `judge`, or any callable with
  this signature).
- For each prompt index `i`:
  - score `A` = `judge(*model_a_outputs[i])`
  - score `B` = `judge(*model_b_outputs[i])`
  - if `A > B`: win for A
  - if `A < B`: loss for A (win for B)
  - if `A == B`: tie
- Compute:
  - `wins`, `losses`, `ties` (ints; ties not counted in win rate)
  - `win_rate = wins / (wins + losses)` (0 if no decisive matches)
  - `ci_low`, `ci_high`: 95% bootstrap CI over the per-prompt
    outcomes (use 10,000 resamples, percentile method).
- Use `random.Random(seed)` with `seed=0` for the bootstrap so
  results are reproducible.

Return a dict:
```
{
  "wins": int, "losses": int, "ties": int,
  "win_rate": float,
  "ci_low": float, "ci_high": float,
}
```

### Hints

- Convert each prompt to a per-prompt outcome in `{1.0, 0.5, 0.0}`
  (win/tie/loss for A). Then `win_rate = mean(decisive_outcomes
  after dropping ties)` — but for the bootstrap **resample the
  full list including ties** so the CI reflects the real outcome
  distribution.
- For each bootstrap iteration: sample `n` outcomes with
  replacement, recompute win rate over decisive matches in the
  resample. Collect 10,000 such estimates.
- 95% percentile CI: the 250th and 9750th values of the sorted
  bootstrap estimates.
- 10,000 resamples × ~1000 prompts × pure Python is fast enough
  (<2s for typical kata test sizes — keep your tests at n ≤ 200).
- `random.choices(outcomes, k=n)` is the per-iteration sampler.

## Prerequisites

- Kata: llm-judge-mock (for a sample `judge` to feed in).
- Kata: exact-match-and-f1 (for the metric idea).

## References

- Appendix F.4 / F.5 (build-reasoning) — leaderboard and judge
  context.
- Efron & Tibshirani (1993). *An Introduction to the Bootstrap*.
- Dror et al. (2018). "The Hitchhiker's Guide to Testing Statistical
  Significance in Natural Language Processing." — why every NLP
  comparison needs a CI.

## Teaching Approach

**Kata + Socratic on the CI.** The bootstrap is the punchline; the
score-keeping is the warmup.

### Socratic prompts

- "Model A wins on 60 out of 100 prompts. Is A 'better'? What if it
  were 60 out of 10000? 60 out of 6?" (The point: a number without
  a CI is rhetoric, not evidence. 60/100 has CI roughly [50, 70];
  60/10000 has CI roughly [59, 61]; 6/10 is essentially uninformative.)
- "Why bootstrap instead of a closed-form binomial CI?" (Bootstrap
  works for any statistic — win rate, mean judge score, win rate
  excluding ties, etc. The closed form changes for each. Bootstrap is
  one tool.)
- "10,000 resamples is the standard. Why not 100? Why not 1,000,000?"
  (100 gives noisy CI bounds — the percentile estimates themselves
  have ~10% jitter. 10,000 gets the percentile error well under 1%.
  Beyond that, returns diminish — and your runtime grows linearly.)
- "Your bootstrap CI is [55%, 65%] and includes 50%. What's the
  honest write-up?" (We cannot reject the null of equal models at
  the 95% level. The leaderboard story would be 'no significant
  difference'.)
- "Ties: should they count as half-wins, drop, or be their own
  bucket?" (Each convention answers a different question. Half-wins:
  'when forced to pick, A wins X%.' Drop ties: 'among decisive
  matches.' Separate bucket: lets the reader see how often the judge
  was indifferent. The right answer depends on what you're reporting
  on a leaderboard — be explicit.)
- "Bootstrap assumes the data is iid samples from the true
  distribution. When does this break for LLM evals?" (Prompt
  selection — if your test set isn't representative, the bootstrap
  CI is over the *test set*, not the population. The bootstrap can't
  fix a bad test set.)

### Common pitfalls

1. **Not seeding `random`** — tests will be flaky. Always use
   `random.Random(seed)`, never the module-level `random`.
2. **Dividing by total instead of decisive** — `win_rate = wins / n`
   conflates ties with losses. Use `wins / (wins + losses)` and
   report ties separately.
3. **Resampling decisive outcomes only** — wrong; you'd
   underestimate variance. Resample the full list (including ties),
   compute win rate over decisive matches *in the resample*.
4. **Percentile indices off-by-one** — for 10000 sorted samples,
   the 95% CI is the 250th (2.5%) and 9750th (97.5%) values.
   Document your indexing convention.

## On Completion

### Insight

You now have the minimum-viable evaluation pipeline: judge → win
rate → CI. This is what every LLM eval blog post should report and
many don't. A 60% win rate with CI [58, 62] is a real result. A
60% win rate with CI [45, 75] is a hot take.

The bootstrap also tells you when to stop: if your CI is wider than
the difference you're trying to detect, run more prompts. If it's
narrower and includes 50%, the models are tied at your prompt scale,
period.

### Bridge

This is the last kata of appendix F. Putting it together: F.2/F.3
(benchmarks) give you accuracy; F.4 (leaderboards) gives you
rankings; F.5 (LLM judges) gives you scalable opinions; this kata
gives you the **statistical wrapper** that turns any of them into a
defensible claim.
