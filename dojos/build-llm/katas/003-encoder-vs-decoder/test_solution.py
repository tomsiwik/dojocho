"""Tests for 003 — Encoder vs Decoder."""

from collections import Counter

CORPUS = (
    "the north wind and the sun were disputing which was the stronger "
    "when a traveler came along wrapped in a warm cloak"
).split()


def test_build_directional_basic(solution):
    """In 'a b c', right['a']['b']=1, left['b']['a']=1."""
    tokens = ["a", "b", "c"]
    left, right = solution.build_directional_bigrams(tokens)
    assert right["a"]["b"] == 1
    assert right["b"]["c"] == 1
    assert left["b"]["a"] == 1
    assert left["c"]["b"] == 1


def test_build_directional_counts_match(solution):
    """The number of (prev, nxt) pairs equals len(tokens) - 1, on both sides."""
    tokens = CORPUS
    left, right = solution.build_directional_bigrams(tokens)
    right_total = sum(sum(c.values()) for c in right.values())
    left_total = sum(sum(c.values()) for c in left.values())
    assert right_total == len(tokens) - 1
    assert left_total == len(tokens) - 1


def test_predict_next_argmax(solution):
    _, right = solution.build_directional_bigrams(CORPUS)
    # "north" is followed by "wind" in this corpus.
    assert solution.predict_next(right, "north") == "wind"


def test_predict_next_unknown(solution):
    _, right = solution.build_directional_bigrams(CORPUS)
    assert solution.predict_next(right, "never_seen") == "<unknown>"


def test_fill_blank_middle(solution):
    """['the', '___', 'wind'] should vote 'north' (sole right[wind] vote)."""
    left, right = solution.build_directional_bigrams(CORPUS)
    assert solution.fill_blank(["the", "___", "wind"], left, right) == "north"


def test_fill_blank_at_start(solution):
    """['___', 'wind'] — only left[after] (= left['wind']) votes."""
    left, right = solution.build_directional_bigrams(CORPUS)
    result = solution.fill_blank(["___", "wind"], left, right)
    # left[wind] = {'north': 2}
    assert result == "north"


def test_fill_blank_at_end(solution):
    """['the', '___'] — only right[before] votes."""
    left, right = solution.build_directional_bigrams(CORPUS)
    result = solution.fill_blank(["the", "___"], left, right)
    # right["the"] has multiple candidates; argmax tied — accept any common follower.
    assert result in {"north", "sun", "stronger"}


def test_fill_blank_no_candidates(solution):
    """If both sides are unknown, return '<unknown>'."""
    left, right = solution.build_directional_bigrams(["a", "b", "c"])
    result = solution.fill_blank(["unknown_left", "___", "unknown_right"], left, right)
    assert result == "<unknown>"
