"""Reference solution for heuristic-scorer."""

import math
import re


def score_length(answer: str) -> float:
    return math.exp(-len(answer) / 500)


def score_contains_keyword(answer: str, keyword: str) -> float:
    if keyword == "":
        return 1.0
    return 1.0 if keyword.lower() in answer.lower() else 0.0


_BOXED_RE = re.compile(r"\\boxed\{([^}]+)\}")


def score_boxed_format(answer: str) -> float:
    return 1.0 if _BOXED_RE.search(answer) else 0.0
