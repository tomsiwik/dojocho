"""Tests for elo-rating."""

import pytest


def test_equal_ratings_winner_gains_half_k(solution):
    """Two 1000-rated players: A wins. Expected = 0.5, so update = +16/-16."""
    new_a, new_b = solution.update_elo(1000, 1000, result_a=1, k=32)
    assert new_a == pytest.approx(1016.0)
    assert new_b == pytest.approx(984.0)


def test_equal_ratings_draw_no_change(solution):
    """Two equal players draw. Expected = actual = 0.5. No change."""
    new_a, new_b = solution.update_elo(1500, 1500, result_a=0.5, k=32)
    assert new_a == pytest.approx(1500.0)
    assert new_b == pytest.approx(1500.0)


def test_zero_sum(solution):
    """Total points are conserved — what A gains, B loses."""
    a0, b0 = 1234.0, 1789.0
    new_a, new_b = solution.update_elo(a0, b0, result_a=1, k=32)
    assert (new_a - a0) == pytest.approx(-(new_b - b0))


def test_zero_sum_for_loss(solution):
    a0, b0 = 1234.0, 1789.0
    new_a, new_b = solution.update_elo(a0, b0, result_a=0, k=32)
    assert (new_a - a0) == pytest.approx(-(new_b - b0))


def test_zero_sum_for_draw(solution):
    a0, b0 = 1100.0, 1500.0
    new_a, new_b = solution.update_elo(a0, b0, result_a=0.5, k=32)
    assert (new_a - a0) == pytest.approx(-(new_b - b0))


def test_favorite_winning_gains_little(solution):
    """A 400-point favorite who wins gains close to k * (1 - 10/11) ~ 2.9."""
    new_a, new_b = solution.update_elo(1400, 1000, result_a=1, k=32)
    delta = new_a - 1400
    # Expected_a = 1 / (1 + 10**(-1)) = 10/11 ~ 0.909
    # delta = 32 * (1 - 0.909) = 32 * 0.0909 ~ 2.909
    assert delta == pytest.approx(32 * (1 - 10 / 11), abs=1e-6)


def test_upset_gives_large_delta(solution):
    """Underdog (1000) beats favorite (1400): underdog gains close to k * (1 - 1/11)."""
    new_a, new_b = solution.update_elo(1000, 1400, result_a=1, k=32)
    delta = new_a - 1000
    # Expected_a = 1 / (1 + 10**(1)) = 1/11 ~ 0.0909
    # delta = 32 * (1 - 0.0909) = 32 * 10/11 ~ 29.09
    assert delta == pytest.approx(32 * (1 - 1 / 11), abs=1e-6)


def test_k_factor_scales_update(solution):
    """Doubling k doubles the per-match delta."""
    _a1, _b1 = solution.update_elo(1000, 1000, result_a=1, k=16)
    _a2, _b2 = solution.update_elo(1000, 1000, result_a=1, k=32)
    delta_1 = _a1 - 1000
    delta_2 = _a2 - 1000
    assert delta_2 == pytest.approx(2 * delta_1)


def test_returns_tuple_of_floats(solution):
    out = solution.update_elo(1000, 1000, 1)
    assert isinstance(out, tuple)
    assert len(out) == 2
    assert all(isinstance(x, float) for x in out)


def test_400_point_gap_implies_10x_odds(solution):
    """A 400-point gap means expected score ~ 10/11. Verify via update size:
    if the favorite wins, they gain k * 1/11."""
    new_a, _ = solution.update_elo(1400, 1000, result_a=1, k=11)
    # delta should be approximately 1.0
    assert (new_a - 1400) == pytest.approx(1.0, abs=1e-6)
