"""Tests for Gradual Unfreezing."""

import pytest
import torch
import torch.nn as nn


# --- Fixture: tiny GPT-like model with named top-level modules -------------

class TinyBlock(nn.Module):
    def __init__(self, d_model: int):
        super().__init__()
        self.attn = nn.Linear(d_model, d_model)
        self.ff = nn.Linear(d_model, d_model)

    def forward(self, x):
        return self.ff(torch.relu(self.attn(x)))


class TinyGPT(nn.Module):
    def __init__(self, vocab_size=20, d_model=8, n_blocks=4, n_classes=2):
        super().__init__()
        self.tok_emb = nn.Embedding(vocab_size, d_model)
        self.blocks = nn.ModuleList([TinyBlock(d_model) for _ in range(n_blocks)])
        self.final_norm = nn.LayerNorm(d_model)
        self.out_head = nn.Linear(d_model, n_classes)

    def forward(self, idx):
        x = self.tok_emb(idx)
        for blk in self.blocks:
            x = blk(x)
        x = self.final_norm(x)
        return self.out_head(x[:, -1, :])


@pytest.fixture
def model():
    torch.manual_seed(0)
    return TinyGPT(n_blocks=4)


# --- Tests ------------------------------------------------------------------

def test_count_blocks(solution, model):
    assert solution.count_blocks(model) == 4


def test_epoch_0_only_head_and_norm(solution, model):
    solution.unfreeze_for_epoch(model, epoch=0, head_only_epochs=2)
    trainable = {
        n.split(".")[0] for n, p in model.named_parameters() if p.requires_grad
    }
    assert trainable == {"out_head", "final_norm"}


def test_epoch_1_still_head_only(solution, model):
    """head_only_epochs=2 means epoch 0 and epoch 1 are head-only."""
    solution.unfreeze_for_epoch(model, epoch=1, head_only_epochs=2)
    trainable = {
        n.split(".")[0] for n, p in model.named_parameters() if p.requires_grad
    }
    assert trainable == {"out_head", "final_norm"}


def test_epoch_2_unfreezes_last_block(solution, model):
    """Epoch 2 (first non-head-only) unfreezes 1 block: the last one."""
    solution.unfreeze_for_epoch(model, epoch=2, head_only_epochs=2)
    trainable_top = set()
    for name, p in model.named_parameters():
        if p.requires_grad:
            parts = name.split(".")
            top = ".".join(parts[:2]) if parts[0] == "blocks" else parts[0]
            trainable_top.add(top)
    assert trainable_top == {"out_head", "final_norm", "blocks.3"}


def test_epoch_3_unfreezes_last_two_blocks(solution, model):
    solution.unfreeze_for_epoch(model, epoch=3, head_only_epochs=2)
    trainable_top = set()
    for name, p in model.named_parameters():
        if p.requires_grad:
            parts = name.split(".")
            top = ".".join(parts[:2]) if parts[0] == "blocks" else parts[0]
            trainable_top.add(top)
    assert trainable_top == {"out_head", "final_norm", "blocks.2", "blocks.3"}


def test_far_future_epoch_clamps_to_all_blocks(solution, model):
    """Epoch 100 should not blow up; unfreezes all blocks (but not tok_emb)."""
    solution.unfreeze_for_epoch(model, epoch=100, head_only_epochs=2)
    trainable_top = set()
    for name, p in model.named_parameters():
        if p.requires_grad:
            parts = name.split(".")
            top = ".".join(parts[:2]) if parts[0] == "blocks" else parts[0]
            trainable_top.add(top)
    expected = {"out_head", "final_norm"} | {f"blocks.{i}" for i in range(4)}
    assert trainable_top == expected
    # tok_emb is still frozen.
    assert not model.tok_emb.weight.requires_grad


def test_tok_emb_always_frozen(solution, model):
    for ep in [0, 1, 2, 5, 100]:
        solution.unfreeze_for_epoch(model, epoch=ep, head_only_epochs=2)
        assert not model.tok_emb.weight.requires_grad, f"tok_emb unfrozen at epoch {ep}"


def test_idempotent(solution, model):
    """Calling twice with the same epoch is a no-op vs once."""
    solution.unfreeze_for_epoch(model, epoch=3, head_only_epochs=2)
    state1 = [p.requires_grad for p in model.parameters()]
    solution.unfreeze_for_epoch(model, epoch=3, head_only_epochs=2)
    state2 = [p.requires_grad for p in model.parameters()]
    assert state1 == state2


def test_schedule_goes_backward_correctly(solution, model):
    """If we go from epoch 5 (all unfrozen) back to epoch 0 (head only),
    the previously unfrozen blocks must refreeze."""
    solution.unfreeze_for_epoch(model, epoch=5, head_only_epochs=2)
    solution.unfreeze_for_epoch(model, epoch=0, head_only_epochs=2)
    trainable = {
        n.split(".")[0] for n, p in model.named_parameters() if p.requires_grad
    }
    assert trainable == {"out_head", "final_norm"}


def test_schedule_summary_shape(solution, model):
    summary = solution.schedule_summary(model, n_blocks=4, n_epochs=6, head_only_epochs=2)
    assert isinstance(summary, list)
    assert len(summary) == 6
    assert all(isinstance(s, set) for s in summary)


def test_schedule_summary_monotonic_growth(solution, model):
    """Each epoch's trainable set should be a superset of the previous."""
    summary = solution.schedule_summary(model, n_blocks=4, n_epochs=6, head_only_epochs=2)
    for i in range(1, len(summary)):
        assert summary[i - 1].issubset(summary[i]), (
            f"Epoch {i} dropped trainables vs epoch {i-1}: "
            f"prev={summary[i-1]}, curr={summary[i]}"
        )


def test_schedule_summary_first_and_last(solution, model):
    summary = solution.schedule_summary(model, n_blocks=4, n_epochs=6, head_only_epochs=2)
    assert summary[0] == {"out_head", "final_norm"}
    assert summary[5] == {"out_head", "final_norm"} | {f"blocks.{i}" for i in range(4)}


def test_head_only_epochs_zero(solution, model):
    """With head_only_epochs=0, epoch 0 already unfreezes the last block."""
    solution.unfreeze_for_epoch(model, epoch=0, head_only_epochs=0)
    trainable_top = set()
    for name, p in model.named_parameters():
        if p.requires_grad:
            parts = name.split(".")
            top = ".".join(parts[:2]) if parts[0] == "blocks" else parts[0]
            trainable_top.add(top)
    assert trainable_top == {"out_head", "final_norm", "blocks.3"}
