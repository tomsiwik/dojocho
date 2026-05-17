"""Tests for Instruction Train Step."""

import torch
import torch.nn as nn


VOCAB = 16
SEQ_LEN = 6
DIM = 12


class TinyLM(nn.Module):
    """Minimal next-token language model: embed → linear → linear → unembed."""

    def __init__(self, vocab=VOCAB, dim=DIM):
        super().__init__()
        self.emb = nn.Embedding(vocab, dim)
        self.fc = nn.Linear(dim, dim)
        self.unembed = nn.Linear(dim, vocab)

    def forward(self, input_ids):
        x = self.emb(input_ids)
        x = torch.tanh(self.fc(x))
        return self.unembed(x)


def _make_synthetic_batch(seed=0):
    """A tiny instruction-style batch.

    Convention: first 2 positions are 'prompt' (mask=0), last 4 are
    'response' (mask=1). Targets are a deterministic function of inputs
    so the model can actually learn something.
    """
    torch.manual_seed(seed)
    B = 5
    # Inputs are random tokens; targets are inputs + 1 mod VOCAB (a learnable rule).
    input_ids = torch.randint(0, VOCAB - 1, (B, SEQ_LEN))
    target_ids = (input_ids + 1) % VOCAB
    mask = torch.zeros(B, SEQ_LEN, dtype=torch.long)
    mask[:, 2:] = 1
    return input_ids, target_ids, mask


def test_train_one_step_returns_float(solution):
    torch.manual_seed(0)
    model = TinyLM()
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
    batch = _make_synthetic_batch()
    loss = solution.train_one_step(model, batch, optimizer)
    assert isinstance(loss, float)
    assert loss > 0


def test_train_one_step_updates_parameters(solution):
    torch.manual_seed(0)
    model = TinyLM()
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-2)
    batch = _make_synthetic_batch()
    before = [p.clone() for p in model.parameters()]
    _ = solution.train_one_step(model, batch, optimizer)
    after = list(model.parameters())
    # At least one parameter must have moved.
    moved = any(not torch.equal(b, a) for b, a in zip(before, after))
    assert moved, "Optimizer step did not update any parameters"


def test_loss_drops_over_steps(solution):
    """50 steps on the same batch should drop the loss substantially."""
    torch.manual_seed(0)
    model = TinyLM()
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-2)
    batch = _make_synthetic_batch()
    losses = solution.train_until(model, [batch], optimizer, steps=50)
    assert len(losses) == 50
    assert losses[0] > losses[-1], (
        f"Loss did not drop: start={losses[0]:.4f}, end={losses[-1]:.4f}"
    )
    # Demand a meaningful drop, not just numerical jitter.
    assert losses[-1] < losses[0] * 0.5, (
        f"Loss should at least halve in 50 steps: "
        f"start={losses[0]:.4f}, end={losses[-1]:.4f}"
    )


def test_gradient_only_from_response_positions(solution):
    """If mask is all zeros, no parameter should update."""
    torch.manual_seed(0)
    model = TinyLM()
    optimizer = torch.optim.SGD(model.parameters(), lr=1.0)
    input_ids, target_ids, _ = _make_synthetic_batch()
    zero_mask = torch.zeros_like(input_ids)
    batch = (input_ids, target_ids, zero_mask)

    before = [p.clone() for p in model.parameters()]
    _ = solution.train_one_step(model, batch, optimizer)
    after = list(model.parameters())
    for b, a in zip(before, after):
        assert torch.equal(b, a), "Parameters changed despite zero mask"


def test_train_until_returns_list_of_floats(solution):
    torch.manual_seed(0)
    model = TinyLM()
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
    batch = _make_synthetic_batch()
    losses = solution.train_until(model, [batch], optimizer, steps=5)
    assert isinstance(losses, list)
    assert len(losses) == 5
    assert all(isinstance(l, float) for l in losses)
