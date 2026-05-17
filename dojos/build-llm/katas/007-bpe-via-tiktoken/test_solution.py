"""Tests for bpe-via-tiktoken."""


def test_get_encoder_is_gpt2(solution):
    enc = solution.get_encoder()
    assert enc.name == "gpt2"


def test_vocab_size_is_50257(solution):
    enc = solution.get_encoder()
    assert solution.vocab_size(enc) == 50257


def test_encode_returns_list_of_ints(solution):
    enc = solution.get_encoder()
    ids = solution.encode("Hello, world!", enc)
    assert isinstance(ids, list)
    assert all(isinstance(i, int) for i in ids)
    assert len(ids) > 0


def test_roundtrip_preserves_text(solution):
    enc = solution.get_encoder()
    text = "The quick brown fox jumps over the lazy dog."
    decoded = solution.decode(solution.encode(text, enc), enc)
    assert decoded == text


def test_made_up_word_decomposes_into_subwords(solution):
    """'antidisestablishmentarianism' is not a single token in GPT-2.
    BPE must decompose it into multiple subword pieces.
    """
    enc = solution.get_encoder()
    ids = solution.encode("antidisestablishmentarianism", enc)
    # Definitely more than one piece.
    assert len(ids) >= 3
    # And the round-trip still works.
    assert solution.decode(ids, enc) == "antidisestablishmentarianism"


def test_decode_each_shows_subword_pieces(solution):
    """decode_each lets us see HOW BPE split the word."""
    enc = solution.get_encoder()
    ids = solution.encode("antidisestablishmentarianism", enc)
    pieces = solution.decode_each(ids, enc)
    assert isinstance(pieces, list)
    assert len(pieces) == len(ids)
    # Concatenation of pieces reconstructs the original.
    assert "".join(pieces) == "antidisestablishmentarianism"


def test_subword_pieces_are_real_substrings(solution):
    """Each subword piece for 'someunknownPlace' should be a substring
    of the original. (Sanity check on the BPE decomposition.)
    """
    enc = solution.get_encoder()
    word = "someunknownPlace"
    pieces = solution.decode_each(solution.encode(word, enc), enc)
    # Concatenation matches; that's the real invariant.
    assert "".join(pieces) == word
    # And each piece is non-empty.
    assert all(p for p in pieces)


def test_encode_without_special_rejects_endoftext(solution):
    """Plain encode() with <|endoftext|> in the text should error."""
    import pytest
    enc = solution.get_encoder()
    with pytest.raises(ValueError):
        solution.encode("hello <|endoftext|> world", enc)


def test_encode_with_endoftext_allows_the_marker(solution):
    """encode_with_endoftext returns 50256 as a single id for the
    marker, not a decomposition.
    """
    enc = solution.get_encoder()
    ids = solution.encode_with_endoftext("hi <|endoftext|> bye", enc)
    assert 50256 in ids
    # Exactly one occurrence (the marker is one token).
    assert ids.count(50256) == 1


def test_known_common_word_is_single_token(solution):
    """Common English words like 'Hello' are a single BPE token."""
    enc = solution.get_encoder()
    ids = solution.encode("Hello", enc)
    assert len(ids) == 1


def test_bpe_handles_arbitrary_unicode(solution):
    """BPE is byte-level — emoji, accents, anything round-trips."""
    enc = solution.get_encoder()
    text = "café 漢字 🚀"
    assert solution.decode(solution.encode(text, enc), enc) == text
