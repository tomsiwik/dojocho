"""self-consistency-end-to-end — reference."""

from collections import Counter
from typing import Callable


def _majority_vote(answers: list[str]) -> str:
    if not answers:
        return ""
    counts = Counter(answers)
    return sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))[0][0]


def self_consistency(
    mock_llm: Callable[[str, int], list[str]],
    prompt: str,
    n_samples: int,
) -> str:
    if n_samples <= 0:
        return ""
    candidates = mock_llm(prompt, n_samples)
    return _majority_vote(candidates)
