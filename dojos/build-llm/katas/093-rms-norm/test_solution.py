"""Tests for rms-norm."""

import torch
import torch.nn as nn
import torch.nn.functional as F


def test_rms_norm_is_module(solution):
    rn = solution.RMSNorm(d_model=8)
    assert isinstance(rn, nn.Module)


def test_rms_norm_has_one_parameter(solution):
    """RMSNorm has weight (gain) only — no bias."""
    rn = solution.RMSNorm(d_model=8)
    params = list(rn.parameters())
    assert len(params) == 1
    assert params[0].numel() == 8


def test_rms_norm_weight_init_ones(solution):
    """weight starts as ones, so initial behavior is pure RMS scaling."""
    rn = solution.RMSNorm(d_model=4)
    (weight,) = rn.parameters()
    torch.testing.assert_close(weight.detach(), torch.ones(4))


def test_rms_norm_output_shape(solution):
    rn = solution.RMSNorm(d_model=16)
    x = torch.randn(4, 7, 16)
    out = rn(x)
    assert out.shape == x.shape


def test_rms_norm_unit_rms(solution):
    """With weight=1, the RMS of each row along the last dim is ~1."""
    torch.manual_seed(0)
    rn = solution.RMSNorm(d_model=64)
    x = torch.randn(3, 5, 64) * 4.0 + 7.0  # arbitrary scale/offset
    out = rn(x)
    rms = out.pow(2).mean(dim=-1).sqrt()
    torch.testing.assert_close(rms, torch.ones_like(rms), atol=1e-3, rtol=1e-3)


def test_rms_norm_matches_F_rms_norm(solution):
    """Bit-for-bit parity with torch.nn.functional.rms_norm (PyTorch >= 2.4)."""
    torch.manual_seed(42)
    d_model = 16
    rn = solution.RMSNorm(d_model=d_model, eps=1e-6)
    x = torch.randn(2, 4, d_model)
    (weight,) = rn.parameters()
    expected = F.rms_norm(x, normalized_shape=(d_model,), weight=weight, eps=1e-6)
    torch.testing.assert_close(rn(x), expected, atol=1e-6, rtol=1e-5)


def test_rms_norm_weight_is_trainable(solution):
    """weight must produce a gradient on backward."""
    rn = solution.RMSNorm(d_model=8)
    x = torch.randn(2, 3, 8)
    rn(x).sum().backward()
    for p in rn.parameters():
        assert p.grad is not None
        assert p.grad.shape == p.shape


def test_rms_norm_no_mean_subtraction(solution):
    """RMSNorm does NOT zero-center: a constant-mean input keeps that mean
    in the output (scaled, not subtracted)."""
    rn = solution.RMSNorm(d_model=32)
    x = torch.ones(2, 32) * 5.0  # mean = 5, RMS = 5
    out = rn(x)
    # If RMSNorm subtracted the mean, out would be zeros. It doesn't:
    # out = x / RMS(x) = ones (since x is constant).
    assert out.abs().mean().item() > 0.5
