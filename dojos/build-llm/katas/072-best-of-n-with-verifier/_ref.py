"""best-of-n-with-verifier — reference."""

from typing import Callable


def best_of_n(candidates: list[str], verifier: Callable[[str], float]) -> str:
    if not candidates:
        return ""
    # max() returns the first maximum on ties — exactly the stable
    # behavior we want.
    return max(candidates, key=verifier)
