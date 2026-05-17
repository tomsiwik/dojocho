"""self-consistency-end-to-end — assemble the full pipeline.

Self-consistency, per Wang et al. (2022):
  1. Sample N candidate answers from the model at non-zero temperature.
  2. Take the majority vote.

You've built the aggregator. Now you build the pipeline that calls a
sampler `n_samples` times and votes.

The "model" here is any callable: `mock_llm(prompt, n_samples) -> list[str]`.
In real code this would be a temperature-sampling LLM. For the kata,
it's any Python callable with that signature.

Why this split? Self-consistency is a *protocol*, not a model. As long
as something gives you N candidates, voting is the same.
"""

from typing import Callable


def self_consistency(
    mock_llm: Callable[[str, int], list[str]],
    prompt: str,
    n_samples: int,
) -> str:
    """Sample `n_samples` answers from `mock_llm(prompt, n_samples)`,
    then majority-vote them.

    Tie-break alphabetical (same rule as kata 1).
    n_samples <= 0 -> "".
    """
    ...  # implement me
