"""Reference solution for best-of-refined."""

from typing import Callable


def best_of_refined(
    prompt: str,
    generate_fns: list[Callable[[str], str]],
    scorer: Callable[[str], float],
    n_refine: int = 3,
) -> str:
    best_answer = None
    best_score = None
    for gen in generate_fns:
        answer = gen(prompt)
        for _ in range(n_refine):
            answer = gen(answer)
        score = scorer(answer)
        if best_score is None or score > best_score:
            best_answer = answer
            best_score = score
    return best_answer
