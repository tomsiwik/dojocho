"""Reference solution for win-rate-with-ci."""

import random


def win_rate(
    model_a_outputs: list[tuple[str, str, str]],
    model_b_outputs: list[tuple[str, str, str]],
    judge,
) -> dict:
    n = len(model_a_outputs)
    assert n == len(model_b_outputs), "aligned lists required"

    # Per-prompt outcomes from A's perspective: 1 win, 0.5 tie, 0 loss
    outcomes = []
    wins = losses = ties = 0
    for (qa, ra, refa), (qb, rb, refb) in zip(model_a_outputs, model_b_outputs):
        sa = judge(qa, ra, refa)
        sb = judge(qb, rb, refb)
        if sa > sb:
            outcomes.append(1.0)
            wins += 1
        elif sa < sb:
            outcomes.append(0.0)
            losses += 1
        else:
            outcomes.append(0.5)
            ties += 1

    decisive = wins + losses
    win_rate_val = (wins / decisive) if decisive > 0 else 0.0

    # Bootstrap 95% CI: 10,000 resamples, percentile method.
    rng = random.Random(0)
    n_boot = 10000
    boot = []
    for _ in range(n_boot):
        sample = rng.choices(outcomes, k=n) if n > 0 else []
        w = sum(1 for o in sample if o == 1.0)
        l = sum(1 for o in sample if o == 0.0)
        if w + l > 0:
            boot.append(w / (w + l))
        else:
            boot.append(0.0)
    boot.sort()
    ci_low = boot[int(0.025 * n_boot)]
    ci_high = boot[int(0.975 * n_boot)]

    return {
        "wins": wins,
        "losses": losses,
        "ties": ties,
        "win_rate": win_rate_val,
        "ci_low": ci_low,
        "ci_high": ci_high,
    }
