"""Tests for lr-warmup."""

import math


def test_initial_lr_at_step_zero(solution):
    assert solution.linear_warmup(0, 100, 1e-4, 1e-3) == 1e-4


def test_peak_lr_at_warmup_step(solution):
    # At step == warmup_steps, the rate must equal peak exactly.
    lr = solution.linear_warmup(100, 100, 1e-4, 1e-3)
    assert math.isclose(lr, 1e-3, rel_tol=0, abs_tol=1e-12)


def test_midpoint_of_warmup(solution):
    # Linear interpolation midpoint.
    lr = solution.linear_warmup(50, 100, 1e-4, 1e-3)
    expected = 1e-4 + 0.5 * (1e-3 - 1e-4)
    assert math.isclose(lr, expected, rel_tol=0, abs_tol=1e-12)


def test_quarter_point_of_warmup(solution):
    lr = solution.linear_warmup(25, 100, 1e-4, 1e-3)
    expected = 1e-4 + 0.25 * (1e-3 - 1e-4)
    assert math.isclose(lr, expected, rel_tol=0, abs_tol=1e-12)


def test_clamp_past_warmup(solution):
    # After warmup, rate stays at peak.
    lr = solution.linear_warmup(500, 100, 1e-4, 1e-3)
    assert math.isclose(lr, 1e-3, rel_tol=0, abs_tol=1e-12)


def test_clamp_one_step_past_warmup(solution):
    lr = solution.linear_warmup(101, 100, 1e-4, 1e-3)
    assert math.isclose(lr, 1e-3, rel_tol=0, abs_tol=1e-12)


def test_returns_float(solution):
    result = solution.linear_warmup(50, 100, 1e-4, 1e-3)
    assert isinstance(result, float)


def test_monotonic_increase_during_warmup(solution):
    rates = [
        solution.linear_warmup(s, 100, 1e-4, 1e-3) for s in range(0, 101, 10)
    ]
    for a, b in zip(rates, rates[1:]):
        assert a < b


def test_different_scale(solution):
    # Different magnitudes shouldn't matter.
    lr = solution.linear_warmup(5, 10, 0.0, 1.0)
    assert math.isclose(lr, 0.5, rel_tol=0, abs_tol=1e-12)
