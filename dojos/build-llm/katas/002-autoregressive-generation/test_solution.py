"""Tests for 002 — Autoregressive Generation."""

import random
from collections import Counter, defaultdict


def _bigrams_from(tokens: list[str]) -> dict[str, Counter]:
    b: dict[str, Counter] = defaultdict(Counter)
    for prev, nxt in zip(tokens, tokens[1:]):
        b[prev][nxt] += 1
    return b


def test_sample_next_greedy_argmax(solution):
    bigrams = _bigrams_from(["x", "common"] * 5 + ["x", "rare"])
    assert solution.sample_next(bigrams, "x", temperature=0.0) == "common"


def test_sample_next_greedy_ignores_rng(solution):
    """Temperature 0 is deterministic regardless of rng."""
    bigrams = _bigrams_from(["x", "common"] * 5 + ["x", "rare"])
    for seed in range(5):
        rng = random.Random(seed)
        assert solution.sample_next(bigrams, "x", temperature=0.0, rng=rng) == "common"


def test_sample_next_end_token(solution):
    """A word with no followers returns '<end>'."""
    bigrams = _bigrams_from(["a", "b"])
    assert solution.sample_next(bigrams, "b") == "<end>"


def test_sample_next_unknown_word(solution):
    """An unknown word also returns '<end>'."""
    bigrams = _bigrams_from(["a", "b", "a", "b"])
    assert solution.sample_next(bigrams, "missing") == "<end>"


def test_sample_next_deterministic_given_seed(solution):
    """Same RNG seed → same sample."""
    bigrams = _bigrams_from(["x", "a", "x", "b", "x", "c"] * 3)
    a = solution.sample_next(bigrams, "x", temperature=1.0, rng=random.Random(42))
    b = solution.sample_next(bigrams, "x", temperature=1.0, rng=random.Random(42))
    assert a == b


def test_generate_greedy_starts_with_seed(solution):
    bigrams = _bigrams_from(["the", "cat", "sat", "on", "the", "mat"])
    out = solution.generate(bigrams, "the", 5, temperature=0.0)
    assert isinstance(out, list)
    assert out[0] == "the"


def test_generate_respects_n_tokens(solution):
    """If no <end> is hit, generate exactly n_tokens tokens."""
    tokens = ["loop"] * 10
    bigrams = _bigrams_from(tokens)
    out = solution.generate(bigrams, "loop", 5, temperature=0.0)
    assert len(out) == 5


def test_generate_stops_on_end(solution):
    """If sample_next returns <end>, generate stops early."""
    # 'a' → 'b' always; 'b' has no follower.
    bigrams = _bigrams_from(["a", "b"])
    out = solution.generate(bigrams, "a", 100, temperature=0.0)
    assert out == ["a", "b"]


def test_generate_greedy_is_deterministic(solution):
    """Greedy generation is deterministic — same call, same output."""
    bigrams = _bigrams_from(["the", "cat", "sat", "the", "dog", "ran"] * 3)
    a = solution.generate(bigrams, "the", 10, temperature=0.0)
    b = solution.generate(bigrams, "the", 10, temperature=0.0)
    assert a == b


def test_generate_sampled_is_deterministic_with_seed(solution):
    """Sampled generation is reproducible given rng_seed."""
    bigrams = _bigrams_from(["x", "a", "x", "b", "x", "c"] * 3)
    a = solution.generate(bigrams, "x", 5, temperature=1.0, rng_seed=7)
    b = solution.generate(bigrams, "x", 5, temperature=1.0, rng_seed=7)
    assert a == b
