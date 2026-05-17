"""weighted-majority — vote, but weighted by confidence.

Plain majority assumes every sample is equally trustworthy. If your
sampler returns a confidence score per answer (e.g., per-sequence
log-probability, verifier score, or anything you trust), you can let
that influence the vote.

Sum the weights per answer; the answer with the highest total weight
wins. Ties broken alphabetically (same rule as plain majority).
"""


def weighted_majority(items: list[tuple[str, float]]) -> str:
    """Return the answer with the highest summed weight.

    items: list of (answer, weight) tuples.
    Empty list -> "".
    Ties broken alphabetically.
    """
    ...  # implement me
