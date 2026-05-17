"""Reference solution for refinement-loop."""

from typing import Callable


def refine(
    initial_answer: str,
    critic: Callable[[str], str],
    reviser: Callable[[str, str], str],
    n_max: int = 5,
) -> str:
    answer = initial_answer
    for _ in range(n_max):
        critique = critic(answer)
        answer = reviser(answer, critique)
    return answer
