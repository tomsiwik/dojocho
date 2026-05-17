"""Tests for autograd-hand-vs-machine.

The expected derivative is f'(x) = 2x + 3 (you derive this on paper).
"""

import pytest


@pytest.mark.parametrize("x,expected", [
    (0.0, 3.0),
    (1.0, 5.0),
    (2.0, 7.0),
    (-1.0, 1.0),
    (3.5, 10.0),
])
def test_manual_derivative_matches_formula(solution, x, expected):
    """The hand-derived formula is f'(x) = 2x + 3."""
    assert solution.manual_derivative(x) == pytest.approx(expected)


@pytest.mark.parametrize("x,expected", [
    (0.0, 3.0),
    (1.0, 5.0),
    (2.0, 7.0),
    (-1.0, 1.0),
    (3.5, 10.0),
])
def test_autograd_derivative_matches_formula(solution, x, expected):
    """Autograd should compute the same f'(x) = 2x + 3."""
    got = solution.autograd_derivative(x)
    assert isinstance(got, float)
    assert got == pytest.approx(expected, rel=1e-5, abs=1e-5)


@pytest.mark.parametrize("x", [0.0, 1.0, 2.0, -3.5, 7.25])
def test_compare_agrees(solution, x):
    """Hand and machine compute essentially the same number."""
    manual, machine, diff = solution.compare(x)
    assert diff < 1e-5
    assert manual == pytest.approx(machine, rel=1e-5, abs=1e-5)
