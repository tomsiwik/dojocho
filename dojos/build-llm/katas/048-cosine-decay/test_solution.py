"""Tests for cosine-decay."""

import math


def test_peak_at_step_zero(solution):
    lr = solution.cosine_decay(0, 1000, 1e-3, 1e-5)
    assert math.isclose(lr, 1e-3, rel_tol=0, abs_tol=1e-12)


def test_min_at_total_steps(solution):
    lr = solution.cosine_decay(1000, 1000, 1e-3, 1e-5)
    assert math.isclose(lr, 1e-5, rel_tol=0, abs_tol=1e-12)


def test_midpoint_is_average(solution):
    # cos(pi/2) = 0  =>  min + (peak - min) * 0.5 * (1 + 0)
    #              =  min + 0.5 * (peak - min) = (peak + min) / 2
    lr = solution.cosine_decay(500, 1000, 1e-3, 1e-5)
    expected = (1e-3 + 1e-5) / 2
    assert math.isclose(lr, expected, rel_tol=0, abs_tol=1e-12)


def test_clamp_past_total(solution):
    lr = solution.cosine_decay(2000, 1000, 1e-3, 1e-5)
    assert math.isclose(lr, 1e-5, rel_tol=0, abs_tol=1e-12)


def test_monotonic_decrease(solution):
    rates = [
        solution.cosine_decay(s, 1000, 1e-3, 1e-5) for s in range(0, 1001, 100)
    ]
    for a, b in zip(rates, rates[1:]):
        assert a > b


def test_quarter_point_above_midpoint(solution):
    # Cosine stays near peak longer than linear would — at step T/4,
    # the LR should still be well above the midpoint average.
    lr_quarter = solution.cosine_decay(250, 1000, 1e-3, 1e-5)
    midpoint = (1e-3 + 1e-5) / 2
    assert lr_quarter > midpoint


def test_three_quarter_below_midpoint(solution):
    # And symmetrically below at step 3T/4.
    lr_3q = solution.cosine_decay(750, 1000, 1e-3, 1e-5)
    midpoint = (1e-3 + 1e-5) / 2
    assert lr_3q < midpoint


def test_quarter_three_quarter_symmetry(solution):
    # Half-cosine is symmetric around the midpoint: f(T/4) - mid == mid - f(3T/4)
    lr_quarter = solution.cosine_decay(250, 1000, 1e-3, 1e-5)
    lr_3q = solution.cosine_decay(750, 1000, 1e-3, 1e-5)
    midpoint = (1e-3 + 1e-5) / 2
    assert math.isclose(
        lr_quarter - midpoint, midpoint - lr_3q, rel_tol=0, abs_tol=1e-12
    )


def test_returns_float(solution):
    assert isinstance(solution.cosine_decay(100, 1000, 1e-3, 1e-5), float)


def test_never_below_min_during_schedule(solution):
    for s in range(0, 1001, 25):
        lr = solution.cosine_decay(s, 1000, 1e-3, 1e-5)
        assert lr >= 1e-5 - 1e-12
        assert lr <= 1e-3 + 1e-12
