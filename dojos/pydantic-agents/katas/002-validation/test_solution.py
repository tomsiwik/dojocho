"""Tests for 002 — Validation."""

import pytest
from pydantic import ValidationError


def test_valid_signup(solution):
    """A valid signup should construct without errors."""
    form = solution.SignupForm(username="alice", email="alice@example.com", age=25)
    assert form.username == "alice"
    assert form.email == "alice@example.com"
    assert form.age == 25


def test_username_too_short(solution):
    """Username shorter than 3 characters should be rejected."""
    with pytest.raises(ValidationError):
        solution.SignupForm(username="ab", email="ab@example.com", age=25)


def test_username_too_long(solution):
    """Username longer than 20 characters should be rejected."""
    with pytest.raises(ValidationError):
        solution.SignupForm(username="a" * 21, email="long@example.com", age=25)


def test_invalid_email(solution):
    """An invalid email should be rejected."""
    with pytest.raises(ValidationError):
        solution.SignupForm(username="alice", email="not-an-email", age=25)


def test_age_under_18(solution):
    """Age under 18 should be rejected."""
    with pytest.raises(ValidationError):
        solution.SignupForm(username="alice", email="alice@example.com", age=16)


def test_age_exactly_18(solution):
    """Age exactly 18 should be accepted."""
    form = solution.SignupForm(username="alice", email="alice@example.com", age=18)
    assert form.age == 18
