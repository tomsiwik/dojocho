# SENSEI — match-answers-layered

## Briefing

### Goal

Wrap the normalizer into a tiered matcher and feel why "is this
answer correct?" has more than one answer. This is **step 5** of
Raschka's verifier pipeline. Build it well; chapter 6 will reuse it as
the reward signal for RL.

### Tasks

Implement `match(predicted, gold, level)` with three levels:

| level | behaviour |
|---|---|
| `strict` | `predicted == gold` |
| `normalized` | normalize both sides, then `==` |
| `math_equivalent` | float-compare with tolerance `1e-6`; on parse failure, fall back to `normalized` |

Raise `ValueError` on an unknown level.

The provided `_normalize` helper is a copy of the kata-2 reference —
use it freely (or replace it with your own).

### Hints

- For `math_equivalent`, the parse step is just `float(s)`. Catch
  `ValueError` and fall back.
- For the fraction case (`"14/3"`), parse manually: split on `/`,
  convert numerator and denominator, divide.
- `math.isclose(a, b, abs_tol=TOLERANCE)` is the cleanest comparison.
- Layered fallback is a common pattern: try the strictest interpretation
  first, then loosen.

## Prerequisites

- `extract-boxed-answer` and `normalize-numeric-answer` (you've felt
  the trade-offs).
- `math.isclose` or basic float arithmetic.

## References

- Raschka, *Build a Reasoning Model (From Scratch)*, ch. 3.6, listing
  3.7 / 3.8 (his version uses SymPy for full algebraic equivalence;
  yours is simpler and sufficient for numeric MATH-500 problems).

## Teaching Approach

**Method:** strong Socratic.

### Socratic prompts

Before writing any code, answer for each pair: **match or no match,
and at which level?**

- `"5"` vs `"5.0"`
- `"5 dogs"` vs `"5"`
- `"five"` vs `"5"`
- `"1/2"` vs `"0.5"`
- `"14/3"` vs `"4.666666666"`
- `"1,000"` vs `"1000"`
- `"A"` vs `"a"` (multiple choice)
- `"\\boxed{5}"` vs `"5"` (extraction didn't run — your fault?)

Then:

- "If you only had one level, which would you ship as a default? Why?"
- "Why might `math_equivalent` be *worse* than `normalized` for a
  multiple-choice benchmark?"
- "The grader is the reward signal in RL. What happens if the grader
  is too loose? Too strict?"

### Common pitfalls

1. **Forgetting fallback in `math_equivalent`.** `float("hello")`
   raises. Without a fallback, `"hello" vs "hello"` returns False.
2. **Using `==` on floats without tolerance.** `0.1 + 0.2 != 0.3` —
   you've been warned for years.
3. **Letting `match_equivalent` fall through to strict by accident.**
   The fallback must be `normalized`, not `strict`.
4. **Raising on unknown level after returning something.** Validate
   `level` *first*, before any work.

## On Completion

### Insight

You just built the reward function that, in chapter 6, will train a
reasoning model with GRPO. The model produces a candidate answer; this
function returns 1 if correct and 0 if not; the policy gradient does
the rest. If your `match` is wrong, the model learns to fool *your
grader*, not to solve problems. Goodhart's law in 30 lines.

### Bridge

Next: `accuracy-on-mini-math` aggregates this match function over a
small dataset and returns `{n, correct, accuracy}`. You'll watch the
match level swing the score by 10-20 points on the same predictions.
