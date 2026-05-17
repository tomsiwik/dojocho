# SENSEI — elo-rating

## Briefing

### Goal

Implement the Elo update — the single function behind chess ratings,
LM Arena (until 2024), and almost every online ranking system. It's
two lines of math wrapped in a logistic expected-value formula.

### Tasks

Implement `update_elo(rating_a, rating_b, result_a, k=32) -> (new_a, new_b)`:

- `result_a` is the outcome from A's perspective: `1` (A won),
  `0` (A lost), `0.5` (draw).
- `expected_a = 1 / (1 + 10**((rating_b - rating_a) / 400))`
- `new_a = rating_a + k * (result_a - expected_a)`
- `new_b = rating_b + k * ((1 - result_a) - (1 - expected_a))`
- Note: the update is **zero-sum** — what A gains, B loses.

Return `(new_a, new_b)` as floats.

### Hints

- The `400` and base `10` are conventions from chess; they set the
  scale so that a 400-point gap implies the favorite wins 10:1.
- `k` is the **sensitivity**: higher `k` means each match moves
  ratings more. Chess uses `k=32` for casual play, `k=10` for masters.
- The expected score is symmetric: `expected_b = 1 - expected_a`. You
  don't need to recompute it.

## Prerequisites

None — pure stdlib arithmetic.

## References

- Elo, A. E. (1978). *The Rating of Chess Players, Past and Present*.
- Appendix F.4 (build-reasoning) — listing F.4 shows the same update
  inside an aggregation loop.
- LM Arena's original Elo implementation:
  https://lmsys.org/blog/2023-05-03-arena/

## Teaching Approach

**Worked example.** Four-line function; do it, then poke at the
mechanics.

### Socratic prompts

- "Two new players (both rated 1000) play. A wins. What are the new
  ratings?" (Expected = 0.5; new_a = 1016, new_b = 984. The +16 / -16
  symmetry is the whole game.)
- "Same two players, but A is rated 1600 and B is rated 1000. A wins
  (the favorite). Compute by hand." (Expected_a ≈ 0.97; new_a ≈
  1601, new_b ≈ 999. The favorite gains ~1 point.)
- "Now B (rated 1000) beats A (rated 1600). Compute." (Expected_a ≈
  0.97; result_a = 0; new_a ≈ 1569, new_b ≈ 1031. The upset is worth
  ~31 points to B.)
- "What happens if you set `k = 0`? `k = 400`? Why does competition
  ELO use small k?" (k=0 → no learning. k=400 → wild oscillation;
  one game dominates history. Small k is the stable, slow-update
  regime preferred when you trust the prior rating.)
- "Elo updates incrementally; Bradley-Terry fits the whole matrix at
  once. When is each the right tool?" (Elo: streaming votes, real-time
  leaderboards, can't store full history. BT: offline analysis,
  want confidence intervals, comparison graph might be sparse but
  static.)

### Common pitfalls

1. **Wrong sign for `result_b`** — `result_b = 1 - result_a`, not
   `-result_a`. A draw is `result_a = 0.5`, `result_b = 0.5`.
2. **Forgetting `400` and base `10`** — using `e` and `100` works
   mathematically but gives non-standard ratings. Stick to the chess
   convention for compatibility.
3. **Mutating in place** — return new floats; don't modify a shared
   dict from inside this function.

## On Completion

### Insight

You have the rating loop. To turn this into a leaderboard, you just
run it over a stream of `(winner, loser)` pairs and read out the
final ratings dict — that's listing F.4 in appendix F. Three caveats
the algorithm itself doesn't warn you about: (1) **order matters**
(early upsets shape later updates), (2) **the comparison graph must
be connected** (isolated models drift), (3) **the rating system is
transitive** — it can't represent rock-paper-scissors preferences.
Bradley-Terry fixes (1); nothing in this family fixes (3).

### Bridge

Next: **bradley-terry-rating** — the joint MLE that replaced Elo on
LM Arena precisely because it's order-independent and admits
confidence intervals.
