"""Self-Consistency Vote — build-reasoning ch1.

The kernel of self-consistency decoding (Wang et al., 2022):
  - `majority_vote`: given N candidate answers, return the most common.
  - `weighted_majority`: given (answer, weight) pairs, return the
    answer with the highest weight sum.

Both functions deterministically tie-break: among answers tied for the
top score, return the lexicographically smallest. This keeps tests
reproducible without forbidding ties.
"""


def majority_vote(answers: list[str]) -> str:
    """Return the most-common string in `answers`. On ties, return the
    lexicographically smallest tied answer.
    """
    ...  # implement me


def weighted_majority(answers_with_weights: list[tuple[str, float]]) -> str:
    """Sum weights per answer, return the answer with the highest total.
    On ties, return the lexicographically smallest tied answer.
    """
    ...  # implement me
