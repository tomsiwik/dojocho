"""Tests for weighted-majority."""

import math


def test_weighting_overrides_count(solution):
    # "wrong" appears 3x at weight 0.1 (total 0.3).
    # "right" appears 1x at weight 0.9.
    # Plain majority would say "wrong"; weighted says "right".
    items = [("wrong", 0.1), ("wrong", 0.1), ("wrong", 0.1), ("right", 0.9)]
    assert solution.weighted_majority(items) == "right"


def test_equal_weights_reduces_to_majority(solution):
    items = [("a", 1.0), ("a", 1.0), ("b", 1.0)]
    assert solution.weighted_majority(items) == "a"


def test_single_item(solution):
    assert solution.weighted_majority([("42", 0.5)]) == "42"


def test_empty(solution):
    assert solution.weighted_majority([]) == ""


def test_tie_broken_alphabetically(solution):
    # Both sum to 1.0 -> alphabetical wins.
    items = [("b", 0.5), ("a", 0.5), ("b", 0.5), ("a", 0.5)]
    assert solution.weighted_majority(items) == "a"


def test_weights_accumulate(solution):
    items = [("x", 0.3), ("y", 0.4), ("x", 0.3)]  # x:0.6, y:0.4
    assert solution.weighted_majority(items) == "x"


def test_zero_weight_is_no_vote(solution):
    # "a" has zero total -> "b" wins.
    items = [("a", 0.0), ("a", 0.0), ("b", 0.1)]
    assert solution.weighted_majority(items) == "b"


def test_returns_string(solution):
    result = solution.weighted_majority([("a", 1.0)])
    assert isinstance(result, str)


def test_float_precision_safe(solution):
    # Floating-point sums are *almost* equal — alphabetical wins on tie.
    # 0.1 * 3 != 0.3 exactly; make sure we don't crash or pick weirdly.
    items = [("a", 0.1), ("a", 0.1), ("a", 0.1), ("b", 0.3)]
    result = solution.weighted_majority(items)
    # Either is acceptable depending on float rounding; just ensure a string.
    assert result in {"a", "b"}
    assert math.isfinite(0.1 + 0.1 + 0.1)
