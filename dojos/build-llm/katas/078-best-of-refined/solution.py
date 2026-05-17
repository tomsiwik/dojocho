"""best-of-refined — pick the best from N refined candidates.

For each generator: draft an answer, refine it `n_refine` times
(each pass feeds the previous answer back into the generator), then
score the final answer. Return the highest-scoring final answer
across all generators.

This crosses the "width" axis (best-of-N, ch4) with the "depth"
axis (self-refinement, ch5). It is the inference-time scaling plane
in miniature.
"""

from typing import Callable


def best_of_refined(
    prompt: str,
    generate_fns: list[Callable[[str], str]],
    scorer: Callable[[str], float],
    n_refine: int = 3,
) -> str:
    """Run each generator with `n_refine` refinement passes, score
    the final answers, return the highest-scoring one.

    Args:
        prompt: the original question fed to the first call of each
            generator.
        generate_fns: list of generators. Each takes a string
            (prompt or previous answer) and returns the next answer.
        scorer: takes an answer string, returns a float. Higher is
            better.
        n_refine: number of refinement passes per generator. Each
            generator is called `1 + n_refine` times total.

    Returns:
        The answer with the highest score. Ties broken by generator
        order (first wins).
    """
    ...  # implement me
