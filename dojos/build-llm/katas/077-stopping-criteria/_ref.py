"""Reference solution for stopping-criteria."""

from typing import Callable


def stop_after_k(k: int) -> Callable[[list[float]], bool]:
    def should_stop(history: list[float]) -> bool:
        return len(history) >= k
    return should_stop


def stop_at_score(threshold: float) -> Callable[[list[float]], bool]:
    def should_stop(history: list[float]) -> bool:
        if not history:
            return False
        return history[-1] >= threshold
    return should_stop


def stop_if_no_improvement(patience: int) -> Callable[[list[float]], bool]:
    def should_stop(history: list[float]) -> bool:
        if not history:
            return False
        best = history[0]
        best_idx = 0
        for i in range(1, len(history)):
            if history[i] > best:  # strict
                best = history[i]
                best_idx = i
        count_since_best = (len(history) - 1) - best_idx
        return count_since_best >= patience
    return should_stop
