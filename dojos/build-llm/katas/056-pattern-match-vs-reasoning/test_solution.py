"""Tests for Pattern Match vs Reasoning."""

import pytest


# ----- solve_by_memorize -----


def test_memorize_returns_known(solution):
    memo = {"1 + 1": 2, "2 + 2": 4}
    assert solution.solve_by_memorize("1 + 1", memo) == 2
    assert solution.solve_by_memorize("2 + 2", memo) == 4


def test_memorize_returns_none_on_unseen(solution):
    memo = {"1 + 1": 2}
    assert solution.solve_by_memorize("3 + 4", memo) is None


def test_memorize_does_not_compute(solution):
    """If the memo has a wrong answer, memorize must return it verbatim.

    This proves memorize is doing lookup, not computation.
    """
    memo = {"2 + 2": 9999}
    assert solution.solve_by_memorize("2 + 2", memo) == 9999


# ----- solve_by_reasoning -----


def test_reasoning_single_digit(solution):
    assert solution.solve_by_reasoning("1 + 1") == 2
    assert solution.solve_by_reasoning("3 + 4") == 7


def test_reasoning_with_carry(solution):
    assert solution.solve_by_reasoning("9 + 1") == 10
    assert solution.solve_by_reasoning("99 + 1") == 100
    assert solution.solve_by_reasoning("23 + 19") == 42


def test_reasoning_different_lengths(solution):
    assert solution.solve_by_reasoning("999 + 2") == 1001
    assert solution.solve_by_reasoning("1 + 9999") == 10000


def test_reasoning_returns_int(solution):
    result = solution.solve_by_reasoning("5 + 5")
    assert isinstance(result, int)
    assert result == 10


# ----- the central comparison -----


@pytest.mark.parametrize(
    "problem,expected",
    [
        ("12 + 34", 46),
        ("100 + 250", 350),
        ("987 + 13", 1000),
        ("7 + 8", 15),
    ],
)
def test_reasoning_generalizes_memorize_does_not(solution, problem, expected):
    """The seed memo only contains 1+1 through 5+5. Memorize fails on
    everything else; reasoning gets every one of them right.

    This is the whole point of the kata: a procedure generalizes, a
    lookup does not.
    """
    memo = {f"{i} + {i}": 2 * i for i in range(1, 6)}
    assert solution.solve_by_memorize(problem, memo) is None
    assert solution.solve_by_reasoning(problem) == expected


def test_memorize_and_reasoning_agree_on_memo(solution):
    """Inside the memo's domain, both solvers return the same answer."""
    memo = {f"{i} + {i}": 2 * i for i in range(1, 6)}
    for problem, expected in memo.items():
        assert solution.solve_by_memorize(problem, memo) == expected
        assert solution.solve_by_reasoning(problem) == expected
