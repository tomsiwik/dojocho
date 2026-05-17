"""accuracy-vs-samples-sweep — reference."""

from collections import Counter
from typing import Callable


def _majority_vote(answers: list[str]) -> str:
    if not answers:
        return ""
    counts = Counter(answers)
    return sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))[0][0]


def accuracy_sweep(
    mock_llm: Callable[[str, int], list[str]],
    problems: list[tuple[str, str]],
    max_n: int,
) -> list[float]:
    if max_n <= 0:
        return []
    if not problems:
        return [0.0] * max_n

    accuracies: list[float] = []
    for n in range(1, max_n + 1):
        correct = 0
        for prompt, gold in problems:
            candidates = mock_llm(prompt, n)
            if _majority_vote(candidates) == gold:
                correct += 1
        accuracies.append(correct / len(problems))
    return accuracies
