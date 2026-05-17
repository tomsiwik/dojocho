"""Tests for match-answers-layered."""

import pytest


# ---------- strict ----------

def test_strict_exact_match(solution):
    assert solution.match("42", "42", "strict") is True


def test_strict_rejects_whitespace(solution):
    assert solution.match(" 42 ", "42", "strict") is False


def test_strict_rejects_commas(solution):
    assert solution.match("1,000", "1000", "strict") is False


def test_strict_rejects_5_vs_5_0(solution):
    """'5' != '5.0' under strict comparison."""
    assert solution.match("5", "5.0", "strict") is False


# ---------- normalized ----------

def test_normalized_strips_commas(solution):
    assert solution.match("1,000", "1000", "normalized") is True


def test_normalized_strips_units(solution):
    assert solution.match("5 dogs", "5", "normalized") is True


def test_normalized_converts_fraction(solution):
    assert solution.match("1/2", "0.5", "normalized") is True


def test_normalized_rejects_different_values(solution):
    assert solution.match("5", "6", "normalized") is False


def test_normalized_still_distinguishes_5_vs_5_point_0(solution):
    """Normalize doesn't touch '5.0' vs '5' — that's math_equivalent's job."""
    assert solution.match("5", "5.0", "normalized") is False


# ---------- math_equivalent ----------

def test_math_equivalent_5_vs_5_0(solution):
    assert solution.match("5", "5.0", "math_equivalent") is True


def test_math_equivalent_close_floats(solution):
    """0.333333 vs 1/3 — both parse, math equivalence holds within tolerance."""
    assert solution.match("0.333333", "0.3333333333", "math_equivalent") is True


def test_math_equivalent_fraction_vs_decimal(solution):
    assert solution.match("14/3", "4.666666666", "math_equivalent") is True


def test_math_equivalent_rejects_different_values(solution):
    assert solution.match("5", "6", "math_equivalent") is False


def test_math_equivalent_falls_back_to_normalized(solution):
    """Non-numeric answers can't be compared as floats — use normalized."""
    assert solution.match("hello", "hello", "math_equivalent") is True


def test_math_equivalent_falls_back_rejects_mismatch(solution):
    assert solution.match("hello", "world", "math_equivalent") is False


# ---------- error handling ----------

def test_unknown_level_raises(solution):
    with pytest.raises(ValueError):
        solution.match("1", "1", "fuzzy")
