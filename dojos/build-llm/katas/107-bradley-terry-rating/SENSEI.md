# SENSEI — bradley-terry-rating

## Briefing

### Goal

Implement the **Bradley-Terry model**, the statistical method that
replaced Elo on LM Arena. Given a pairwise win matrix, fit
**strengths** `π_i` such that the predicted win probability of model
`i` over model `j` is `π_i / (π_i + π_j)`.

You'll use the **MM (minorization-maximization) iteration** from
Hunter (2004) — five lines per iteration, no derivatives, guaranteed
to converge to the global MLE on connected comparison graphs.

### Tasks

Implement `bradley_terry(pairwise_wins, iterations=20) -> dict[str, float]`:

- `pairwise_wins` is a dict mapping `(winner, loser) -> count`.
- Return a dict mapping each model to its **log-strength**
  (`math.log(π)`).
- Normalize log-strengths so they sum to zero (this is the standard
  identifiability fix — strengths are only defined up to a positive
  scalar).

The MM update (Hunter 2004, equation 4) is:

```
π_i_new = W_i / sum_j ( N_ij / (π_i + π_j) )
```

where:
- `W_i` = total wins by model `i`
- `N_ij` = total games between `i` and `j` (in either direction)
- the sum is over all `j != i` that have played `i`

Initialize all `π_i = 1.0` and iterate.

### Hints

- Collect the unique model set from the keys of `pairwise_wins`.
- Build `wins[i]` (sum of wins) and `games[(i,j)]` (symmetric: count
  of all matches between i and j regardless of who won).
- The denominator only sums over opponents `j` who actually played
  `i` — skip pairs with `N_ij = 0`.
- After the loop, take `log(π_i)` and subtract the mean log-strength
  to center.

## Prerequisites

- Kata: elo-rating (for the rating-system mental model).

## References

- Hunter, D. R. (2004). "MM algorithms for generalized Bradley-Terry
  models." Annals of Statistics 32(1).
- LM Arena methodology:
  https://lmsys.org/blog/2023-12-07-leaderboard/
- Appendix F.4 (build-reasoning) — discusses the Elo → BT transition.

## Teaching Approach

**Worked example + Socratic on the BT vs Elo trade-off.** The
algorithm is short but unfamiliar; the *why* is the lesson.

### Socratic prompts

- "Elo updates after each match. BT fits the full matrix at once.
  When does the order-dependence of Elo become a real problem?"
  (Answer: small comparison counts per pair; tournaments with
  late upsets; reproducibility — same data, different order →
  different ratings.)
- "BT gives you a likelihood you can take derivatives of.
  What does that buy you?" (Confidence intervals via bootstrap or
  Fisher information; hypothesis tests; principled handling of
  unequal sample sizes.)
- "Your MM iteration converges. What does that mean *geometrically*?"
  (The MM construction guarantees the surrogate is tangent from
  below to the log-likelihood — each iterate weakly increases it.
  Convergence is monotonic, no learning rate to tune.)
- "Why normalize the log-strengths to sum to zero?" (BT is invariant
  under `π_i → c * π_i` for any positive `c`. You need to fix the
  scale to compare runs.)
- "BT and Elo both rank models on a transitive scale. What real-world
  preference data does this *fail* to capture?" (Rock-paper-scissors
  cycles; user populations with conflicting tastes; prompt-dependent
  strengths. Both methods collapse a tensor of `(model, model, user,
  prompt-type) -> preference` into a single number per model.)

### Common pitfalls

1. **Forgetting symmetric N_ij** — if `("A","B")` has 3 wins and
   `("B","A")` has 2 wins, then `N_AB = N_BA = 5`. The MM update
   uses the total game count between the pair.
2. **Zero in denominator** — if model i has zero opponents, BT is
   undefined. Tests assume every model has played at least one match.
3. **Drift in scale** — without normalization, log-strengths drift
   each iteration. Center *after* the loop, not during.

## On Completion

### Insight

You now have the statistical engine behind the modern LM Arena
leaderboard. Bootstrap the MM fit 1000 times over resampled votes
and you have 95% CIs on every model rating — that's what "BT lets
us express uncertainty" actually means in practice. Confidence
intervals are what made the LM Arena team switch from Elo.

### Bridge

Next: **llm-judge-mock** — when you can't get enough human votes to
fill the comparison matrix, you outsource judging to another LLM.
Cheap, fast, biased in interesting ways.
