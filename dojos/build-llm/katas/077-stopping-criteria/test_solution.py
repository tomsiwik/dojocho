"""Tests for stopping-criteria."""


# --- stop_after_k ----------------------------------------------------------


def test_stop_after_k_below(solution):
    assert solution.stop_after_k(3)([0.1, 0.5]) is False


def test_stop_after_k_at(solution):
    assert solution.stop_after_k(3)([0.1, 0.5, 0.7]) is True


def test_stop_after_k_above(solution):
    assert solution.stop_after_k(3)([0.1, 0.5, 0.7, 0.9]) is True


def test_stop_after_k_zero_always_stops(solution):
    assert solution.stop_after_k(0)([]) is True
    assert solution.stop_after_k(0)([0.5]) is True


def test_stop_after_k_one(solution):
    assert solution.stop_after_k(1)([]) is False
    assert solution.stop_after_k(1)([0.0]) is True


# --- stop_at_score ---------------------------------------------------------


def test_stop_at_score_below(solution):
    assert solution.stop_at_score(0.9)([0.5, 0.8]) is False


def test_stop_at_score_at_threshold(solution):
    """>= threshold (not strictly greater)."""
    assert solution.stop_at_score(0.9)([0.5, 0.9]) is True


def test_stop_at_score_above(solution):
    assert solution.stop_at_score(0.9)([0.5, 0.99]) is True


def test_stop_at_score_empty_does_not_stop(solution):
    assert solution.stop_at_score(0.9)([]) is False


def test_stop_at_score_uses_last_not_max(solution):
    """If the latest score dips below threshold, don't stop —
    even if an earlier score crossed it."""
    assert solution.stop_at_score(0.9)([0.95, 0.5]) is False


# --- stop_if_no_improvement ------------------------------------------------
#
# Semantics: count = (len(history) - 1) - argmax_first(history).
# That is, how many entries have been appended since the global best
# was first achieved. Stop when count >= patience.
# Empty history -> False.


def test_no_improvement_plateau(solution):
    """Best is 0.6 at index 1; two non-improving entries follow."""
    # history = [0.5, 0.6, 0.6, 0.6] -> count since best = 2
    assert solution.stop_if_no_improvement(2)([0.5, 0.6, 0.6, 0.6]) is True


def test_no_improvement_new_best_resets(solution):
    """Latest is a new best -> count resets to 0."""
    assert solution.stop_if_no_improvement(2)([0.5, 0.6, 0.7]) is False


def test_no_improvement_history_too_short(solution):
    """Need more than `patience` non-improving steps to plateau."""
    assert solution.stop_if_no_improvement(2)([0.5]) is False
    assert solution.stop_if_no_improvement(2)([0.5, 0.6]) is False
    # count since best (idx 1) = 1, patience = 2 -> not yet.
    assert solution.stop_if_no_improvement(2)([0.5, 0.6, 0.6]) is False


def test_no_improvement_strict_inequality(solution):
    """Tying the best does NOT count as improvement; uses first occurrence."""
    # Best (first) at index 1. Indices 2, 3 tie but don't beat -> count = 2.
    assert solution.stop_if_no_improvement(2)([0.5, 0.6, 0.6, 0.6]) is True


def test_no_improvement_dip_then_recover(solution):
    """A new strict global best resets the counter."""
    # best at index 3 (0.95) -> count = 0
    assert solution.stop_if_no_improvement(2)([0.9, 0.8, 0.8, 0.95]) is False


def test_no_improvement_patience_zero(solution):
    """patience=0 stops as soon as any non-improving entry exists."""
    # [0.5]: best at idx 0, count = 0 -> 0 >= 0 -> True.
    assert solution.stop_if_no_improvement(0)([0.5]) is True
    # [] -> False (empty history never stops here).
    assert solution.stop_if_no_improvement(0)([]) is False


def test_no_improvement_empty_history(solution):
    assert solution.stop_if_no_improvement(2)([]) is False


# --- factory behavior ------------------------------------------------------


def test_factories_return_callables(solution):
    assert callable(solution.stop_after_k(3))
    assert callable(solution.stop_at_score(0.5))
    assert callable(solution.stop_if_no_improvement(2))


def test_factories_return_independent_predicates(solution):
    """Two predicates from the same factory don't share state."""
    p1 = solution.stop_after_k(3)
    p2 = solution.stop_after_k(5)
    assert p1([0, 0, 0]) is True
    assert p2([0, 0, 0]) is False
