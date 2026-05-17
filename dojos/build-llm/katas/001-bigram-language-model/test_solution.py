"""Tests for 001 — Bigram Language Model."""

CORPUS = (
    "The North Wind and the Sun were disputing which was the stronger. "
    "Then the North Wind blew as hard as he could, but the more he blew "
    "the more closely did the traveler fold his cloak around him."
)


def test_tokenize_lowercases(solution):
    tokens = solution.tokenize("The Cat SAT on the MAT")
    assert all(t == t.lower() for t in tokens)


def test_tokenize_strips_punctuation(solution):
    tokens = solution.tokenize("Hello, world! This is fine.")
    assert "hello" in tokens and "world" in tokens
    assert "fine" in tokens
    # No tokens should end with a punctuation character.
    assert all(not t.endswith((".", ",", "!", "?")) for t in tokens)


def test_tokenize_returns_list_of_strings(solution):
    tokens = solution.tokenize("a b c")
    assert isinstance(tokens, list)
    assert all(isinstance(t, str) for t in tokens)
    assert tokens == ["a", "b", "c"]


def test_build_bigrams_counts(solution):
    """In 'a b a b a c', 'a' is followed by 'b' twice and 'c' once."""
    tokens = ["a", "b", "a", "b", "a", "c"]
    bigrams = solution.build_bigrams(tokens)
    assert bigrams["a"]["b"] == 2
    assert bigrams["a"]["c"] == 1


def test_build_bigrams_total_transitions(solution):
    """A bigram over N tokens has N-1 transitions."""
    tokens = solution.tokenize(CORPUS)
    bigrams = solution.build_bigrams(tokens)
    total = sum(sum(c.values()) for c in bigrams.values())
    assert total == len(tokens) - 1


def test_next_word_argmax(solution):
    """Most common follower wins."""
    tokens = ["x", "common"] * 5 + ["x", "rare"]
    bigrams = solution.build_bigrams(tokens)
    assert solution.next_word(bigrams, "x") == "common"


def test_next_word_unknown(solution):
    """Unknown word returns the sentinel."""
    tokens = ["a", "b", "a", "c"]
    bigrams = solution.build_bigrams(tokens)
    assert solution.next_word(bigrams, "never_seen") == "<unknown>"


def test_next_word_returns_string(solution):
    """next_word must return a str, not a tuple or Counter."""
    tokens = ["a", "b", "a", "b"]
    bigrams = solution.build_bigrams(tokens)
    result = solution.next_word(bigrams, "a")
    assert isinstance(result, str)
