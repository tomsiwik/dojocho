"""weighted-majority — reference."""

from collections import defaultdict


def weighted_majority(items: list[tuple[str, float]]) -> str:
    if not items:
        return ""
    totals: dict[str, float] = defaultdict(float)
    for answer, weight in items:
        totals[answer] += weight
    return sorted(totals.items(), key=lambda kv: (-kv[1], kv[0]))[0][0]
