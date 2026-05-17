"""Tests for transformer-block."""

import torch
import torch.nn as nn


TINY_CFG = {
    "emb_dim": 64,
    "n_heads": 4,
    "context_length": 32,
    "drop_rate": 0.0,  # determinism in tests
}


def test_block_is_module(solution):
    block = solution.TransformerBlock(TINY_CFG)
    assert isinstance(block, nn.Module)


def test_block_preserves_shape(solution):
    block = solution.TransformerBlock(TINY_CFG)
    x = torch.randn(2, 8, TINY_CFG["emb_dim"])
    out = block(x)
    assert out.shape == x.shape


def test_block_has_two_layernorms(solution):
    """Two separate LayerNorm modules (norm1, norm2), not one shared."""
    block = solution.TransformerBlock(TINY_CFG)
    lns = [m for m in block.modules() if isinstance(m, nn.LayerNorm)]
    # The provided FeedForward and CausalMHA do not use LayerNorm internally.
    # If the student uses a custom LayerNorm class, this test won't see it;
    # the next test covers that case.
    if len(lns) != 2:
        # Fallback: count distinct submodules whose class name contains LayerNorm.
        ln_like = [
            m for m in block.modules()
            if "LayerNorm" in type(m).__name__ or "layernorm" in type(m).__name__.lower()
        ]
        assert len(ln_like) == 2, (
            f"Expected exactly 2 LayerNorm modules; found {len(ln_like)}"
        )
    else:
        assert len(lns) == 2


def test_block_residual_is_identity_when_layers_zero(solution):
    """If we zero out the att out_proj and the FFN second linear, the
    block should reduce to identity (because both sub-blocks contribute
    zero to the residual)."""
    torch.manual_seed(0)
    block = solution.TransformerBlock(TINY_CFG)
    block.eval()

    # Zero the final projection of attention and FFN so each sub-block
    # contributes exactly zero on top of the residual.
    with torch.no_grad():
        # Attention output projection.
        for name, p in block.named_parameters():
            if name.endswith("att.out_proj.weight") or name.endswith("att.out_proj.bias"):
                p.zero_()
        # FFN second linear (the one mapping 4d → d).
        for m in block.modules():
            if isinstance(m, nn.Linear) and m.in_features == 4 * TINY_CFG["emb_dim"]:
                m.weight.zero_()
                if m.bias is not None:
                    m.bias.zero_()

    x = torch.randn(2, 6, TINY_CFG["emb_dim"])
    out = block(x)
    torch.testing.assert_close(out, x, atol=1e-5, rtol=1e-4)


def test_block_uses_causal_mask(solution):
    """Changing a future token should NOT change earlier outputs."""
    torch.manual_seed(0)
    block = solution.TransformerBlock(TINY_CFG)
    block.eval()
    x1 = torch.randn(1, 8, TINY_CFG["emb_dim"])
    x2 = x1.clone()
    x2[:, -1, :] = torch.randn(TINY_CFG["emb_dim"])  # perturb last position only
    out1 = block(x1)
    out2 = block(x2)
    # All positions except the last should be identical.
    torch.testing.assert_close(out1[:, :-1, :], out2[:, :-1, :], atol=1e-5, rtol=1e-4)


def test_block_gradients_flow(solution):
    block = solution.TransformerBlock(TINY_CFG)
    x = torch.randn(2, 4, TINY_CFG["emb_dim"])
    block(x).sum().backward()
    # At least the att and ff submodules should have gradients on every weight.
    grad_count = sum(1 for p in block.parameters() if p.grad is not None)
    assert grad_count == len(list(block.parameters()))
