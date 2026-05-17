"""elo-rating — the chess-style rating update.

Two ratings in, two ratings out. The whole leaderboard is a fold of
this function over a vote stream.

    expected_a = 1 / (1 + 10**((rating_b - rating_a) / 400))
    new_a      = rating_a + k * (result_a - expected_a)
    new_b      = rating_b + k * ((1 - result_a) - (1 - expected_a))

`result_a` is in {0, 0.5, 1}.  The update is zero-sum (what A gains,
B loses) — verify this in your tests.
"""


def update_elo(
    rating_a: float,
    rating_b: float,
    result_a: float,
    k: float = 32,
) -> tuple[float, float]:
    """Return updated (rating_a, rating_b) after one match.

    Args:
        rating_a, rating_b: current ratings (e.g. 1000-1800 for chess).
        result_a: outcome from A's perspective: 1 (A won), 0 (A lost),
                  0.5 (draw).
        k: sensitivity / learning rate. Chess uses 32 for casual,
           10 for masters.
    """
    ...  # implement me
