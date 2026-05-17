"""Tests for normalize-numeric-answer."""

import pytest


def test_strips_whitespace(solution):
    assert solution.normalize("  42 ") == "42"


def test_strips_commas_in_thousands(solution):
    assert solution.normalize("1,000") == "1000"


def test_strips_commas_in_millions(solution):
    assert solution.normalize("1,234,567") == "1234567"


def test_strips_trailing_unit_word(solution):
    assert solution.normalize("5 dogs") == "5"


def test_strips_trailing_unit_meters(solution):
    assert solution.normalize("42 meters") == "42"


def test_combines_comma_and_unit(solution):
    assert solution.normalize("1,000 dollars") == "1000"


def test_half_fraction(solution):
    assert solution.normalize("1/2") == "0.5"


def test_third_fraction_rounds_to_six_dp(solution):
    assert solution.normalize("1/3") == "0.333333"


def test_improper_fraction(solution):
    assert solution.normalize("14/3") == "4.666667"


def test_whole_number_fraction(solution):
    """4/2 == 2, but rounding to 6 dp produces "2.0"."""
    result = solution.normalize("4/2")
    # Accept either "2" or "2.0" — both round-trip to the same float.
    assert float(result) == pytest.approx(2.0)


def test_negative_integer(solution):
    assert solution.normalize("-5") == "-5"


def test_plain_decimal_unchanged(solution):
    assert solution.normalize("0.5") == "0.5"


def test_non_numeric_unchanged(solution):
    assert solution.normalize("hello") == "hello"


def test_empty_string(solution):
    assert solution.normalize("") == ""
