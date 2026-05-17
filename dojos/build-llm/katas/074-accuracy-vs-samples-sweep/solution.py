"""accuracy-vs-samples-sweep — measure the scaling curve.

Self-consistency improves accuracy. How much? That depends on N (the
number of samples). Plot accuracy as a function of N to *see* the
diminishing-returns curve every paper alludes to.

You're given:
  - `mock_llm(prompt, n_samples) -> list[str]`: the sampler
  - `problems`: list of (prompt, correct_answer) tuples
  - `max_n`: the largest N to sweep

For each N in 1..max_n, run self-consistency on every problem and
compute fraction-correct. Return a list of `max_n` floats.

This is exactly the kind of plot you'd produce when deciding what N to
deploy at: more samples cost more, and at some point the curve flattens.
"""

from typing import Callable


def accuracy_sweep(
    mock_llm: Callable[[str, int], list[str]],
    problems: list[tuple[str, str]],
    max_n: int,
) -> list[float]:
    """Return [acc@N=1, acc@N=2, ..., acc@N=max_n].

    Accuracy is the fraction of problems where majority-vote of N
    samples equals the gold answer.

    Empty `problems` -> a list of `max_n` zeros (no problems, no
    accuracy signal — by convention 0.0).
    max_n <= 0 -> [].
    """
    ...  # implement me
