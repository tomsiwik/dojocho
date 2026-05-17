"""best-of-n-with-verifier — the other branch of inference-time scaling.

Self-consistency votes across candidates. Best-of-N takes a different
bet: trust a *verifier* function that scores each candidate, and pick
the highest-scoring one (argmax).

The verifier could be:
  - a learned reward model
  - a unit-test pass rate
  - exact-match against a known-good answer
  - your own heuristic

Stable selection: on a tie, return the first candidate (preserves
input order, makes the function deterministic).
"""

from typing import Callable


def best_of_n(candidates: list[str], verifier: Callable[[str], float]) -> str:
    """Return the candidate that maximizes verifier(candidate).

    Ties: return the first one encountered (stable argmax).
    Empty list -> "".
    """
    ...  # implement me
