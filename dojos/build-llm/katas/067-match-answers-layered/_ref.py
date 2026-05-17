"""Reference implementation — match-answers-layered."""

import math
import re

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
    # Try leading-number-with-units
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

    # math_equivalent
    p = _try_parse_number(predicted)
    g = _try_parse_number(gold)
    if p is not None and g is not None:
        return math.isclose(p, g, abs_tol=TOLERANCE)
    # fallback to normalized
    return _normalize(predicted) == _normalize(gold)
