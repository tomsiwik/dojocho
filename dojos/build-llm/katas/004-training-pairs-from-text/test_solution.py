"""Tests for 004 — Training Pairs from Text."""


def test_build_vocab_unique_ids(solution):
    """Every unique token maps to a unique ID."""
    tokens = ["the", "cat", "sat", "on", "the", "mat"]
    vocab = solution.build_vocab(tokens, include_unk=False)
    assert len(vocab) == 5  # the, cat, sat, on, mat
    assert len(set(vocab.values())) == len(vocab)


def test_build_vocab_unk_reserved_zero(solution):
    """When include_unk=True, '<unk>' takes ID 0."""
    tokens = ["a", "b", "c"]
    vocab = solution.build_vocab(tokens, include_unk=True)
    assert vocab["<unk>"] == 0


def test_build_vocab_deterministic_sorted(solution):
    """Same tokens in any order → same vocab IDs (sorted assignment)."""
    a = solution.build_vocab(["c", "a", "b"], include_unk=False)
    b = solution.build_vocab(["b", "c", "a"], include_unk=False)
    assert a == b


def test_tokenize_to_ids_basic(solution):
    vocab = solution.build_vocab(["the", "cat"], include_unk=True)
    ids = solution.tokenize_to_ids("the cat", vocab)
    assert ids == [vocab["the"], vocab["cat"]]


def test_tokenize_to_ids_unk(solution):
    vocab = solution.build_vocab(["the", "cat"], include_unk=True)
    ids = solution.tokenize_to_ids("the dog", vocab)
    assert ids[1] == vocab["<unk>"]


def test_tokenize_to_ids_raises_without_unk(solution):
    vocab = solution.build_vocab(["the", "cat"], include_unk=False)
    import pytest
    with pytest.raises(KeyError):
        solution.tokenize_to_ids("the dog", vocab)


def test_sliding_window_basic(solution):
    """tokens=[1..7], max_len=4, stride=1 should give 3 pairs."""
    ids = [1, 2, 3, 4, 5, 6, 7]
    pairs = list(solution.sliding_window_pairs(ids, max_length=4, stride=1))
    assert len(pairs) == 3
    assert pairs[0] == ([1, 2, 3, 4], [2, 3, 4, 5])
    assert pairs[1] == ([2, 3, 4, 5], [3, 4, 5, 6])
    assert pairs[2] == ([3, 4, 5, 6], [4, 5, 6, 7])


def test_sliding_window_target_is_shifted(solution):
    """Target is always input shifted right by one."""
    ids = list(range(20))
    pairs = list(solution.sliding_window_pairs(ids, max_length=4, stride=2))
    for inp, tgt in pairs:
        assert len(inp) == 4 and len(tgt) == 4
        # For consecutive integers, target[j] = input[j] + 1.
        assert all(t == i + 1 for i, t in zip(inp, tgt))


def test_sliding_window_stride_2(solution):
    ids = [1, 2, 3, 4, 5, 6, 7]
    pairs = list(solution.sliding_window_pairs(ids, max_length=4, stride=2))
    # starts: 0, 2 — i=4 would put target past end.
    assert len(pairs) == 2
    assert pairs[0] == ([1, 2, 3, 4], [2, 3, 4, 5])
    assert pairs[1] == ([3, 4, 5, 6], [4, 5, 6, 7])


def test_sliding_window_stride_equals_window(solution):
    """stride == max_length → non-overlapping pairs."""
    ids = list(range(13))
    pairs = list(solution.sliding_window_pairs(ids, max_length=4, stride=4))
    # starts: 0, 4, 8 — i=8 OK (target ends at id[12]).
    assert len(pairs) == 3
    assert pairs[0] == ([0, 1, 2, 3], [1, 2, 3, 4])
    assert pairs[1] == ([4, 5, 6, 7], [5, 6, 7, 8])
    assert pairs[2] == ([8, 9, 10, 11], [9, 10, 11, 12])
