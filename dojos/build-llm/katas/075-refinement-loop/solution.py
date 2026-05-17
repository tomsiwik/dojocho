"""refinement-loop — the Self-Refine outer loop.

Take an initial answer, run `critic` to get a critique, hand
answer + critique to `reviser` to get a new answer, repeat up to
`n_max` times. Return the final answer.

This is the bare skeleton of build-reasoning §5.8's
`self_refinement_loop` — no scoring, no acceptance test, no early
stopping. Those layers come in the next three katas.
"""

from typing import Callable


def refine(
    initial_answer: str,
    critic: Callable[[str], str],
    reviser: Callable[[str, str], str],
    n_max: int = 5,
) -> str:
    """Iteratively critique-and-revise an answer up to `n_max` rounds.

    Args:
        initial_answer: the starting answer (would be the LLM's draft).
        critic: takes the current answer, returns a critique string.
        reviser: takes (answer, critique), returns a revised answer.
        n_max: maximum number of refinement rounds. `n_max=0` returns
            the initial answer unchanged.

    Returns:
        The answer after `n_max` rounds (or the initial answer if
        `n_max == 0`).
    """
    ...  # implement me
