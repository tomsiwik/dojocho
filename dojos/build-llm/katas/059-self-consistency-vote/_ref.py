"""Reference solution for self-consistency-vote."""

from collections import Counter, defaultdict


def majority_vote(answers: list[str]) -> str:
    counts = Counter(answers)
    top = max(counts.values())
    tied = [a for a, c in counts.items() if c == top]
    return min(tied)


def weighted_majority(answers_with_weights: list[tuple[str, float]]) -> str:
    totals: dict[str, float] = defaultdict(float)
    for a, w in answers_with_weights:
        totals[a] += w
    top = max(totals.values())
    tied = [a for a, s in totals.items() if s == top]
    return min(tied)
