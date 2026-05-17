"""win-rate-with-ci — pairwise model comparison with bootstrap CI.

Wraps a judge function into the canonical "A vs B, n prompts" report:

    {
      "wins":     int (A > B per judge),
      "losses":   int (A < B),
      "ties":     int (A == B),
      "win_rate": wins / (wins + losses),   # ties excluded
      "ci_low":   float,  # 2.5th percentile of bootstrap win rates
      "ci_high":  float,  # 97.5th percentile
    }

Bootstrap: 10,000 resamples, percentile method, deterministic with
`random.Random(seed=0)`.
"""


def win_rate(
    model_a_outputs: list[tuple[str, str, str]],
    model_b_outputs: list[tuple[str, str, str]],
    judge,
) -> dict:
    """Compute win/loss/tie counts, win rate, and 95% bootstrap CI.

    Args:
        model_a_outputs: list of (question, response, reference) for model A.
        model_b_outputs: list of (question, response, reference) for model B,
                         aligned by index with `model_a_outputs`.
        judge: callable (question, response, reference) -> int.

    Returns:
        dict with keys: wins, losses, ties, win_rate, ci_low, ci_high.
    """
    ...  # implement me
