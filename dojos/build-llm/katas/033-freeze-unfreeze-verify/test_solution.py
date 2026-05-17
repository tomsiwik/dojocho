"""Tests for Freeze, Unfreeze, Verify."""

import pytest
import torch
import torch.nn as nn


# --- Fixture: tiny GPT-like model with named blocks ------------------------

class TinyBlock(nn.Module):
    def __init__(self, d_model: int):
        super().__init__()
        self.attn = nn.Linear(d_model, d_model)
        self.ff = nn.Linear(d_model, d_model)

    def forward(self, x):
        return self.ff(torch.relu(self.attn(x)))


class TinyGPT(nn.Module):
    def __init__(self, vocab_size=50, d_model=16, n_blocks=3, n_classes=2):
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
        return self.out_head(x[:, -1, :])  # (B, n_classes), last-token


@pytest.fixture
def model():
    torch.manual_seed(0)
    return TinyGPT(n_blocks=3)


# --- Tests ------------------------------------------------------------------

def test_freeze_all_sets_requires_grad_false(solution, model):
    solution.freeze_all(model)
    for p in model.parameters():
        assert p.requires_grad is False


def test_unfreeze_only_named_paths(solution, model):
    solution.freeze_all(model)
    solution.unfreeze(model, ["blocks.2", "out_head"])
    trainable = solution.trainable_param_names(model)
    # Every trainable name must start with one of the unfrozen paths.
    for name in trainable:
        assert name.startswith("blocks.2.") or name.startswith("out_head.")
    # And there must BE trainable params in both.
    assert any(n.startswith("blocks.2.") for n in trainable)
    assert any(n.startswith("out_head.") for n in trainable)


def test_unfreeze_does_not_match_prefix_collision(solution, model):
    """`blocks.1` must not match `blocks.10`/`blocks.11`/etc."""
    big_model = TinyGPT(n_blocks=12)
    solution.freeze_all(big_model)
    solution.unfreeze(big_model, ["blocks.1"])
    trainable = solution.trainable_param_names(big_model)
    # All trainable params must be under blocks.1 exactly (not blocks.10/11/12).
    for name in trainable:
        # The character right after "blocks.1" must be '.', not another digit.
        assert name == "blocks.1" or name.startswith("blocks.1.")
    # Specifically: nothing from blocks.10, blocks.11.
    assert not any("blocks.10" in n for n in trainable)
    assert not any("blocks.11" in n for n in trainable)


def test_is_frozen(solution, model):
    p = next(model.parameters())
    p.requires_grad = False
    assert solution.is_frozen(p) is True
    p.requires_grad = True
    assert solution.is_frozen(p) is False


def test_trainable_param_names_sorted(solution, model):
    """Out-of-the-box, every param is trainable; the list must be sorted."""
    names = solution.trainable_param_names(model)
    assert names == sorted(names)
    assert len(names) > 0


def test_grad_after_backward_only_on_trainable(solution, model):
    """Run a backward pass. Frozen params have .grad is None;
    trainable params have .grad != None."""
    solution.freeze_all(model)
    solution.unfreeze(model, ["blocks.2", "out_head", "final_norm"])

    # Forward + dummy loss + backward.
    idx = torch.randint(0, 50, (2, 4))
    logits = model(idx)
    loss = logits.sum()
    loss.backward()

    trainable = set(solution.trainable_param_names(model))
    with_grad = set(solution.params_with_grad(model))

    # Every trainable param should have a grad.
    assert trainable == with_grad

    # Spot-check: a frozen param has .grad is None.
    frozen_param = dict(model.named_parameters())["tok_emb.weight"]
    assert frozen_param.grad is None

    # Spot-check: an unfrozen param has a grad.
    unfrozen_param = dict(model.named_parameters())["out_head.weight"]
    assert unfrozen_param.grad is not None
    assert unfrozen_param.grad.shape == unfrozen_param.shape


def test_params_with_grad_excludes_no_backward(solution, model):
    """Before any backward, no param has a .grad."""
    solution.freeze_all(model)
    solution.unfreeze(model, ["out_head"])
    # No backward yet.
    assert solution.params_with_grad(model) == []


def test_unfreeze_empty_list_is_noop(solution, model):
    solution.freeze_all(model)
    solution.unfreeze(model, [])
    assert solution.trainable_param_names(model) == []
