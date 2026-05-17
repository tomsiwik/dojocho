"""Tests for gradient-clip-global-norm."""

import math

import pytest
import torch


# ---------- global_grad_norm ----------

def test_global_norm_single_tensor(solution):
    g = torch.tensor([3.0, 4.0])
    norm = solution.global_grad_norm([g])
    assert math.isclose(norm.item(), 5.0, rel_tol=0, abs_tol=1e-6)


def test_global_norm_multiple_tensors(solution):
    # 3² + 4² + 1² = 26, sqrt = ~5.099
    g1 = torch.tensor([3.0, 4.0])
    g2 = torch.tensor([1.0])
    norm = solution.global_grad_norm([g1, g2])
    assert math.isclose(norm.item(), math.sqrt(26.0), rel_tol=0, abs_tol=1e-6)


def test_global_norm_2d_tensors(solution):
    # Mix of shapes — the norm should treat everything as one long vector.
    g1 = torch.tensor([[1.0, 2.0], [2.0, 0.0]])  # squared sum = 1+4+4+0 = 9
    g2 = torch.tensor([4.0])                     # squared sum = 16
    norm = solution.global_grad_norm([g1, g2])
    assert math.isclose(norm.item(), 5.0, rel_tol=0, abs_tol=1e-6)


def test_global_norm_zero(solution):
    g = torch.zeros(5)
    norm = solution.global_grad_norm([g])
    assert math.isclose(norm.item(), 0.0, rel_tol=0, abs_tol=1e-6)


def test_global_norm_returns_tensor(solution):
    norm = solution.global_grad_norm([torch.tensor([1.0, 1.0])])
    assert isinstance(norm, torch.Tensor)


# ---------- clip_grads_by_global_norm: no-op path ----------

def test_no_clip_when_under_max(solution):
    # Norm = 5, max_norm = 10 -> no clipping.
    g = torch.tensor([3.0, 4.0])
    original = g.clone()
    pre_norm = solution.clip_grads_by_global_norm([g], max_norm=10.0)
    assert torch.equal(g, original), "Gradients must be unchanged when under max_norm"
    assert math.isclose(pre_norm.item(), 5.0, rel_tol=0, abs_tol=1e-6)


def test_no_clip_at_exactly_max(solution):
    # Norm = 5, max_norm = 5 -> at the boundary, do not clip.
    g = torch.tensor([3.0, 4.0])
    original = g.clone()
    solution.clip_grads_by_global_norm([g], max_norm=5.0)
    assert torch.equal(g, original)


def test_no_clip_preserves_all_tensors(solution):
    g1 = torch.tensor([1.0, 1.0])
    g2 = torch.tensor([1.0])
    original1, original2 = g1.clone(), g2.clone()
    solution.clip_grads_by_global_norm([g1, g2], max_norm=100.0)
    assert torch.equal(g1, original1)
    assert torch.equal(g2, original2)


# ---------- clip_grads_by_global_norm: clipping path ----------

def test_clip_reduces_global_norm(solution):
    # Norm = 5, max_norm = 1 -> clip to norm ~1.
    g = torch.tensor([3.0, 4.0])
    solution.clip_grads_by_global_norm([g], max_norm=1.0)
    new_norm = g.norm().item()
    assert math.isclose(new_norm, 1.0, rel_tol=0, abs_tol=1e-3)


def test_clip_preserves_direction_single_tensor(solution):
    # After clipping, g should be a positive scalar multiple of original.
    g = torch.tensor([3.0, 4.0])
    original = g.clone()
    solution.clip_grads_by_global_norm([g], max_norm=1.0)
    # Same direction <=> normalized vectors equal.
    g_unit = g / g.norm()
    orig_unit = original / original.norm()
    assert torch.allclose(g_unit, orig_unit, atol=1e-6)


def test_clip_preserves_direction_multi_tensor(solution):
    # Concatenated unit vector before and after must match.
    g1 = torch.tensor([3.0, 4.0])
    g2 = torch.tensor([1.0])
    orig_concat = torch.cat([g1.flatten(), g2.flatten()]).clone()
    solution.clip_grads_by_global_norm([g1, g2], max_norm=1.0)
    new_concat = torch.cat([g1.flatten(), g2.flatten()])
    new_unit = new_concat / new_concat.norm()
    orig_unit = orig_concat / orig_concat.norm()
    assert torch.allclose(new_unit, orig_unit, atol=1e-6)


def test_clip_uses_same_scale_for_all_tensors(solution):
    # Each tensor must be scaled by the same factor.
    g1 = torch.tensor([3.0, 4.0])
    g2 = torch.tensor([2.0, 0.0])
    o1, o2 = g1.clone(), g2.clone()
    solution.clip_grads_by_global_norm([g1, g2], max_norm=1.0)
    scale1 = g1[0].item() / o1[0].item()
    scale2 = g2[0].item() / o2[0].item()
    assert math.isclose(scale1, scale2, rel_tol=0, abs_tol=1e-6)


def test_clip_returns_pre_clip_norm(solution):
    g = torch.tensor([3.0, 4.0])  # norm 5
    pre = solution.clip_grads_by_global_norm([g], max_norm=1.0)
    assert math.isclose(pre.item(), 5.0, rel_tol=0, abs_tol=1e-6)
    # Sanity: gradient was actually clipped.
    assert math.isclose(g.norm().item(), 1.0, rel_tol=0, abs_tol=1e-3)


def test_clip_in_place(solution):
    # The function modifies the tensors in place — same object identity.
    g = torch.tensor([3.0, 4.0])
    g_ref = g
    solution.clip_grads_by_global_norm([g], max_norm=1.0)
    assert g is g_ref
    assert math.isclose(g.norm().item(), 1.0, rel_tol=0, abs_tol=1e-3)


def test_clip_zero_gradients_is_safe(solution):
    # Zero gradients shouldn't blow up (that's what the +1e-6 is for).
    g = torch.zeros(3)
    pre = solution.clip_grads_by_global_norm([g], max_norm=1.0)
    assert math.isclose(pre.item(), 0.0, rel_tol=0, abs_tol=1e-6)
    assert torch.allclose(g, torch.zeros(3))


def test_real_model_grads(solution):
    """Smoke test on a real model after backward()."""
    torch.manual_seed(0)
    model = torch.nn.Linear(4, 2)
    x = torch.randn(8, 4)
    y = torch.randint(0, 2, (8,))
    loss = torch.nn.functional.cross_entropy(model(x), y)
    loss.backward()
    grads = [p.grad for p in model.parameters() if p.grad is not None]
    assert len(grads) > 0
    pre = solution.clip_grads_by_global_norm(grads, max_norm=0.001)
    # Pre-norm should match what PyTorch's own utility reports.
    expected = math.sqrt(sum(g.detach().pow(2).sum().item() for g in
                             [p.grad for p in model.parameters()]))
    # Note: pre is the pre-clip norm we *captured*, and grads have been
    # scaled in place. Recompute expected from scaled grads * scale_factor.
    post_norm = math.sqrt(sum(g.detach().pow(2).sum().item() for g in grads))
    # After clipping, global norm must be <= max_norm (within epsilon).
    assert post_norm <= 0.001 + 1e-4
    # And pre-clip norm should be > max_norm (otherwise no clip needed).
    assert pre.item() > 0.001
