"""Tests for combined-distillation-loss."""

import torch
import torch.nn.functional as F


def _ref_kl(student, teacher, T):
    s = F.log_softmax(student / T, dim=-1)
    t = F.log_softmax(teacher / T, dim=-1)
    return F.kl_div(s, t, reduction="batchmean", log_target=True) * (T**2)


def test_returns_scalar(solution):
    torch.manual_seed(0)
    s = torch.randn(8, 10)
    t = torch.randn(8, 10)
    y = torch.randint(0, 10, (8,))
    out = solution.distill_loss(s, t, y, alpha=0.5, T=2.0)
    assert isinstance(out, torch.Tensor)
    assert out.dim() == 0
    assert torch.isfinite(out)


def test_alpha_1_is_pure_ce(solution):
    """alpha=1 → just F.cross_entropy on the raw student logits."""
    torch.manual_seed(1)
    s = torch.randn(8, 10)
    t = torch.randn(8, 10)
    y = torch.randint(0, 10, (8,))
    got = solution.distill_loss(s, t, y, alpha=1.0, T=2.0)
    want = F.cross_entropy(s, y)
    assert torch.allclose(got, want, atol=1e-6), (got.item(), want.item())


def test_alpha_0_is_pure_kl(solution):
    """alpha=0 → just T**2 * KL(teacher || student)."""
    torch.manual_seed(2)
    s = torch.randn(8, 10)
    t = torch.randn(8, 10)
    y = torch.randint(0, 10, (8,))
    got = solution.distill_loss(s, t, y, alpha=0.0, T=2.0)
    want = _ref_kl(s, t, T=2.0)
    assert torch.allclose(got, want, atol=1e-5), (got.item(), want.item())


def test_combined_matches_formula(solution):
    """alpha=0.3 → 0.3*CE + 0.7*T**2*KL."""
    torch.manual_seed(3)
    s = torch.randn(8, 10)
    t = torch.randn(8, 10)
    y = torch.randint(0, 10, (8,))
    got = solution.distill_loss(s, t, y, alpha=0.3, T=2.0)
    want = 0.3 * F.cross_entropy(s, y) + 0.7 * _ref_kl(s, t, T=2.0)
    assert torch.allclose(got, want, atol=1e-5), (got.item(), want.item())


def test_hard_term_uses_raw_logits(solution):
    """The hard CE must use the raw logits, NOT the temperature-softened
    ones. We verify that changing T leaves the alpha=1 result invariant."""
    torch.manual_seed(4)
    s = torch.randn(8, 10)
    t = torch.randn(8, 10)
    y = torch.randint(0, 10, (8,))
    a = solution.distill_loss(s, t, y, alpha=1.0, T=1.0)
    b = solution.distill_loss(s, t, y, alpha=1.0, T=8.0)
    assert torch.allclose(a, b, atol=1e-6), (a.item(), b.item())


def test_gradient_flows(solution):
    torch.manual_seed(5)
    s = torch.randn(8, 10, requires_grad=True)
    t = torch.randn(8, 10)
    y = torch.randint(0, 10, (8,))
    loss = solution.distill_loss(s, t, y, alpha=0.5, T=2.0)
    loss.backward()
    assert s.grad is not None
    assert torch.isfinite(s.grad).all()
    # gradient should be non-trivial
    assert s.grad.norm().item() > 0
