"""Tests for Classification Head Swap."""

import pytest
import torch
import torch.nn as nn


# --- Fixture: tiny GPT-like model -------------------------------------------

class TinyBlock(nn.Module):
    def __init__(self, d_model: int):
        super().__init__()
        self.attn = nn.Linear(d_model, d_model)
        self.ff = nn.Linear(d_model, d_model)

    def forward(self, x):
        return self.ff(torch.relu(self.attn(x)))


class TinyGPT(nn.Module):
    """Tiny GPT-shaped model: token embed + 2 blocks + final norm + out_head.

    Mirrors Raschka's `GPTModel` enough for this kata: the head is named
    `out_head` and projects `d_model -> vocab_size`.
    """

    def __init__(self, vocab_size: int = 50, d_model: int = 16):
        super().__init__()
        self.tok_emb = nn.Embedding(vocab_size, d_model)
        self.blocks = nn.ModuleList([TinyBlock(d_model) for _ in range(2)])
        self.final_norm = nn.LayerNorm(d_model)
        self.out_head = nn.Linear(d_model, vocab_size, bias=False)

    def forward(self, idx):  # (B, T) -> (B, T, vocab)
        x = self.tok_emb(idx)
        for blk in self.blocks:
            x = blk(x)
        x = self.final_norm(x)
        return self.out_head(x)


@pytest.fixture
def pretrained_model():
    torch.manual_seed(0)
    return TinyGPT(vocab_size=50, d_model=16)


# --- Tests ------------------------------------------------------------------

def test_swap_head_changes_out_features(solution, pretrained_model):
    solution.swap_head(pretrained_model, n_classes=2)
    assert isinstance(pretrained_model.out_head, nn.Linear)
    assert pretrained_model.out_head.out_features == 2


def test_swap_head_keeps_in_features(solution, pretrained_model):
    """d_model (in_features) is preserved from the original head."""
    original_d = pretrained_model.out_head.in_features
    solution.swap_head(pretrained_model, n_classes=3)
    assert pretrained_model.out_head.in_features == original_d


def test_swap_head_n_classes_arbitrary(solution, pretrained_model):
    """Works for n_classes != 2 (e.g., 3-way topic classification)."""
    solution.swap_head(pretrained_model, n_classes=7)
    assert pretrained_model.out_head.out_features == 7


def test_new_head_is_trainable(solution, pretrained_model):
    solution.swap_head(pretrained_model, n_classes=2)
    for p in pretrained_model.out_head.parameters():
        assert p.requires_grad is True


def test_new_head_weights_are_fresh(solution, pretrained_model):
    """The new head is a freshly initialized Linear, not the old one."""
    old_head_weight = pretrained_model.out_head.weight.detach().clone()
    solution.swap_head(pretrained_model, n_classes=2)
    new_head_weight = pretrained_model.out_head.weight
    # Different shape, certainly different values.
    assert new_head_weight.shape != old_head_weight.shape


def test_body_state_dict_excludes_head(solution, pretrained_model):
    snap = solution.body_state_dict(pretrained_model)
    assert all(not name.startswith("out_head") for name in snap)
    # And it must include SOMETHING (tok_emb, blocks, final_norm).
    assert len(snap) > 0
    assert any("tok_emb" in name for name in snap)


def test_body_state_dict_is_cloned(solution, pretrained_model):
    """Snapshot must not be a live view — mutating the model should
    not change the snapshot tensors."""
    snap = solution.body_state_dict(pretrained_model)
    # Mutate model in-place.
    with torch.no_grad():
        pretrained_model.tok_emb.weight.add_(1.0)
    # Snapshot should still hold the OLD values; current is OLD + 1.
    snapped = snap["tok_emb.weight"]
    current = dict(pretrained_model.named_parameters())["tok_emb.weight"]
    assert not torch.equal(snapped, current)


def test_verify_body_unchanged_after_swap(solution, pretrained_model):
    """The whole point: swap the head, body is byte-identical."""
    snap = solution.body_state_dict(pretrained_model)
    solution.swap_head(pretrained_model, n_classes=2)
    assert solution.verify_body_unchanged(pretrained_model, snap) is True


def test_verify_body_detects_mutation(solution, pretrained_model):
    """If the body changes, verify must return False."""
    snap = solution.body_state_dict(pretrained_model)
    solution.swap_head(pretrained_model, n_classes=2)
    # Now mutate a body param.
    with torch.no_grad():
        pretrained_model.tok_emb.weight.add_(0.5)
    assert solution.verify_body_unchanged(pretrained_model, snap) is False


def test_forward_shape_after_swap(solution, pretrained_model):
    """After swap, forward returns (B, T, n_classes)."""
    solution.swap_head(pretrained_model, n_classes=2)
    idx = torch.randint(0, 50, (3, 5))
    out = pretrained_model(idx)
    assert out.shape == (3, 5, 2)
