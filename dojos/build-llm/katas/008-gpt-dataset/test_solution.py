"""Tests for gpt-dataset — GPTDatasetV1."""

import torch


class IdentityTokenizer:
    """A 'tokenizer' that just turns characters into their ord() values.

    Lets the tests be fully deterministic without hitting tiktoken's
    BPE merges. Conforms to the duck-type GPTDatasetV1 expects:
    a single `.encode(str) -> list[int]` method.
    """

    def encode(self, text: str) -> list[int]:
        return [ord(c) for c in text]


def test_dataset_basic_shape(solution):
    tok = IdentityTokenizer()
    ds = solution.GPTDatasetV1("abcdefghij", tok, max_length=4, stride=1)
    # len(ids) = 10, max_length = 4, stride = 1
    # Valid starts: 0..5 (i = 6 would put target at index 10, out of bounds)
    # range(0, 10 - 4, 1) = range(0, 6) = 6 windows.
    assert len(ds) == 6


def test_dataset_returns_tensors(solution):
    tok = IdentityTokenizer()
    ds = solution.GPTDatasetV1("abcdefgh", tok, max_length=4, stride=1)
    inp, tgt = ds[0]
    assert isinstance(inp, torch.Tensor)
    assert isinstance(tgt, torch.Tensor)
    assert inp.shape == (4,)
    assert tgt.shape == (4,)


def test_dataset_target_is_input_shifted_by_one(solution):
    tok = IdentityTokenizer()
    ds = solution.GPTDatasetV1("abcdefgh", tok, max_length=4, stride=1)
    for inp, tgt in [ds[i] for i in range(len(ds))]:
        # ord('b') = ord('a') + 1, etc.
        assert torch.equal(tgt, inp + 1)


def test_dataset_stride_2(solution):
    tok = IdentityTokenizer()
    ds = solution.GPTDatasetV1("abcdefghij", tok, max_length=4, stride=2)
    # range(0, 6, 2) = [0, 2, 4] = 3 windows.
    assert len(ds) == 3
    inp0, tgt0 = ds[0]
    inp1, tgt1 = ds[1]
    # Second window starts 2 positions later.
    assert int(inp1[0]) == int(inp0[0]) + 2


def test_dataset_stride_equals_window(solution):
    tok = IdentityTokenizer()
    ds = solution.GPTDatasetV1("abcdefghijklm", tok, max_length=4, stride=4)
    # len 13, max_length 4: range(0, 9, 4) = [0, 4, 8] = 3 windows.
    assert len(ds) == 3


def test_dataset_does_not_walk_off_end(solution):
    """The classic off-by-one: target[-1] must be a valid index."""
    tok = IdentityTokenizer()
    ds = solution.GPTDatasetV1("abcdefgh", tok, max_length=4, stride=1)
    inp_last, tgt_last = ds[len(ds) - 1]
    # Last target value must equal ord of last char.
    assert int(tgt_last[-1]) == ord("h")


def test_dataloader_batch_shape(solution):
    tok = IdentityTokenizer()
    loader = solution.create_dataloader_v1(
        "abcdefghijklmnop",
        tokenizer=tok,
        batch_size=2,
        max_length=4,
        stride=1,
        shuffle=False,
        drop_last=True,
        num_workers=0,
    )
    inputs, targets = next(iter(loader))
    assert inputs.shape == (2, 4)
    assert targets.shape == (2, 4)


def test_dataloader_drop_last(solution):
    """With drop_last=True and a non-divisible count, last partial
    batch is dropped.
    """
    tok = IdentityTokenizer()
    # 10 chars, max_length=4, stride=1 → 6 windows. batch_size=4 →
    # 1 full batch + 1 partial. drop_last=True → 1 batch total.
    loader = solution.create_dataloader_v1(
        "abcdefghij",
        tokenizer=tok,
        batch_size=4,
        max_length=4,
        stride=1,
        shuffle=False,
        drop_last=True,
        num_workers=0,
    )
    batches = list(loader)
    assert len(batches) == 1
    assert batches[0][0].shape == (4, 4)


def test_dataloader_keep_last_when_drop_last_false(solution):
    tok = IdentityTokenizer()
    loader = solution.create_dataloader_v1(
        "abcdefghij",
        tokenizer=tok,
        batch_size=4,
        max_length=4,
        stride=1,
        shuffle=False,
        drop_last=False,
        num_workers=0,
    )
    batches = list(loader)
    # 6 windows / batch 4 → 2 batches (one of size 2).
    assert len(batches) == 2
    assert batches[1][0].shape == (2, 4)


def test_dataloader_no_shuffle_is_sequential(solution):
    tok = IdentityTokenizer()
    loader = solution.create_dataloader_v1(
        "abcdefghij",
        tokenizer=tok,
        batch_size=1,
        max_length=4,
        stride=1,
        shuffle=False,
        drop_last=False,
        num_workers=0,
    )
    first_inputs = [b[0][0, 0].item() for b in loader]
    # With stride=1 and no shuffle, starting chars increase monotonically.
    assert first_inputs == sorted(first_inputs)
