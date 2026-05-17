"""Tests for win-rate-with-ci."""

import pytest


# A simple judge that scores response length divided by 10, capped at 5.
# Lets us construct deterministic test scenarios without an LLM dependency.
def length_judge(question, response, reference):
    return max(1, min(5, len(response) // 10))


def _triples(responses: list[str]) -> list[tuple[str, str, str]]:
    return [("q", r, "ref") for r in responses]


def test_a_always_wins(solution):
    a_outs = _triples(["a" * 50] * 10)  # length 50 -> judge = 5
    b_outs = _triples(["b" * 5] * 10)   # length 5  -> judge = 1
    result = solution.win_rate(a_outs, b_outs, length_judge)
    assert result["wins"] == 10
    assert result["losses"] == 0
    assert result["ties"] == 0
    assert result["win_rate"] == 1.0


def test_b_always_wins(solution):
    a_outs = _triples(["a" * 5] * 10)
    b_outs = _triples(["b" * 50] * 10)
    result = solution.win_rate(a_outs, b_outs, length_judge)
    assert result["wins"] == 0
    assert result["losses"] == 10
    assert result["ties"] == 0
    assert result["win_rate"] == 0.0


def test_all_ties(solution):
    a_outs = _triples(["x" * 30] * 10)
    b_outs = _triples(["y" * 30] * 10)  # same judge score
    result = solution.win_rate(a_outs, b_outs, length_judge)
    assert result["wins"] == 0
    assert result["losses"] == 0
    assert result["ties"] == 10
    # No decisive matches -> win_rate defined as 0
    assert result["win_rate"] == 0.0


def test_mixed_outcomes(solution):
    # 6 wins for A, 3 losses, 1 tie
    a_lens = [50, 50, 50, 50, 50, 50, 5, 5, 5, 30]
    b_lens = [5,  5,  5,  5,  5,  5,  50, 50, 50, 30]
    a_outs = _triples(["a" * n for n in a_lens])
    b_outs = _triples(["b" * n for n in b_lens])
    result = solution.win_rate(a_outs, b_outs, length_judge)
    assert result["wins"] == 6
    assert result["losses"] == 3
    assert result["ties"] == 1
    assert result["win_rate"] == pytest.approx(6 / 9)


def test_returns_expected_keys(solution):
    a_outs = _triples(["a" * 30] * 5)
    b_outs = _triples(["b" * 30] * 5)
    result = solution.win_rate(a_outs, b_outs, length_judge)
    assert set(result.keys()) >= {
        "wins", "losses", "ties", "win_rate", "ci_low", "ci_high"
    }


def test_ci_bounds_valid(solution):
    a_lens = [50] * 60 + [5] * 40
    b_lens = [5] * 60 + [50] * 40
    a_outs = _triples(["a" * n for n in a_lens])
    b_outs = _triples(["b" * n for n in b_lens])
    result = solution.win_rate(a_outs, b_outs, length_judge)
    assert 0.0 <= result["ci_low"] <= result["win_rate"] <= result["ci_high"] <= 1.0


def test_ci_deterministic(solution):
    """Repeat runs with the same data give the same CI (seed=0)."""
    a_lens = [50] * 30 + [5] * 20
    b_lens = [5] * 30 + [50] * 20
    a_outs = _triples(["a" * n for n in a_lens])
    b_outs = _triples(["b" * n for n in b_lens])
    r1 = solution.win_rate(a_outs, b_outs, length_judge)
    r2 = solution.win_rate(a_outs, b_outs, length_judge)
    assert r1["ci_low"] == r2["ci_low"]
    assert r1["ci_high"] == r2["ci_high"]


def test_ci_narrows_with_more_data(solution):
    """More data → tighter CI for the same win rate."""
    # Small sample: 6 wins / 10
    small_a = _triples(["a" * 50] * 6 + ["a" * 5] * 4)
    small_b = _triples(["b" * 5] * 6 + ["b" * 50] * 4)
    r_small = solution.win_rate(small_a, small_b, length_judge)

    # Large sample: 60 wins / 100 — same win rate, more data
    large_a = _triples(["a" * 50] * 60 + ["a" * 5] * 40)
    large_b = _triples(["b" * 5] * 60 + ["b" * 50] * 40)
    r_large = solution.win_rate(large_a, large_b, length_judge)

    width_small = r_small["ci_high"] - r_small["ci_low"]
    width_large = r_large["ci_high"] - r_large["ci_low"]
    assert width_large < width_small


def test_runs_under_2s(solution):
    """Even at n=200 the bootstrap should be fast (<2s)."""
    import time
    a_lens = [50] * 120 + [5] * 80
    b_lens = [5] * 120 + [50] * 80
    a_outs = _triples(["a" * n for n in a_lens])
    b_outs = _triples(["b" * n for n in b_lens])
    t0 = time.time()
    solution.win_rate(a_outs, b_outs, length_judge)
    assert (time.time() - t0) < 2.0
