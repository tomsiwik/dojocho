"""Tests for bradley-terry-rating."""

import math
import random

import pytest


def test_returns_dict_with_all_models(solution):
    wins = {("A", "B"): 3, ("B", "A"): 1}
    ratings = solution.bradley_terry(wins, iterations=20)
    assert set(ratings.keys()) == {"A", "B"}


def test_winner_has_higher_rating(solution):
    """A beats B 3-1: A should have higher log-strength."""
    wins = {("A", "B"): 3, ("B", "A"): 1}
    ratings = solution.bradley_terry(wins, iterations=50)
    assert ratings["A"] > ratings["B"]


def test_three_model_ordering(solution):
    """Transitive setup — A beats B, B beats C, A beats C."""
    wins = {
        ("A", "B"): 8, ("B", "A"): 2,
        ("B", "C"): 8, ("C", "B"): 2,
        ("A", "C"): 9, ("C", "A"): 1,
    }
    r = solution.bradley_terry(wins, iterations=100)
    assert r["A"] > r["B"] > r["C"]


def test_log_strengths_centered(solution):
    """Log-strengths should sum to (approximately) zero."""
    wins = {
        ("A", "B"): 3, ("B", "A"): 2,
        ("B", "C"): 4, ("C", "B"): 1,
        ("A", "C"): 5, ("C", "A"): 1,
    }
    r = solution.bradley_terry(wins, iterations=50)
    assert sum(r.values()) == pytest.approx(0.0, abs=1e-9)


def test_equal_wins_equal_ratings(solution):
    """If A and B each win 5 vs each other, ratings should be equal."""
    wins = {("A", "B"): 5, ("B", "A"): 5}
    r = solution.bradley_terry(wins, iterations=50)
    assert r["A"] == pytest.approx(r["B"], abs=1e-6)


def test_order_independence(solution):
    """BT is a joint MLE; the order of the input dict must not matter."""
    pairs = [
        (("A", "B"), 8), (("B", "A"), 2),
        (("B", "C"), 7), (("C", "B"), 3),
        (("A", "C"), 9), (("C", "A"), 1),
    ]
    r1 = solution.bradley_terry(dict(pairs), iterations=100)

    shuffled = pairs.copy()
    random.Random(42).shuffle(shuffled)
    r2 = solution.bradley_terry(dict(shuffled), iterations=100)

    for model in r1:
        assert r1[model] == pytest.approx(r2[model], abs=1e-6)


def test_convergence_stabilizes(solution):
    """Many iterations should give the same answer as fewer (post-convergence)."""
    wins = {
        ("A", "B"): 6, ("B", "A"): 2,
        ("B", "C"): 5, ("C", "B"): 3,
        ("A", "C"): 7, ("C", "A"): 1,
    }
    r1 = solution.bradley_terry(wins, iterations=100)
    r2 = solution.bradley_terry(wins, iterations=200)
    for model in r1:
        assert r1[model] == pytest.approx(r2[model], abs=1e-6)


def test_strength_ratio_matches_win_ratio(solution):
    """For a 2-model setup with wins w_AB and w_BA, the MLE satisfies
    pi_A / pi_B = w_AB / w_BA."""
    wins = {("A", "B"): 6, ("B", "A"): 2}
    r = solution.bradley_terry(wins, iterations=200)
    # pi_A / pi_B = exp(r_A - r_B)
    ratio = math.exp(r["A"] - r["B"])
    assert ratio == pytest.approx(6 / 2, rel=1e-3)
