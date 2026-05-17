"""Tests for response-distillation-dataset.

We use a tiny character-level tokenizer (vocab = lowercase letters
plus space plus EOS) and a tiny teacher LM. The teacher's outputs
are deterministic under greedy decoding, so we can assert exact
shape and reproducibility properties.
"""

import torch
import torch.nn as nn


# Tiny char tokenizer ------------------------------------------------

VOCAB_CHARS = list("abcdefghijklmnopqrstuvwxyz ")
EOS_ID = len(VOCAB_CHARS)  # one past the last char
VOCAB_SIZE = len(VOCAB_CHARS) + 1


class TinyTokenizer:
    eos_id = EOS_ID
    vocab_size = VOCAB_SIZE

    def encode(self, text):
        return [VOCAB_CHARS.index(c) for c in text.lower() if c in VOCAB_CHARS]

    def decode(self, ids):
        out = []
        for i in ids:
            if i == self.eos_id:
                break
            out.append(VOCAB_CHARS[i])
        return "".join(out)


# Tiny teacher -------------------------------------------------------

class TinyTeacher(nn.Module):
    def __init__(self, vocab=VOCAB_SIZE, d_model=16):
        super().__init__()
        self.embed = nn.Embedding(vocab, d_model)
        self.h = nn.Linear(d_model, d_model)
        self.head = nn.Linear(d_model, vocab)

    def forward(self, x):
        h = torch.tanh(self.h(self.embed(x)))
        return self.head(h)


def _make_teacher(seed=0):
    torch.manual_seed(seed)
    return TinyTeacher()


# Tests --------------------------------------------------------------


def test_returns_list_of_pairs(solution):
    teacher = _make_teacher()
    tok = TinyTokenizer()
    prompts = ["hello", "world", "ab"]
    out = solution.make_distill_dataset(
        teacher, prompts, tok, max_new_tokens=8, seed=0
    )
    assert isinstance(out, list)
    assert len(out) == 3
    for pair in out:
        assert isinstance(pair, tuple)
        assert len(pair) == 2


def test_pairs_are_long_tensors(solution):
    teacher = _make_teacher()
    tok = TinyTokenizer()
    out = solution.make_distill_dataset(
        teacher, ["hi", "go"], tok, max_new_tokens=4, seed=0
    )
    for prompt_ids, response_ids in out:
        assert isinstance(prompt_ids, torch.Tensor)
        assert isinstance(response_ids, torch.Tensor)
        assert prompt_ids.dtype == torch.long
        assert response_ids.dtype == torch.long
        assert prompt_ids.dim() == 1
        assert response_ids.dim() == 1


def test_prompt_ids_match_tokenizer(solution):
    teacher = _make_teacher()
    tok = TinyTokenizer()
    prompts = ["hello", "world"]
    out = solution.make_distill_dataset(
        teacher, prompts, tok, max_new_tokens=4, seed=0
    )
    for prompt, (prompt_ids, _) in zip(prompts, out):
        assert prompt_ids.tolist() == tok.encode(prompt)


def test_response_length_capped(solution):
    teacher = _make_teacher()
    tok = TinyTokenizer()
    out = solution.make_distill_dataset(
        teacher, ["hi"], tok, max_new_tokens=5, seed=0
    )
    _, response_ids = out[0]
    assert len(response_ids) <= 5


def test_response_excludes_prompt(solution):
    """`response_ids` must be ONLY the newly generated tokens, not
    the prompt. We check by length: response_ids length <= max_new_tokens
    and never includes the prompt tokens at the start."""
    teacher = _make_teacher()
    tok = TinyTokenizer()
    out = solution.make_distill_dataset(
        teacher, ["hello world"], tok, max_new_tokens=4, seed=0
    )
    prompt_ids, response_ids = out[0]
    assert len(response_ids) <= 4
    # The response shouldn't start with the prompt sequence.
    if len(response_ids) >= len(prompt_ids):
        assert response_ids[: len(prompt_ids)].tolist() != prompt_ids.tolist()


def test_deterministic_given_seed(solution):
    """Same seed, same prompts, same teacher → bit-identical output."""
    teacher = _make_teacher(seed=42)
    tok = TinyTokenizer()
    prompts = ["abc", "xyz", "hello"]

    out1 = solution.make_distill_dataset(
        teacher, prompts, tok, max_new_tokens=8, seed=123
    )
    out2 = solution.make_distill_dataset(
        teacher, prompts, tok, max_new_tokens=8, seed=123
    )

    assert len(out1) == len(out2)
    for (p1, r1), (p2, r2) in zip(out1, out2):
        assert torch.equal(p1, p2)
        assert torch.equal(r1, r2)


def test_stops_on_eos(solution):
    """If the teacher's argmax is forced to EOS at the first position,
    the response should be empty."""

    class AlwaysEOS(nn.Module):
        def forward(self, x):
            # Logits favouring EOS strongly at every position.
            B, T = x.shape
            logits = torch.full((B, T, VOCAB_SIZE), -10.0)
            logits[..., EOS_ID] = 10.0
            return logits

    tok = TinyTokenizer()
    out = solution.make_distill_dataset(
        AlwaysEOS(), ["hi"], tok, max_new_tokens=8, seed=0
    )
    _, response_ids = out[0]
    assert response_ids.numel() == 0


def test_works_with_no_eos(solution):
    """A tokenizer without an EOS (eos_id=None) should not crash."""

    class NoEOSTokenizer(TinyTokenizer):
        eos_id = None

    teacher = _make_teacher()
    out = solution.make_distill_dataset(
        teacher, ["hi"], NoEOSTokenizer(), max_new_tokens=3, seed=0
    )
    _, response_ids = out[0]
    # No EOS check → we should generate exactly max_new_tokens tokens.
    assert response_ids.numel() == 3


def test_teacher_not_modified(solution):
    """The teacher's params must not change during dataset generation."""
    teacher = _make_teacher()
    before = {k: v.detach().clone() for k, v in teacher.state_dict().items()}
    tok = TinyTokenizer()
    solution.make_distill_dataset(
        teacher, ["hi", "bye"], tok, max_new_tokens=4, seed=0
    )
    after = teacher.state_dict()
    for k in before:
        assert torch.allclose(before[k], after[k]), (
            f"teacher param {k} changed during generation"
        )
