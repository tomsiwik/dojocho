"""Reference solution for elo-rating."""


def update_elo(
    rating_a: float,
    rating_b: float,
    result_a: float,
    k: float = 32,
) -> tuple[float, float]:
    expected_a = 1.0 / (1.0 + 10 ** ((rating_b - rating_a) / 400.0))
    new_a = rating_a + k * (result_a - expected_a)
    new_b = rating_b + k * ((1 - result_a) - (1 - expected_a))
    return (float(new_a), float(new_b))
