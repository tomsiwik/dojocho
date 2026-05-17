"""Tests for tokenizer-with-special-tokens — SimpleTokenizerV2."""


CORPUS_TOKENS = ["the", "cat", "sat", "on", "mat", ".", ","]


def test_vocab_includes_special_tokens(solution):
    v = solution.build_vocab_v2(CORPUS_TOKENS)
    assert "<|unk|>" in v
    assert "<|endoftext|>" in v


def test_vocab_special_tokens_are_last(solution):
    v = solution.build_vocab_v2(CORPUS_TOKENS)
    max_id = max(v.values())
    # The two largest ids belong to the specials.
    largest_two = {tok for tok, i in v.items() if i >= max_id - 1}
    assert largest_two == {"<|unk|>", "<|endoftext|>"}


def test_vocab_size(solution):
    v = solution.build_vocab_v2(CORPUS_TOKENS)
    # 7 unique base tokens + 2 specials.
    assert len(v) == 9


def test_encode_unknown_word_becomes_unk(solution):
    v = solution.build_vocab_v2(CORPUS_TOKENS)
    tok = solution.SimpleTokenizerV2(v)
    ids = tok.encode("the dog sat.")
    # "dog" was not in vocab → its id must equal vocab["<|unk|>"].
    assert v["<|unk|>"] in ids


def test_encode_does_not_crash_on_unknown(solution):
    v = solution.build_vocab_v2(CORPUS_TOKENS)
    tok = solution.SimpleTokenizerV2(v)
    # If we get here at all, encode() did not raise.
    ids = tok.encode("a totally unseen sentence!")
    assert isinstance(ids, list)
    assert len(ids) > 0


def test_endoftext_passes_through(solution):
    v = solution.build_vocab_v2(CORPUS_TOKENS)
    tok = solution.SimpleTokenizerV2(v)
    text = "the cat. <|endoftext|> the mat."
    ids = tok.encode(text)
    # The endoftext id must appear in the result.
    assert v["<|endoftext|>"] in ids
    # And exactly once.
    assert ids.count(v["<|endoftext|>"]) == 1


def test_endoftext_not_decomposed(solution):
    """If you naively re-tokenized, <|endoftext|> would become 5 unk
    tokens. Check that didn't happen.
    """
    v = solution.build_vocab_v2(CORPUS_TOKENS)
    tok = solution.SimpleTokenizerV2(v)
    ids = tok.encode("<|endoftext|>")
    # One id, not five.
    assert ids == [v["<|endoftext|>"]]


def test_decode_renders_unk_for_unknowns(solution):
    v = solution.build_vocab_v2(CORPUS_TOKENS)
    tok = solution.SimpleTokenizerV2(v)
    decoded = tok.decode(tok.encode("Hello dog!"))
    # Two unknown words → <|unk|> appears in decoded.
    assert "<|unk|>" in decoded


def test_roundtrip_is_lossy_for_oov(solution):
    """V2's design tradeoff: OOV words are not recoverable."""
    v = solution.build_vocab_v2(CORPUS_TOKENS)
    tok = solution.SimpleTokenizerV2(v)
    original = "Hello"
    decoded = tok.decode(tok.encode(original))
    assert "Hello" not in decoded
    assert "<|unk|>" in decoded
