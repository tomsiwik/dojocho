"""Tests for Classification Train Step."""

import pytest
import torch
import torch.nn as nn


# --- Fixture: tiny classifier ----------------------------------------------

class TinyClassifier(nn.Module):
    """Minimal LM-shaped classifier: embeddings + 1 linear "block"
    + last-token-friendly out_head. Forward returns (B, T, n_classes)
    so the student must do [:, -1, :] explicitly."""

    def __init__(self, vocab_size=20, d_model=8, n_classes=2):
        super().__init__()
        self.tok_emb = nn.Embedding(vocab_size, d_model)
        self.block = nn.Linear(d_model, d_model)
        self.out_head = nn.Linear(d_model, n_classes)

    def forward(self, idx):  # (B, T) -> (B, T, n_classes)
        x = self.tok_emb(idx)
        x = torch.relu(self.block(x))
        return self.out_head(x)


def make_synthetic_batch(seed=0):
    """A tiny deterministic batch: 8 examples, T=5, vocab=20, 2 classes."""
    g = torch.Generator().manual_seed(seed)
    x = torch.randint(0, 20, (8, 5), generator=g)
    y = torch.randint(0, 2, (8,), generator=g).long()
    return x, y


@pytest.fixture
def setup():
    torch.manual_seed(0)
    model = TinyClassifier()
    optimizer = torch.optim.SGD(model.parameters(), lr=0.1)
    x, y = make_synthetic_batch()
    return model, optimizer, x, y


# --- Tests ------------------------------------------------------------------

def test_last_token_logits_shape(solution, setup):
    model, _, x, _ = setup
    logits = solution.last_token_logits(model, x)
    assert logits.shape == (8, 2)


def test_last_token_logits_is_last_timestep(solution, setup):
    """Equal to model(x)[:, -1, :]."""
    model, _, x, _ = setup
    expected = model(x)[:, -1, :]
    actual = solution.last_token_logits(model, x)
    assert torch.allclose(actual, expected)


def test_compute_loss_is_scalar(solution):
    logits = torch.tensor([[2.0, 1.0], [0.5, 1.5], [3.0, -1.0]])
    y = torch.tensor([0, 1, 0])
    loss = solution.compute_loss(logits, y)
    assert loss.dim() == 0  # scalar
    assert loss.item() > 0


def test_compute_loss_matches_cross_entropy(solution):
    """Should equal F.cross_entropy exactly."""
    logits = torch.randn(5, 3)
    y = torch.tensor([0, 2, 1, 1, 0])
    expected = torch.nn.functional.cross_entropy(logits, y)
    actual = solution.compute_loss(logits, y)
    assert torch.allclose(actual, expected)


def test_train_step_returns_float(solution, setup):
    model, optimizer, x, y = setup
    loss = solution.train_step(model, optimizer, x, y)
    assert isinstance(loss, float)
    assert loss > 0


def test_train_step_updates_params(solution, setup):
    """At least one trainable param should change after a step."""
    model, optimizer, x, y = setup
    before = {n: p.detach().clone() for n, p in model.named_parameters()}
    solution.train_step(model, optimizer, x, y)
    after = dict(model.named_parameters())
    changed = [n for n in before if not torch.equal(before[n], after[n])]
    assert len(changed) > 0, "No parameters changed after train_step"


def test_train_step_zeroes_grads(solution, setup):
    """If the student forgot zero_grad, grads accumulate across calls
    and the second-step loss will be wildly off. We can detect this
    indirectly: after two steps with the SAME (x, y), the loss should
    keep monotonically decreasing (it does NOT explode)."""
    model, optimizer, x, y = setup
    l1 = solution.train_step(model, optimizer, x, y)
    l2 = solution.train_step(model, optimizer, x, y)
    l3 = solution.train_step(model, optimizer, x, y)
    # Loose monotonic — at lr=0.1 on a tiny batch, this is robust.
    assert l2 < l1 + 0.01
    assert l3 < l2 + 0.01


def test_loss_decreases_true(solution, setup):
    model, optimizer, x, y = setup
    assert solution.loss_decreases(model, optimizer, x, y, n_steps=5) is True


def test_train_step_with_frozen_body(solution):
    """Even with everything except the head frozen, loss should still
    drop — that's the whole point of fine-tuning a head."""
    torch.manual_seed(1)
    model = TinyClassifier()
    # Freeze all except the head.
    for p in model.parameters():
        p.requires_grad = False
    for p in model.out_head.parameters():
        p.requires_grad = True

    # Only pass trainable params to the optimizer.
    optimizer = torch.optim.SGD(
        [p for p in model.parameters() if p.requires_grad], lr=0.5
    )
    x, y = make_synthetic_batch(seed=2)
    assert solution.loss_decreases(model, optimizer, x, y, n_steps=5) is True
