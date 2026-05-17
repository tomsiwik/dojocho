"""Tests for length-statistics."""

import pytest


def test_empty_responses(solution):
    result = solution.length_stats([])
    assert result == {
        "n": 0,
        "mean": 0.0,
        "min": 0,
        "max": 0,
        "median": 0.0,
        "p90": 0.0,
    }


def test_single_response(solution):
    result = solution.length_stats(["abc"])
    assert result["n"] == 1
    assert result["mean"] == 3.0
    assert result["min"] == 3
    assert result["max"] == 3
    assert result["median"] == 3.0
    assert result["p90"] == 3.0


def test_three_responses_known_values(solution):
    result = solution.length_stats(["a", "bb", "ccc"])  # lengths 1, 2, 3
    assert result["n"] == 3
    assert result["mean"] == pytest.approx(2.0)
    assert result["min"] == 1
    assert result["max"] == 3
    assert result["median"] == 2.0
    # rank = 0.9 * 2 = 1.8 -> between xs[1]=2 and xs[2]=3 -> 2 + 0.8*(3-2) = 2.8
    assert result["p90"] == pytest.approx(2.8)


def test_median_even_length(solution):
    result = solution.length_stats(["a", "bb", "ccc", "dddd"])  # 1,2,3,4
    # median = (2 + 3) / 2 = 2.5
    assert result["median"] == 2.5


def test_median_odd_length(solution):
    result = solution.length_stats(["aaaa", "b", "cc"])  # sorted: 1, 2, 4
    assert result["median"] == 2.0


def test_min_max(solution):
    result = solution.length_stats(["x" * 5, "x" * 100, "x" * 1])
    assert result["min"] == 1
    assert result["max"] == 100


def test_p90_ten_evenly_spaced(solution):
    """Lengths 1..10. rank = 0.9 * 9 = 8.1, so p90 = xs[8] + 0.1*(xs[9]-xs[8]) = 9 + 0.1 = 9.1."""
    responses = ["x" * i for i in range(1, 11)]  # lengths 1..10
    result = solution.length_stats(responses)
    assert result["n"] == 10
    assert result["mean"] == pytest.approx(5.5)
    assert result["min"] == 1
    assert result["max"] == 10
    assert result["median"] == pytest.approx(5.5)
    assert result["p90"] == pytest.approx(9.1)


def test_p90_exact_rank(solution):
    """When 0.9*(n-1) is an integer, p90 is exactly xs[rank]."""
    # n = 11 -> rank = 0.9 * 10 = 9.0 (integer)
    responses = ["x" * i for i in range(1, 12)]  # lengths 1..11
    result = solution.length_stats(responses)
    assert result["p90"] == pytest.approx(10.0)


def test_mean_with_unequal_lengths(solution):
    """Mean is float division, not integer."""
    result = solution.length_stats(["a", "bb"])  # mean = 1.5
    assert result["mean"] == pytest.approx(1.5)


def test_returns_dict_keys(solution):
    result = solution.length_stats(["abc"])
    assert set(result.keys()) >= {"n", "mean", "min", "max", "median", "p90"}
