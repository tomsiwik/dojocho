"""Tests for 001 — Basic Model."""


def test_construction(solution):
    """UserProfile can be constructed with name, age, and email."""
    user = solution.UserProfile(name="Alice", age=30, email="alice@example.com")
    assert user.name == "Alice"
    assert user.age == 30
    assert user.email == "alice@example.com"


def test_field_types(solution):
    """Fields are coerced to their declared types."""
    user = solution.UserProfile(name="Bob", age="25", email="bob@example.com")
    assert isinstance(user.age, int)


def test_model_dump(solution):
    """model_dump() returns a plain dict."""
    user = solution.UserProfile(name="Alice", age=30, email="alice@example.com")
    data = user.model_dump()
    assert data == {"name": "Alice", "age": 30, "email": "alice@example.com"}


def test_model_json_roundtrip(solution):
    """model_dump_json() produces JSON that can reconstruct the model."""
    user = solution.UserProfile(name="Alice", age=30, email="alice@example.com")
    json_str = user.model_dump_json()
    restored = solution.UserProfile.model_validate_json(json_str)
    assert restored == user
