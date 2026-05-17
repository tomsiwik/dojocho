"""Tests for exact-match-and-f1."""

import pytest


# ---- normalize -----------------------------------------------------------

def test_normalize_lowercases(solution):
    assert solution.normalize("Hello World") == "hello world"


def test_normalize_strips_articles(solution):
    assert solution.normalize("the cat") == "cat"
    assert solution.normalize("a dog") == "dog"
    assert solution.normalize("an apple") == "apple"


def test_normalize_keeps_articles_inside_words(solution):
    # 'the' inside 'that' must survive
    assert "that" in solution.normalize("that thing")


def test_normalize_strips_punctuation(solution):
    out = solution.normalize("Hello, world!")
    assert "," not in out and "!" not in out


def test_normalize_collapses_whitespace(solution):
    assert solution.normalize("hello    world") == "hello world"


# ---- exact_match ---------------------------------------------------------

def test_em_identical(solution):
    assert solution.exact_match("Paris", "Paris") == 1


def test_em_after_normalization(solution):
    assert solution.exact_match("The Paris", "paris") == 1
    assert solution.exact_match("Paris.", "paris") == 1


def test_em_different(solution):
    assert solution.exact_match("London", "Paris") == 0


def test_em_substring_does_not_count(solution):
    # 'Paris is the capital' contains 'Paris' but EM is strict equality
    assert solution.exact_match("Paris is the capital", "Paris") == 0


def test_em_returns_int(solution):
    result = solution.exact_match("a", "a")
    assert isinstance(result, int)
    assert result in (0, 1)


# ---- f1_score ------------------------------------------------------------

def test_f1_perfect_match(solution):
    assert solution.f1_score(["a", "b", "c"], ["a", "b", "c"]) == 1.0


def test_f1_no_overlap(solution):
    assert solution.f1_score(["a", "b"], ["c", "d"]) == 0.0


def test_f1_partial_overlap(solution):
    # pred = [a, b], gold = [a, c]
    # num_same = 1, precision = 0.5, recall = 0.5, F1 = 0.5
    assert solution.f1_score(["a", "b"], ["a", "c"]) == pytest.approx(0.5)


def test_f1_multiset_semantics(solution):
    # pred has 'a' twice, gold has 'a' once
    # num_same = min(2, 1) = 1
    # precision = 1/2 = 0.5, recall = 1/1 = 1.0
    # F1 = 2 * 0.5 * 1 / 1.5 = 2/3
    f1 = solution.f1_score(["a", "a"], ["a"])
    assert f1 == pytest.approx(2 / 3)


def test_f1_both_empty(solution):
    assert solution.f1_score([], []) == 1.0


def test_f1_pred_empty(solution):
    assert solution.f1_score([], ["a", "b"]) == 0.0


def test_f1_gold_empty(solution):
    assert solution.f1_score(["a", "b"], []) == 0.0


def test_f1_returns_float_between_zero_and_one(solution):
    f1 = solution.f1_score(["the", "cat", "sat"], ["a", "cat", "stood"])
    assert isinstance(f1, float)
    assert 0.0 <= f1 <= 1.0
