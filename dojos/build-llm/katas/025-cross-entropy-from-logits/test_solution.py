"""Tests for cross-entropy-from-logits."""

import torch
import torch.nn.functional as F


def test_matches_pytorch_2d(solution):
    """Hand-rolled CE matches F.cross_entropy for (N, V) inputs."""
    torch.manual_seed(0)
    logits = torch.randn(8, 10)
    targets = torch.randint(0, 10, (8,))
    ours = solution.cross_entropy_from_logits(logits, targets)
    ref = F.cross_entropy(logits, targets)
    assert torch.allclose(ours, ref, atol=1e-6), f"{ours.item()} vs {ref.item()}"


def test_returns_scalar(solution):
    logits = torch.randn(4, 5)
    targets = torch.tensor([0, 1, 2, 3])
    out = solution.cross_entropy_from_logits(logits, targets)
    assert out.dim() == 0, f"expected scalar, got shape {out.shape}"


def test_perfect_prediction_low_loss(solution):
    """Logits that strongly favor the target → loss near 0."""
    logits = torch.zeros(3, 5)
    targets = torch.tensor([0, 1, 2])
    # Make the target class 1000x larger than others.
    for i, t in enumerate(targets):
        logits[i, t] = 100.0
    loss = solution.cross_entropy_from_logits(logits, targets)
    assert loss.item() < 1e-3


def test_uniform_logits_log_vocab(solution):
    """Uniform logits → loss == log(V)."""
    V = 50
    logits = torch.zeros(4, V)  # uniform after softmax
    targets = torch.tensor([0, 1, 2, 3])
    loss = solution.cross_entropy_from_logits(logits, targets)
    import math
    assert abs(loss.item() - math.log(V)) < 1e-5


def test_matches_pytorch_3d(solution):
    """3D variant matches F.cross_entropy on flattened tensors."""
    torch.manual_seed(1)
    B, T, V = 2, 6, 12
    logits = torch.randn(B, T, V)
    targets = torch.randint(0, V, (B, T))
    ours = solution.cross_entropy_3d(logits, targets)
    ref = F.cross_entropy(logits.view(-1, V), targets.view(-1))
    assert torch.allclose(ours, ref, atol=1e-6)


def test_gradient_flows(solution):
    """Loss must be differentiable w.r.t. logits."""
    logits = torch.randn(4, 7, requires_grad=True)
    targets = torch.tensor([0, 1, 2, 3])
    loss = solution.cross_entropy_from_logits(logits, targets)
    loss.backward()
    assert logits.grad is not None
    assert logits.grad.shape == logits.shape


def test_numerically_stable_large_logits(solution):
    """Large logits must not overflow (requires log_softmax, not log(softmax))."""
    logits = torch.tensor([[1000.0, 1001.0, 999.0]])
    targets = torch.tensor([1])
    loss = solution.cross_entropy_from_logits(logits, targets)
    assert torch.isfinite(loss).item(), f"loss overflowed: {loss}"
