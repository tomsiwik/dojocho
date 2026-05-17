"""Reference solution for bradley-terry-rating."""

import math
from collections import defaultdict


def bradley_terry(
    pairwise_wins: dict[tuple[str, str], int],
    iterations: int = 20,
) -> dict[str, float]:
    # Collect models
    models = set()
    for (a, b) in pairwise_wins:
        models.add(a)
        models.add(b)
    models = sorted(models)

    # W_i: total wins of i
    wins = defaultdict(int)
    for (winner, _loser), count in pairwise_wins.items():
        wins[winner] += count

    # N_ij = total games between i and j (symmetric)
    games = defaultdict(int)
    for (a, b), count in pairwise_wins.items():
        key = tuple(sorted((a, b)))
        games[key] += count

    # Initialize strengths
    pi = {m: 1.0 for m in models}

    for _ in range(iterations):
        new_pi = {}
        for i in models:
            denom = 0.0
            for j in models:
                if i == j:
                    continue
                n_ij = games[tuple(sorted((i, j)))]
                if n_ij == 0:
                    continue
                denom += n_ij / (pi[i] + pi[j])
            if denom == 0 or wins[i] == 0:
                # Keep current; avoid div-by-zero / log(0)
                new_pi[i] = pi[i] if wins[i] == 0 else pi[i]
                if wins[i] == 0:
                    # Tiny floor so log is defined
                    new_pi[i] = 1e-12
            else:
                new_pi[i] = wins[i] / denom
        pi = new_pi

    # Convert to log-strengths and center
    log_pi = {m: math.log(pi[m]) for m in models}
    mean = sum(log_pi.values()) / len(log_pi)
    return {m: log_pi[m] - mean for m in models}
