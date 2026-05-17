"""Tests for kl-distillation-loss."""

import torch
import torch.nn.functional as F


def _direct_kl(student_logits, teacher_logits, T):
    """Reference: direct manual KL(teacher_soft || student_soft) * T**2,
    averaged over batch."""
    t_log = F.log_softmax(teacher_logits / T, dim=-1)
    s_log = F.log_softmax(student_logits / T, dim=-1)
    t = t_log.exp()
    # KL(teacher || student) = sum_i t_i * (log t_i - log s_i)
    kl_per_row = (t * (t_log - s_log)).sum(dim=-1)  # (B,) or (B, Tseq)
    return (T**2) * kl_per_row.mean()


def test_returns_scalar(solution):
    torch.manual_seed(0)
    s = torch.randn(4, 10)
    t = torch.randn(4, 10)
    out = solution.kl_loss(s, t, T=2.0)
    assert isinstance(out, torch.Tensor)
    assert out.dim() == 0
    assert torch.isfinite(out)


def test_nonnegative(solution):
    """KL divergence is non-negative."""
    torch.manual_seed(1)
    s = torch.randn(4, 10)
    t = torch.randn(4, 10)
    assert solution.kl_loss(s, t, T=2.0).item() >= -1e-6


def test_zero_when_equal(solution):
    """If student == teacher, KL is 0."""
    torch.manual_seed(2)
    t = torch.randn(4, 10)
    s = t.clone()
    out = solution.kl_loss(s, t, T=2.0)
    assert abs(out.item()) < 1e-5


def test_matches_direct_at_T1(solution):
    """At T=1, the loss must match a hand-computed KL(teacher || student)."""
    torch.manual_seed(3)
    s = torch.randn(4, 10)
    t = torch.randn(4, 10)
    got = solution.kl_loss(s, t, T=1.0)
    want = _direct_kl(s, t, T=1.0)
    assert torch.allclose(got, want, atol=1e-5), (got.item(), want.item())


def test_matches_direct_at_T_high(solution):
    """At T=4, the loss must still match the reference (including T**2)."""
    torch.manual_seed(4)
    s = torch.randn(4, 10) * 3.0  # confident teacher
    t = torch.randn(4, 10) * 3.0
    got = solution.kl_loss(s, t, T=4.0)
    want = _direct_kl(s, t, T=4.0)
    assert torch.allclose(got, want, atol=1e-5), (got.item(), want.item())


def test_T_squared_preserves_gradient_magnitude(solution):
    """The T**2 prefactor is there so the gradient magnitude w.r.t.
    student_logits does not collapse as T grows.

    Without T**2, gradients scale as 1/T**2; with it, they stay O(1).
    We check that ||grad|| at T=2 is within a small factor of T=1.
    Without the T**2 prefactor, it would be ~4x smaller.
    """
    torch.manual_seed(5)
    s_logits = torch.randn(8, 20)
    t_logits = torch.randn(8, 20)

    s1 = s_logits.clone().requires_grad_(True)
    loss1 = solution.kl_loss(s1, t_logits, T=1.0)
    loss1.backward()
    g1 = s1.grad.norm().item()

    s2 = s_logits.clone().requires_grad_(True)
    loss2 = solution.kl_loss(s2, t_logits, T=2.0)
    loss2.backward()
    g2 = s2.grad.norm().item()

    # Without T**2: g2 ~ g1 / 4. With T**2: g2 ~ same order as g1.
    # Allow generous bounds: 0.25x to 4x.
    assert 0.25 < g2 / g1 < 4.0, (
        f"gradient ratio g(T=2)/g(T=1) = {g2 / g1:.3f}; "
        "did you forget the T**2 prefactor?"
    )


def test_works_on_3d_input(solution):
    """Sequence inputs (B, T, V) should also work, averaging over B*T."""
    torch.manual_seed(6)
    s = torch.randn(4, 5, 10)
    t = torch.randn(4, 5, 10)
    out = solution.kl_loss(s, t, T=2.0)
    assert out.dim() == 0
    # Compare against flattened computation
    want = _direct_kl(s.view(-1, 10), t.view(-1, 10), T=2.0)
    assert torch.allclose(out, want, atol=1e-5), (out.item(), want.item())


def test_gradient_flows_to_student_only(solution):
    """Loss must be differentiable w.r.t. student logits."""
    torch.manual_seed(7)
    s = torch.randn(4, 10, requires_grad=True)
    t = torch.randn(4, 10)
    loss = solution.kl_loss(s, t, T=2.0)
    loss.backward()
    assert s.grad is not None
    assert s.grad.shape == s.shape
    assert torch.isfinite(s.grad).all()
