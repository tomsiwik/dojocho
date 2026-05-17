"""stopping-criteria — three factories for self-refinement stops.

Each factory returns a `should_stop(history: list[float]) -> bool`
predicate. The predicate sees only the score history (no answers,
no prompt) and decides whether the refinement loop should halt.

These cover the three philosophies of inference-time scaling:
fixed budget, verifier-driven, and plateau detection.
"""

from typing import Callable


def stop_after_k(k: int) -> Callable[[list[float]], bool]:
    """Stop once the history has at least `k` scores.

    `stop_after_k(0)` returns a predicate that is always True
    (don't run any iterations).
    """
    ...  # implement me


def stop_at_score(threshold: float) -> Callable[[list[float]], bool]:
    """Stop once the most recent score is >= `threshold`.

    Empty history -> False (no answer yet, nothing to judge).
    """
    ...  # implement me


def stop_if_no_improvement(patience: int) -> Callable[[list[float]], bool]:
    """Stop once `patience` entries have been appended since the
    first occurrence of the global best score.

    Formally: stop iff `(len(history) - 1) - argmax_first(history)
    >= patience`. Empty history returns False. A tie with the
    current best does NOT count as improvement.
    """
    ...  # implement me
