"""Tests for padding-waste."""

import pytest


def test_uniform_batch_has_no_waste(solution):
    """All requests the same length -> no padding needed."""
    total, wasted = solution.static_batch_pad([10, 10, 10, 10])
    assert total == 40
    assert wasted == 0


def test_skewed_batch_wastes_a_lot(solution):
    """One long request drags everyone up to its length."""
    total, wasted = solution.static_batch_pad([10, 100])
    assert total == 200  # max(10, 100) * 2
    assert wasted == 90  # 200 - (10 + 100)


def test_single_request_no_waste(solution):
    """A batch of one is just the request itself."""
    total, wasted = solution.static_batch_pad([42])
    assert total == 42
    assert wasted == 0


def test_returns_tuple_of_ints(solution):
    """Result must be a (int, int) tuple."""
    result = solution.static_batch_pad([5, 7, 9])
    assert isinstance(result, tuple)
    assert len(result) == 2
    total, wasted = result
    assert isinstance(total, int)
    assert isinstance(wasted, int)


def test_waste_is_total_minus_real(solution):
    """The accounting identity: wasted = total - sum(requests)."""
    reqs = [3, 11, 5, 17, 8]
    total, wasted = solution.static_batch_pad(reqs)
    assert total == max(reqs) * len(reqs)
    assert wasted == total - sum(reqs)


def test_empty_batch(solution):
    """Edge case: empty batch costs nothing."""
    with pytest.raises((ValueError, Exception)):
        # max() of an empty list raises; either raising or returning
        # (0, 0) is defensible. We require the implementation to make
        # a deliberate choice — most likely letting max() bubble up.
        solution.static_batch_pad([])
