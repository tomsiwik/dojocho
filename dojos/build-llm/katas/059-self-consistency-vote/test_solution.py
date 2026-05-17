"""Tests for Self-Consistency Vote."""

import pytest


# ----- majority_vote -----


def test_majority_vote_unanimous(solution):
    assert solution.majority_vote(["42", "42", "42"]) == "42"


def test_majority_vote_simple_plurality(solution):
    assert solution.majority_vote(["42", "42", "41", "42", "43"]) == "42"


def test_majority_vote_returns_string(solution):
    result = solution.majority_vote(["a", "b", "a"])
    assert isinstance(result, str)
    assert result == "a"


def test_majority_vote_tie_lex_smallest(solution):
    """Tied answers => lexicographically smallest wins (deterministic)."""
    # "a" and "b" both appear twice; "a" < "b" lexicographically.
    assert solution.majority_vote(["a", "b", "a", "b"]) == "a"


@pytest.mark.parametrize(
    "answers,acceptable",
    [
        # When there's a clear majority, it must win.
        (["x", "y", "x", "x"], {"x"}),
        (["z", "z", "y"], {"z"}),
        # When tied, either answer in the tied set is acceptable IF
        # tie-breaking is non-deterministic; our reference uses lex
        # smallest, so this test just enumerates the tied set.
        (["a", "b"], {"a", "b"}),
    ],
)
def test_majority_vote_clear_majority(solution, answers, acceptable):
    assert solution.majority_vote(answers) in acceptable


# ----- weighted_majority -----


def test_weighted_majority_single_winner(solution):
    pairs = [("a", 1.0), ("b", 2.0), ("a", 0.5)]
    # a: 1.5, b: 2.0 => b wins
    assert solution.weighted_majority(pairs) == "b"


def test_weighted_majority_overrides_count(solution):
    """The key test: a low-count answer can win if its weights are big.

    Plain majority would pick "a" (3 votes vs 1). But with weights, "b"
    has weight 10.0 versus "a"'s total of 3 * 1.0 = 3.0.
    """
    pairs = [("a", 1.0), ("a", 1.0), ("a", 1.0), ("b", 10.0)]
    assert solution.weighted_majority(pairs) == "b"


def test_weighted_majority_unit_weights_match_majority(solution):
    """With every weight = 1.0, weighted result equals plain majority."""
    answers = ["x", "y", "x", "x", "y"]
    pairs = [(a, 1.0) for a in answers]
    assert solution.weighted_majority(pairs) == solution.majority_vote(answers)


def test_weighted_majority_tie_lex_smallest(solution):
    """Equal weights summed equal => lex smallest wins."""
    pairs = [("b", 1.0), ("a", 1.0)]
    assert solution.weighted_majority(pairs) == "a"


def test_weighted_majority_returns_string(solution):
    result = solution.weighted_majority([("only", 0.7)])
    assert isinstance(result, str)
    assert result == "only"


def test_weighted_majority_handles_floats(solution):
    pairs = [("a", 0.4), ("a", 0.3), ("b", 0.6)]
    # a: 0.7, b: 0.6 => a
    assert solution.weighted_majority(pairs) == "a"
