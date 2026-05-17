"""match-answers-layered — three levels of "is this answer correct?"

Real grading systems offer a tiered match because there's no single
"right" answer to what counts as a match:

- `strict`: byte-exact equality. Used when format matters
  (multiple choice "A", "B", ...).
- `normalized`: apply the kata-2 normalizer to both sides, then `==`.
  Catches "1,000" vs "1000", "5 dogs" vs "5", "1/2" vs "0.5".
- `math_equivalent`: parse both sides as floats and compare with a
  small tolerance. Catches "0.333333" vs "0.3333333333", "14/3" vs
  "4.666666666". If either side can't be parsed as a float, fall back
  to `normalized`.

This kata builds on the previous one. You may import from a sibling
file if your harness supports it, but the simplest path is to inline a
small `_normalize` helper (or paste your kata-2 solution) here.
"""

import re

_LEADING_NUMBER = re.compile(r"^(-?\d+(?:\.\d+)?)")
TOLERANCE = 1e-6


def _normalize(answer: str) -> str:
    """A small inline copy of the kata-2 normalizer.

    You're welcome to replace this with your own version if you've
    already done kata 2 and want to reuse it.
    """
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


def match(predicted: str, gold: str, level: str) -> bool:
    """Return True if `predicted` matches `gold` at the given `level`.

    `level` is one of:
        "strict"           — byte-exact `==`
        "normalized"       — `_normalize(predicted) == _normalize(gold)`
        "math_equivalent"  — parse both as float and compare with
                             tolerance; fall back to normalized on
                             parse failure.

    Raises ValueError on an unknown `level`.
    """
    ...  # implement me
