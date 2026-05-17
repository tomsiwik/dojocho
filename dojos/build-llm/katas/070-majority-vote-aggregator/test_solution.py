"""Tests for majority-vote-aggregator."""


def test_clear_majority(solution):
    assert solution.majority_vote(["83", "83", "83", "20"]) == "83"


def test_single_answer(solution):
    assert solution.majority_vote(["42"]) == "42"


def test_empty(solution):
    assert solution.majority_vote([]) == ""


def test_tie_broken_alphabetically(solution):
    # "a" and "b" both occur twice -> alphabetically smallest wins.
    assert solution.majority_vote(["b", "a", "b", "a"]) == "a"


def test_tie_three_way(solution):
    assert solution.majority_vote(["c", "a", "b"]) == "a"


def test_all_same(solution):
    assert solution.majority_vote(["x"] * 7) == "x"


def test_whitespace_distinct(solution):
    # "83" and " 83" are different strings — no normalization here.
    assert solution.majority_vote(["83", "83", " 83"]) == "83"


def test_returns_string(solution):
    result = solution.majority_vote(["a", "a", "b"])
    assert isinstance(result, str)
