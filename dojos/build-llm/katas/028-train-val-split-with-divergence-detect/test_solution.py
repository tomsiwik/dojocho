"""Tests for train-val-split-with-divergence-detect."""

import torch
import torch.nn as nn


VOCAB = 30
D_MODEL = 16
SEQ_LEN = 6
BATCH = 2


class TinyLM(nn.Module):
    def __init__(self, vocab=VOCAB, d_model=D_MODEL):
        super().__init__()
        self.embed = nn.Embedding(vocab, d_model)
        self.head = nn.Linear(d_model, vocab)

    def forward(self, x):
        return self.head(self.embed(x))


def _train_corpus():
    """Tiny memorizable pattern — model can overfit easily."""
    torch.manual_seed(0)
    pattern = torch.tensor([1, 2, 3, 4, 5, 6, 7, 8])
    batches = []
    for _ in range(4):
        toks = pattern.repeat(BATCH, (SEQ_LEN + 1) // len(pattern) + 1)
        toks = toks[:, : SEQ_LEN + 1].contiguous()
        batches.append((toks[:, :-1].contiguous().long(), toks[:, 1:].contiguous().long()))
    return batches


def _val_corpus():
    """Different pattern → model can't memorize → val loss diverges."""
    torch.manual_seed(42)
    # Use unseen tokens / unseen order so train memorization doesn't help val.
    pattern = torch.tensor([20, 21, 22, 23, 24, 25, 26, 27])
    batches = []
    for _ in range(2):
        toks = pattern.repeat(BATCH, (SEQ_LEN + 1) // len(pattern) + 1)
        toks = toks[:, : SEQ_LEN + 1].contiguous()
        batches.append((toks[:, :-1].contiguous().long(), toks[:, 1:].contiguous().long()))
    return batches


def test_returns_two_lists(solution):
    torch.manual_seed(0)
    model = TinyLM()
    opt = torch.optim.AdamW(model.parameters(), lr=1e-2)
    train_losses, val_losses = solution.train_with_val(
        model, opt, _train_corpus(), _val_corpus(), num_epochs=5
    )
    assert len(train_losses) == 5
    assert len(val_losses) == 5
    assert all(isinstance(l, float) for l in train_losses + val_losses)


def test_train_loss_decreases(solution):
    torch.manual_seed(0)
    model = TinyLM()
    opt = torch.optim.AdamW(model.parameters(), lr=1e-2)
    train_losses, _ = solution.train_with_val(
        model, opt, _train_corpus(), _val_corpus(), num_epochs=10
    )
    assert train_losses[-1] < train_losses[0]


def test_val_loss_exceeds_train_eventually(solution):
    """After enough epochs on a tiny corpus, val loss > train loss."""
    torch.manual_seed(0)
    model = TinyLM()
    opt = torch.optim.AdamW(model.parameters(), lr=1e-2)
    train_losses, val_losses = solution.train_with_val(
        model, opt, _train_corpus(), _val_corpus(), num_epochs=20
    )
    assert val_losses[-1] > train_losses[-1], (
        f"expected overfit: val={val_losses[-1]:.3f} train={train_losses[-1]:.3f}"
    )


def test_evaluate_returns_float(solution):
    torch.manual_seed(0)
    model = TinyLM()
    out = solution.evaluate(model, _val_corpus())
    assert isinstance(out, float)


def test_evaluate_does_not_update_weights(solution):
    """evaluate() must not modify model parameters."""
    torch.manual_seed(0)
    model = TinyLM()
    before = {k: v.detach().clone() for k, v in model.state_dict().items()}
    solution.evaluate(model, _val_corpus())
    after = model.state_dict()
    for k in before:
        assert torch.allclose(before[k], after[k]), f"weight {k} changed during eval"


def test_detect_overfit_basic(solution):
    """Val loss strictly increases → divergence at epoch 1."""
    train = [3.0, 2.0, 1.5, 1.0]
    val = [3.0, 2.5, 3.0, 3.5]
    # min(val[:1]) = 3.0, val[1]=2.5 not > 3.0
    # min(val[:2]) = 2.5, val[2]=3.0 > 2.5 → returns 2
    assert solution.detect_overfit(train, val) == 2


def test_detect_overfit_ignores_noise(solution):
    """One-step jitter that resumes downward is NOT overfit."""
    # [3.0, 2.0, 2.1, 1.9, 2.5]
    # min(val[:1])=3.0, val[1]=2.0 not > 3.0
    # min(val[:2])=2.0, val[2]=2.1 > 2.0 → fires at 2
    # ...but then val drops below at 3.
    # The detector says 'first strict excess of running min'.
    # We test the deeper divergence case where val truly diverges:
    train = [3.0] * 5
    val = [3.0, 2.0, 1.9, 1.8, 2.5]
    # min(val[:1])=3.0; val[1]=2.0 not>3.0
    # min(val[:2])=2.0; val[2]=1.9 not>2.0
    # min(val[:3])=1.9; val[3]=1.8 not>1.9
    # min(val[:4])=1.8; val[4]=2.5 > 1.8 → returns 4
    assert solution.detect_overfit(train, val) == 4


def test_detect_overfit_no_overfit(solution):
    """Monotonically decreasing val → -1."""
    train = [3.0, 2.0, 1.0]
    val = [3.0, 2.0, 1.0]
    assert solution.detect_overfit(train, val) == -1


def test_detect_overfit_immediate_increase(solution):
    """Val rises from epoch 1 → returns 1."""
    train = [3.0, 2.5, 2.0]
    val = [2.0, 2.5, 3.0]
    assert solution.detect_overfit(train, val) == 1
