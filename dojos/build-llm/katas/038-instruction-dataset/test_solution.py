"""Tests for Instruction Dataset."""

import pytest
import torch


class WordTokenizer:
    """Trivial word-level tokenizer that handles the Alpaca preamble.

    Splits on whitespace and `\\n`. Maps unknown tokens to <unk>.
    `pad_id` reserved as 0.
    """

    def __init__(self, vocab_words):
        # 0 = <pad>, 1 = <unk>, 2 = <nl> (for \n)
        self.pad_id = 0
        self.unk_id = 1
        self.nl_id = 2
        self.id_of = {"<pad>": 0, "<unk>": 1, "<nl>": 2}
        for w in vocab_words:
            if w not in self.id_of:
                self.id_of[w] = len(self.id_of)

    def encode(self, text: str) -> list[int]:
        # Replace newlines with a sentinel word, then split on whitespace.
        out = []
        for line in text.split("\n"):
            for w in line.split():
                out.append(self.id_of.get(w, self.unk_id))
            out.append(self.nl_id)
        # Drop the last trailing newline emission.
        if out and out[-1] == self.nl_id:
            out.pop()
        return out


EXAMPLES = [
    {"instruction": "say hi", "response": "hello"},
    {"instruction": "name a color", "response": "blue is nice"},
    {"instruction": "count to three", "response": "one two three"},
]

VOCAB = [
    "Below", "is", "an", "instruction", "that", "describes", "a", "task.",
    "Write", "response", "appropriately", "completes", "the", "request.",
    "###", "Instruction:", "Response:",
    "say", "hi", "hello",
    "name", "color", "blue", "nice",
    "count", "to", "three", "one", "two",
]


@pytest.fixture
def tokenizer():
    return WordTokenizer(VOCAB)


def test_len_matches_examples(solution, tokenizer):
    ds = solution.InstructionDataset(EXAMPLES, tokenizer, max_length=64)
    assert len(ds) == 3


def test_returns_three_tensors(solution, tokenizer):
    ds = solution.InstructionDataset(EXAMPLES, tokenizer, max_length=64)
    item = ds[0]
    assert isinstance(item, tuple) and len(item) == 3
    inp, tgt, mask = item
    for t in (inp, tgt, mask):
        assert isinstance(t, torch.Tensor)
        assert t.dtype == torch.long
        assert t.shape == (64,)


def test_target_is_shifted(solution, tokenizer):
    """target[i] == input[i+1] in the non-padding region."""
    ds = solution.InstructionDataset(EXAMPLES, tokenizer, max_length=64)
    inp, tgt, mask = ds[0]
    # Find the last non-padding position by walking input.
    pad_id = tokenizer.pad_id
    # Number of "real" positions = positions where either inp or tgt is non-pad.
    last_real = max(
        (i for i in range(64) if inp[i].item() != pad_id or tgt[i].item() != pad_id),
        default=-1,
    )
    assert last_real >= 0
    # For positions strictly inside the real region, target[i] == input[i+1].
    for i in range(last_real):
        # only check where input[i+1] is part of the real sequence
        if inp[i + 1].item() != pad_id:
            assert tgt[i].item() == inp[i + 1].item(), f"at i={i}"


def test_mask_zero_on_prompt(solution, tokenizer):
    """The first response token sits at a known position; mask=0 strictly before it."""
    ds = solution.InstructionDataset(EXAMPLES, tokenizer, max_length=64)
    # Compute the seam manually using the helper exposed by the solution.
    prompt_ids = tokenizer.encode(
        solution.format_alpaca(EXAMPLES[0]["instruction"], response=None)
    )
    # In target space, response begins at index len(prompt_ids) - 1.
    seam = len(prompt_ids) - 1
    _, _, mask = ds[0]
    assert mask[:seam].sum().item() == 0, "prompt positions must have mask=0"


def test_mask_one_on_response(solution, tokenizer):
    """All response target positions must have mask=1."""
    ds = solution.InstructionDataset(EXAMPLES, tokenizer, max_length=64)
    prompt_ids = tokenizer.encode(
        solution.format_alpaca(EXAMPLES[1]["instruction"], response=None)
    )
    full_ids = tokenizer.encode(
        solution.format_alpaca(EXAMPLES[1]["instruction"], response=EXAMPLES[1]["response"])
    )
    seam = len(prompt_ids) - 1
    response_len = len(full_ids) - len(prompt_ids)
    _, _, mask = ds[1]
    # response covers target positions [seam, seam + response_len).
    assert mask[seam : seam + response_len].sum().item() == response_len


def test_mask_zero_on_padding(solution, tokenizer):
    """Padding positions (after the real sequence) must have mask=0."""
    ds = solution.InstructionDataset(EXAMPLES, tokenizer, max_length=64)
    inp, tgt, mask = ds[0]
    pad_id = tokenizer.pad_id
    # Any position where target is padding must have mask 0.
    for i in range(64):
        if tgt[i].item() == pad_id and inp[i].item() == pad_id:
            assert mask[i].item() == 0


def test_truncation_when_too_long(solution, tokenizer):
    """If full encoded sequence exceeds max_length, truncate cleanly."""
    long_example = [{"instruction": "say hi", "response": "hello"}]
    ds = solution.InstructionDataset(long_example, tokenizer, max_length=8)
    inp, tgt, mask = ds[0]
    assert inp.shape == (8,)
    assert tgt.shape == (8,)
    assert mask.shape == (8,)


def test_padding_uses_pad_id(solution, tokenizer):
    """Padding values are tokenizer.pad_id (= 0 in the test tokenizer)."""
    ds = solution.InstructionDataset(EXAMPLES, tokenizer, max_length=128)
    inp, tgt, _ = ds[0]
    # In a length-128 sequence for a short example, the tail must be pad_id.
    assert inp[-1].item() == tokenizer.pad_id
    assert tgt[-1].item() == tokenizer.pad_id
