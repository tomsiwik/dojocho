"""majority-vote-aggregator — pick the most common answer.

Self-consistency boils down to one question: given N candidate answers
from the same model, which one wins? The textbook answer is "majority
vote." Implement it.

Edge cases that matter:
  - Empty input: return "" (no answer, no error).
  - Tie: break deterministically — alphabetically smallest wins.
    (Why deterministic? Because a flaky tie-breaker turns your
    "reproducible" evaluation into a coin flip.)
"""


def majority_vote(answers: list[str]) -> str:
    """Return the most frequent answer. Ties broken alphabetically.

    Empty list -> "".
    """
    ...  # implement me
