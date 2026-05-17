"""Tests for kl-divergence-categorical."""

import math

import torch


def test_kl_self_is_zero(solution):
    """KL(p || p) == 0 for any distribution."""
    torch.manual_seed(0)
    logits = torch.randn(8)
    kl = solution.kl_div(logits, logits)
    assert torch.allclose(kl, torch.tensor(0.0), atol=1e-6), kl.item()


def test_kl_is_nonnegative(solution):
    """KL >= 0 for any pair (Gibbs' inequality)."""
    torch.manual_seed(1)
    for _ in range(5):
        p = torch.randn(10)
        q = torch.randn(10)
        kl = solution.kl_div(p, q)
        assert kl.item() >= -1e-6, kl.item()


def test_kl_known_value_two_point(solution):
    """KL of Bernoulli(0.5) || Bernoulli(0.5+eps) — verify by hand.

    p = [0.5, 0.5], q = [0.25, 0.75]
    KL = 0.5 * log(0.5/0.25) + 0.5 * log(0.5/0.75)
       = 0.5 * log(2) + 0.5 * log(2/3)
    """
    # logits such that softmax gives [0.5, 0.5] and [0.25, 0.75]
    logits_p = torch.tensor([0.0, 0.0])
    logits_q = torch.tensor([0.0, math.log(3.0)])  # softmax -> [0.25, 0.75]
    expected = 0.5 * math.log(2.0) + 0.5 * math.log(2.0 / 3.0)
    kl = solution.kl_div(logits_p, logits_q)
    assert abs(kl.item() - expected) < 1e-5, f"{kl.item()} vs {expected}"


def test_kl_is_asymmetric(solution):
    """KL(p || q) != KL(q || p) in general."""
    logits_p = torch.tensor([0.0, 0.0, 0.0])  # uniform
    logits_q = torch.tensor([2.0, 0.0, -2.0])  # skewed
    forward = solution.kl_div(logits_p, logits_q)
    backward = solution.kl_div(logits_q, logits_p)
    assert abs(forward.item() - backward.item()) > 1e-3


def test_kl_batched(solution):
    """Leading dims average; last dim sums over the support."""
    torch.manual_seed(2)
    B, V = 4, 7
    p = torch.randn(B, V)
    q = torch.randn(B, V)
    kl = solution.kl_div(p, q)
    # Scalar after the mean.
    assert kl.dim() == 0
    # Compare to manual loop.
    manual = torch.stack([solution.kl_div(p[i], q[i]) for i in range(B)]).mean()
    assert torch.allclose(kl, manual, atol=1e-5)


def test_kl_returns_tensor(solution):
    out = solution.kl_div(torch.randn(5), torch.randn(5))
    assert isinstance(out, torch.Tensor)
