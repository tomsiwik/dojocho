"""majority-vote-aggregator — reference."""

from collections import Counter


def majority_vote(answers: list[str]) -> str:
    if not answers:
        return ""
    counts = Counter(answers)
    # Sort by (-count, key) so highest count wins, alphabetical breaks ties.
    return sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))[0][0]
