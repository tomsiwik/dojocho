"""Tests for accuracy-on-mini-math."""

import pytest


def _all_perfect(solution):
    """Predictions that exactly match every gold answer in MINI_MATH."""
    return [(gold, gold) for _, gold in solution.MINI_MATH]


def _all_wrong(solution):
    return [("WRONG", gold) for _, gold in solution.MINI_MATH]


def test_mini_math_has_ten_problems(solution):
    assert len(solution.MINI_MATH) == 10


def test_perfect_predictions_score_one(solution):
    result = solution.evaluate(_all_perfect(solution), "strict")
    assert result["n"] == 10
    assert result["correct"] == 10
    assert result["accuracy"] == 1.0


def test_all_wrong_scores_zero(solution):
    result = solution.evaluate(_all_wrong(solution), "strict")
    assert result["n"] == 10
    assert result["correct"] == 0
    assert result["accuracy"] == 0.0


def test_accuracy_between_zero_and_one(solution):
    preds = [(gold, gold) for _, gold in solution.MINI_MATH[:5]]
    preds += [("WRONG", gold) for _, gold in solution.MINI_MATH[5:]]
    result = solution.evaluate(preds, "strict")
    assert result["n"] == 10
    assert result["correct"] == 5
    assert result["accuracy"] == 0.5


def test_normalized_catches_more_than_strict(solution):
    """Predictions with formatting noise — strict misses, normalized catches."""
    preds = [
        ("1,234", "1234"),     # comma
        ("5 dogs", "5"),       # unit
        ("0.500000", "0.5"),   # trailing zeros
    ]
    strict = solution.evaluate(preds, "strict")
    norm = solution.evaluate(preds, "normalized")
    assert strict["correct"] < norm["correct"]
    assert norm["correct"] >= 2  # at least the comma + unit cases


def test_math_equivalent_catches_more_than_normalized(solution):
    """Floats that differ in formatting but are numerically close."""
    preds = [
        ("5", "5.0"),                       # int vs float
        ("0.333333", "0.3333333333"),       # precision
        ("14/3", "4.666666666"),            # fraction vs decimal
    ]
    norm = solution.evaluate(preds, "normalized")
    math_eq = solution.evaluate(preds, "math_equivalent")
    assert math_eq["correct"] > norm["correct"]
    assert math_eq["correct"] == 3


def test_empty_predictions(solution):
    result = solution.evaluate([], "strict")
    assert result["n"] == 0
    assert result["correct"] == 0
    assert result["accuracy"] == 0.0


def test_returns_dict_with_expected_keys(solution):
    result = solution.evaluate([("4", "4")], "strict")
    assert set(result.keys()) >= {"n", "correct", "accuracy"}
    assert isinstance(result["n"], int)
    assert isinstance(result["correct"], int)
    assert isinstance(result["accuracy"], float)
