"""Tests for heuristic-scorer."""

import math


# --- score_length ----------------------------------------------------------


def test_length_empty_is_one(solution):
    assert solution.score_length("") == 1.0


def test_length_in_range(solution):
    for s in ["", "a", "a" * 100, "a" * 1000, "a" * 10_000]:
        v = solution.score_length(s)
        assert 0.0 <= v <= 1.0, f"out of range for len {len(s)}: {v}"


def test_length_matches_formula(solution):
    # exp(-len/500) for len=500 -> exp(-1) ~ 0.3679
    v = solution.score_length("x" * 500)
    assert math.isclose(v, math.exp(-1), rel_tol=1e-9)


def test_length_is_monotonic_decreasing(solution):
    """Longer answers score no higher than shorter ones."""
    scores = [solution.score_length("x" * n) for n in [0, 10, 100, 1000, 5000]]
    assert all(a >= b for a, b in zip(scores, scores[1:]))


# --- score_contains_keyword ------------------------------------------------


def test_keyword_hit(solution):
    assert solution.score_contains_keyword("the answer is 42", "answer") == 1.0


def test_keyword_miss(solution):
    assert solution.score_contains_keyword("the answer is 42", "banana") == 0.0


def test_keyword_case_insensitive(solution):
    assert solution.score_contains_keyword("BANANA bread", "banana") == 1.0
    assert solution.score_contains_keyword("banana bread", "BANANA") == 1.0


def test_keyword_empty_string_vacuously_contained(solution):
    assert solution.score_contains_keyword("anything", "") == 1.0
    assert solution.score_contains_keyword("", "") == 1.0


def test_keyword_returns_float(solution):
    v = solution.score_contains_keyword("hello", "hello")
    assert isinstance(v, float)


# --- score_boxed_format ----------------------------------------------------


def test_boxed_hit(solution):
    assert solution.score_boxed_format(r"the answer is \boxed{42}") == 1.0


def test_boxed_miss_no_box(solution):
    assert solution.score_boxed_format("the answer is 42") == 0.0


def test_boxed_miss_empty_braces(solution):
    """`\\boxed{}` with no content does not count as a formatted answer."""
    assert solution.score_boxed_format(r"see \boxed{}") == 0.0


def test_boxed_with_multichar_content(solution):
    assert solution.score_boxed_format(r"final: \boxed{x+y=7}") == 1.0


def test_boxed_returns_float(solution):
    v = solution.score_boxed_format(r"\boxed{1}")
    assert isinstance(v, float)
