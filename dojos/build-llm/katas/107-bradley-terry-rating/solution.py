"""bradley-terry-rating — joint MLE for pairwise comparisons.

Given a dict of pairwise win counts (winner, loser) -> count, fit
Bradley-Terry strengths `pi_i` via the Hunter (2004) MM iteration:

    pi_i_new = W_i / sum_j ( N_ij / (pi_i + pi_j) )

where W_i is the total wins of i and N_ij is the total number of
games between i and j (symmetric).

Return log-strengths, normalized to sum to zero (BT is scale-invariant).
"""


def bradley_terry(
    pairwise_wins: dict[tuple[str, str], int],
    iterations: int = 20,
) -> dict[str, float]:
    """Fit Bradley-Terry strengths from pairwise win counts.

    Args:
        pairwise_wins: dict mapping (winner, loser) -> number of wins.
        iterations: number of MM updates (Hunter 2004).

    Returns:
        dict mapping each model name to its log-strength.
        Log-strengths are mean-centered (sum to zero).
    """
    ...  # implement me
