# SENSEI — accuracy-on-mini-math

## Briefing

### Goal

Run the layered matcher from kata 3 over a small dataset and report
aggregate accuracy. This is **step 8** of Raschka's verifier
pipeline — the final number people quote in papers ("44.8% on
MATH-500").

The dataset (`MINI_MATH`) is hand-rolled here: 10 toy math problems
with gold answers. In chapter 6, you'll plug a real model + MATH-500
in the same shape.

### Tasks

Implement `evaluate(predictions, match_level)`:

- `predictions` is a list of `(predicted, gold)` strings.
- `match_level` is one of `"strict"`, `"normalized"`,
  `"math_equivalent"`.
- Return `{n, correct, accuracy}` where:
  - `n` is `len(predictions)`,
  - `correct` is the count where `match(predicted, gold, level)` is True,
  - `accuracy` is `correct / n` (or `0.0` if `n == 0`).

The `match` function is already provided in `solution.py` — use it.

### Hints

- One-liner with `sum(match(p, g, level) for p, g in predictions)`.
- Guard against `n == 0` before dividing.
- Return `float` for accuracy (tests check the type).

## Prerequisites

- `match-answers-layered` (you reuse its logic).
- `normalize-numeric-answer` (transitively).

## References

- Raschka, *Build a Reasoning Model (From Scratch)*, ch. 3.7 / 3.8 —
  the MATH-500 loop.

## Teaching Approach

**Method:** kata (mechanical aggregation).

### Socratic prompts (after passing)

- "The same predictions score 30% on `strict`, 60% on `normalized`,
  and 80% on `math_equivalent`. Which number do you report?"
- "If a paper says 'accuracy on MATH-500', and another paper says the
  same thing, can you compare them directly? What information is
  missing?"
- "When would `strict` be the *only* defensible level?" (Hint:
  multiple choice, code output exact-match.)

### Common pitfalls

1. **Dividing by zero** on the empty-predictions edge case.
2. **`int` accuracy from `sum(...) / len(...)`** in Python 3 —
   division is always float, but `int(0) / int(1)` is `0.0`, while
   `0 // 1` is `0`. Use `/`.
3. **Returning `numpy` types** if you reach for numpy. Just use stdlib.

## On Completion

### Insight

You now have a complete grader. Feed it `(prediction, gold)` pairs
from any model and any benchmark in this shape and you get an
accuracy number. The hard part of evaluation isn't the loop — it's
*everything before the loop*: prompt format, extraction, normalization,
match level. Each is a knob; each shifts the headline number.

### Bridge

Next: `length-statistics`. Accuracy isn't the only thing that
matters — reasoning models trade tokens for correctness. You'll add a
second axis (response length) and discover that "10× longer answers
for +5% accuracy" is sometimes a bad trade.
