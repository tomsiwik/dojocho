"""Tests for warmup-then-cosine."""

import math

T_TOTAL = 1000
T_WARM = 100
INIT = 1e-5
PEAK = 1e-3
MINI = 1e-6


def test_initial_at_step_zero(solution):
    lr = solution.warmup_then_cosine(0, T_TOTAL, T_WARM, INIT, PEAK, MINI)
    assert math.isclose(lr, INIT, rel_tol=0, abs_tol=1e-12)


def test_peak_at_end_of_warmup(solution):
    # Boundary: at step == warmup_steps, lr must be exactly peak.
    lr = solution.warmup_then_cosine(T_WARM, T_TOTAL, T_WARM, INIT, PEAK, MINI)
    assert math.isclose(lr, PEAK, rel_tol=0, abs_tol=1e-12)


def test_min_at_total_steps(solution):
    lr = solution.warmup_then_cosine(T_TOTAL, T_TOTAL, T_WARM, INIT, PEAK, MINI)
    assert math.isclose(lr, MINI, rel_tol=0, abs_tol=1e-12)


def test_warmup_midpoint(solution):
    # Halfway through warmup.
    lr = solution.warmup_then_cosine(50, T_TOTAL, T_WARM, INIT, PEAK, MINI)
    expected = INIT + 0.5 * (PEAK - INIT)
    assert math.isclose(lr, expected, rel_tol=0, abs_tol=1e-12)


def test_cosine_midpoint(solution):
    # Midpoint of the cosine phase: step = warmup + (total - warmup)/2 = 550
    # progress = 0.5, lr = min + (peak - min) * 0.5 * (1 + cos(pi/2))
    #                    = min + (peak - min) * 0.5
    lr = solution.warmup_then_cosine(550, T_TOTAL, T_WARM, INIT, PEAK, MINI)
    expected = (PEAK + MINI) / 2
    assert math.isclose(lr, expected, rel_tol=0, abs_tol=1e-12)


def test_no_discontinuity_at_boundary(solution):
    # The two branches must agree at step == warmup_steps.
    just_before = solution.warmup_then_cosine(
        T_WARM - 1, T_TOTAL, T_WARM, INIT, PEAK, MINI
    )
    at_boundary = solution.warmup_then_cosine(
        T_WARM, T_TOTAL, T_WARM, INIT, PEAK, MINI
    )
    just_after = solution.warmup_then_cosine(
        T_WARM + 1, T_TOTAL, T_WARM, INIT, PEAK, MINI
    )
    # Should be monotonically increasing toward peak, then start to decay.
    assert just_before < at_boundary
    assert just_after < at_boundary
    # The drop from peak should be tiny — we just crossed over.
    assert at_boundary - just_after < (PEAK - MINI) * 0.01


def test_clamp_past_total(solution):
    lr = solution.warmup_then_cosine(
        T_TOTAL + 500, T_TOTAL, T_WARM, INIT, PEAK, MINI
    )
    assert math.isclose(lr, MINI, rel_tol=0, abs_tol=1e-12)


def test_no_warmup_degenerates_to_cosine(solution):
    # warmup_steps == 0 should give pure cosine starting at peak.
    lr0 = solution.warmup_then_cosine(0, T_TOTAL, 0, INIT, PEAK, MINI)
    assert math.isclose(lr0, PEAK, rel_tol=0, abs_tol=1e-12)
    lr_end = solution.warmup_then_cosine(T_TOTAL, T_TOTAL, 0, INIT, PEAK, MINI)
    assert math.isclose(lr_end, MINI, rel_tol=0, abs_tol=1e-12)


def test_monotonic_during_warmup(solution):
    rates = [
        solution.warmup_then_cosine(s, T_TOTAL, T_WARM, INIT, PEAK, MINI)
        for s in range(0, T_WARM + 1, 10)
    ]
    for a, b in zip(rates, rates[1:]):
        assert a < b


def test_monotonic_during_cosine(solution):
    rates = [
        solution.warmup_then_cosine(s, T_TOTAL, T_WARM, INIT, PEAK, MINI)
        for s in range(T_WARM, T_TOTAL + 1, 50)
    ]
    for a, b in zip(rates, rates[1:]):
        assert a > b


def test_returns_float(solution):
    lr = solution.warmup_then_cosine(500, T_TOTAL, T_WARM, INIT, PEAK, MINI)
    assert isinstance(lr, float)


def test_lr_bounds(solution):
    # Across the whole schedule, lr stays within [min, peak].
    for s in range(0, T_TOTAL + 1, 25):
        lr = solution.warmup_then_cosine(s, T_TOTAL, T_WARM, INIT, PEAK, MINI)
        assert MINI - 1e-12 <= lr <= PEAK + 1e-12
