"""Tests for simple-regex-tokenizer — SimpleTokenizerV1."""

import pytest


SAMPLE = '"It\'s the last he painted, you know," Mrs. Gisburn said.'


def test_tokenize_keeps_capitalization(solution):
    tokens = solution.tokenize("The Cat sat.")
    assert "The" in tokens
    assert "Cat" in tokens


def test_tokenize_splits_punctuation(solution):
    tokens = solution.tokenize("Hello, world.")
    assert tokens == ["Hello", ",", "world", "."]


def test_tokenize_handles_double_dash(solution):
    tokens = solution.tokenize("genius--though")
    assert "--" in tokens
    assert "genius" in tokens
    assert "though" in tokens


def test_tokenize_drops_whitespace_items(solution):
    tokens = solution.tokenize("a   b")
    assert tokens == ["a", "b"]


def test_build_vocab_deterministic_sorted(solution):
    a = solution.build_vocab(["c", "a", "b"])
    b = solution.build_vocab(["b", "a", "c"])
    assert a == b
    # Sorted assignment: 'a' gets the smallest id.
    assert a["a"] < a["b"] < a["c"]


def test_build_vocab_unique(solution):
    tokens = ["the", "cat", "the", "mat"]
    v = solution.build_vocab(tokens)
    assert len(v) == 3
    assert len(set(v.values())) == 3


def test_encode_returns_ids(solution):
    tokens = solution.tokenize(SAMPLE)
    vocab = solution.build_vocab(tokens)
    tok = solution.SimpleTokenizerV1(vocab)
    ids = tok.encode(SAMPLE)
    assert isinstance(ids, list)
    assert all(isinstance(i, int) for i in ids)
    assert len(ids) == len(tokens)


def test_decode_roundtrip_no_punct_space(solution):
    """decode(encode(...)) should not have a space before punctuation."""
    tokens = solution.tokenize(SAMPLE)
    vocab = solution.build_vocab(tokens)
    tok = solution.SimpleTokenizerV1(vocab)
    decoded = tok.decode(tok.encode(SAMPLE))
    # No "word ," or "word ." artifacts.
    assert " ," not in decoded
    assert " ." not in decoded
    assert " !" not in decoded
    assert " ?" not in decoded


def test_decode_preserves_words(solution):
    tokens = solution.tokenize(SAMPLE)
    vocab = solution.build_vocab(tokens)
    tok = solution.SimpleTokenizerV1(vocab)
    decoded = tok.decode(tok.encode(SAMPLE))
    for word in ["Mrs", "Gisburn", "painted", "know"]:
        assert word in decoded


def test_encode_raises_keyerror_on_unknown(solution):
    """V1 has no <|unk|>. New words must crash."""
    vocab = solution.build_vocab(solution.tokenize("the cat sat."))
    tok = solution.SimpleTokenizerV1(vocab)
    with pytest.raises(KeyError):
        tok.encode("Hello, do you like tea?")
