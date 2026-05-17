"""accuracy-on-mini-math — aggregate match results into an accuracy.

This is **step 8** of Raschka's verifier pipeline: run the grader over
every example in the dataset and report aggregate accuracy. The dataset
here is a tiny 10-problem hand-rolled stand-in for MATH-500.

`predictions` is a list of `(model_answer, problem_id_or_index)` —
wait, no. Read the signature carefully:

    evaluate(predictions, match_level) -> {n, correct, accuracy}

where `predictions[i]` is `(model_answer, gold_answer)`. You apply the
match function from kata 3 element-wise and tally. The provided
`MINI_MATH` constant gives you ten `(problem, gold)` pairs you can use
as a fixture; the function itself doesn't read it (it grades whatever
the caller passes in).
"""

import math
import re


# ---------- inline mini dataset (10 problems) ----------
# Each row is (problem_statement, gold_answer_string).
MINI_MATH: list[tuple[str, str]] = [
    ("What is 2 + 2?", "4"),
    ("What is 12 * 12?", "144"),
    ("Compute 1/2 + 1/2.", "1"),
    ("Find x: 2x = 10.", "5"),
    ("Simplify 14/3 (decimal, 6 dp).", "4.666667"),
    ("What is 1000 + 234?", "1234"),
    ("What is 5! (factorial)?", "120"),
    ("Square root of 81?", "9"),
    ("Sum of integers 1..10.", "55"),
    ("Probability of heads on a fair coin.", "0.5"),
]


# ---------- inline matcher (copied from match-answers-layered) ----------
_LEADING_NUMBER = re.compile(r"^(-?\d+(?:\.\d+)?)")
TOLERANCE = 1e-6


def _normalize(answer: str) -> str:
    s = answer.strip()
    if not s:
        return s
    no_commas = s.replace(",", "")
    if "/" in no_commas:
        parts = no_commas.split("/")
        if len(parts) == 2:
            try:
                num = float(parts[0].strip())
                den = float(parts[1].strip())
                if den != 0:
                    val = round(num / den, 6)
                    text = f"{val:.6f}".rstrip("0").rstrip(".")
                    return text if text else "0"
            except ValueError:
                pass
    m = _LEADING_NUMBER.match(no_commas)
    if m and m.group(1) != no_commas:
        tail = no_commas[m.end():].lstrip()
        if tail:
            return m.group(1)
    return no_commas


def _try_parse_number(s: str):
    s = s.strip().replace(",", "")
    try:
        return float(s)
    except ValueError:
        pass
    if "/" in s:
        parts = s.split("/")
        if len(parts) == 2:
            try:
                return float(parts[0]) / float(parts[1])
            except (ValueError, ZeroDivisionError):
                return None
    m = _LEADING_NUMBER.match(s)
    if m:
        try:
            return float(m.group(1))
        except ValueError:
            pass
    return None


def match(predicted: str, gold: str, level: str) -> bool:
    if level not in ("strict", "normalized", "math_equivalent"):
        raise ValueError(f"Unknown level: {level!r}")
    if level == "strict":
        return predicted == gold
    if level == "normalized":
        return _normalize(predicted) == _normalize(gold)
    p = _try_parse_number(predicted)
    g = _try_parse_number(gold)
    if p is not None and g is not None:
        return math.isclose(p, g, abs_tol=TOLERANCE)
    return _normalize(predicted) == _normalize(gold)


# ---------- the kata ----------

def evaluate(
    predictions: list[tuple[str, str]],
    match_level: str,
) -> dict:
    """Grade each (predicted, gold) pair at `match_level` and aggregate.

    Returns a dict with keys:
        n        — total number of predictions (int)
        correct  — number of correct predictions (int)
        accuracy — correct / n, or 0.0 if n == 0 (float, in [0, 1])

    Use the provided `match` function for the comparison.
    """
    ...  # implement me
