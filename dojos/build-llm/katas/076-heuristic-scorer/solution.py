"""heuristic-scorer — three cheap rule-based scorers in [0, 1].

These mirror the heuristic_score components from build-reasoning
listing 5.3. Each is a pure function over the answer string; none
peeks at the prompt or the model. The point is to feel how thin
"format-only" rewards are before reaching for stronger signals.
"""

import math
import re


def score_length(answer: str) -> float:
    """Brevity score: 1.0 for empty, decaying as exp(-len/500).

    Returns a float in (0, 1] (1.0 exactly when `answer` is empty).
    """
    ...  # implement me


def score_contains_keyword(answer: str, keyword: str) -> float:
    """Case-insensitive substring check.

    Returns 1.0 if `keyword` appears in `answer`, else 0.0.
    Empty `keyword` returns 1.0 (vacuously contained).
    """
    ...  # implement me


def score_boxed_format(answer: str) -> float:
    r"""Format score: 1.0 if the answer contains \boxed{<something>}.

    The braces must hold at least one character. Returns 0.0 otherwise.
    """
    ...  # implement me
