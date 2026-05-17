"""Tests for layer-norm."""

import torch
import torch.nn as nn


def test_layer_norm_is_module(solution):
    ln = solution.LayerNorm(emb_dim=8)
    assert isinstance(ln, nn.Module)


def test_layer_norm_has_two_parameters(solution):
    """scale and shift should both be nn.Parameter (so they train)."""
    ln = solution.LayerNorm(emb_dim=8)
    params = list(ln.parameters())
    assert len(params) == 2
    # Each parameter has emb_dim elements.
    assert all(p.numel() == 8 for p in params)


def test_layer_norm_output_shape(solution):
    ln = solution.LayerNorm(emb_dim=16)
    x = torch.randn(4, 7, 16)
    out = ln(x)
    assert out.shape == x.shape


def test_layer_norm_zero_mean_unit_variance(solution):
    """After normalization (with default scale=1, shift=0), each row
    along the last dim has mean ~0 and variance ~1."""
    torch.manual_seed(0)
    ln = solution.LayerNorm(emb_dim=32)
    x = torch.randn(3, 5, 32) * 4.0 + 7.0  # arbitrary mean/variance
    out = ln(x)
    mean = out.mean(dim=-1)
    var = out.var(dim=-1, unbiased=False)
    torch.testing.assert_close(mean, torch.zeros_like(mean), atol=1e-5, rtol=1e-4)
    torch.testing.assert_close(var, torch.ones_like(var), atol=1e-3, rtol=1e-3)


def test_layer_norm_matches_torch_nn(solution):
    """With default init (scale=1, shift=0, eps=1e-5, unbiased=False),
    our LayerNorm matches torch.nn.LayerNorm to high precision."""
    torch.manual_seed(42)
    emb_dim = 16
    ln_ours = solution.LayerNorm(emb_dim=emb_dim)
    ln_torch = nn.LayerNorm(normalized_shape=emb_dim, eps=1e-5)
    x = torch.randn(2, 4, emb_dim)
    torch.testing.assert_close(ln_ours(x), ln_torch(x), atol=1e-5, rtol=1e-4)


def test_layer_norm_scale_shift_trainable(solution):
    """scale and shift must produce gradients on backward."""
    ln = solution.LayerNorm(emb_dim=8)
    x = torch.randn(2, 3, 8, requires_grad=False)
    out = ln(x).sum()
    out.backward()
    for p in ln.parameters():
        assert p.grad is not None
        assert p.grad.shape == p.shape


def test_layer_norm_scale_init_ones(solution):
    """scale starts as 1s, shift as 0s (so initial behavior == pure norm)."""
    ln = solution.LayerNorm(emb_dim=4)
    tensors = list(ln.parameters())
    # One param sums to 0 (shift=zeros), the other to 4 (scale=ones).
    sums = sorted(p.sum().item() for p in tensors)
    assert sums == [0.0, 4.0]
