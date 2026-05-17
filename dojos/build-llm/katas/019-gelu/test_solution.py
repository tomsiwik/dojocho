"""Tests for gelu."""

import torch
import torch.nn as nn


def test_gelu_at_zero(solution):
    """GELU(0) = 0."""
    out = solution.gelu(torch.zeros(5))
    torch.testing.assert_close(out, torch.zeros(5))


def test_gelu_large_positive_approaches_identity(solution):
    """For large positive x, GELU(x) ≈ x."""
    x = torch.tensor([10.0, 20.0, 50.0])
    out = solution.gelu(x)
    torch.testing.assert_close(out, x, atol=1e-3, rtol=1e-3)


def test_gelu_large_negative_approaches_zero(solution):
    """For large negative x, GELU(x) ≈ 0."""
    x = torch.tensor([-10.0, -20.0, -50.0])
    out = solution.gelu(x)
    torch.testing.assert_close(out, torch.zeros_like(x), atol=1e-3, rtol=1e-3)


def test_gelu_matches_nn_gelu_tanh(solution):
    """Our gelu() matches torch.nn.GELU(approximate='tanh') closely."""
    torch.manual_seed(0)
    x = torch.randn(64) * 3.0  # cover a wide range
    ref = nn.GELU(approximate="tanh")(x)
    out = solution.gelu(x)
    torch.testing.assert_close(out, ref, atol=1e-5, rtol=1e-4)


def test_gelu_shape_preserved(solution):
    x = torch.randn(2, 3, 4, 5)
    out = solution.gelu(x)
    assert out.shape == x.shape


def test_gelu_module_is_nn_module(solution):
    g = solution.GELU()
    assert isinstance(g, nn.Module)
    # No learnable parameters.
    assert list(g.parameters()) == []


def test_gelu_module_matches_function(solution):
    torch.manual_seed(1)
    x = torch.randn(16)
    torch.testing.assert_close(solution.GELU()(x), solution.gelu(x))


def test_gelu_differentiable(solution):
    """Gradients flow — and unlike ReLU, are non-zero for negative inputs."""
    x = torch.tensor([-2.0, -1.0, -0.5, 0.0, 0.5, 1.0, 2.0], requires_grad=True)
    solution.gelu(x).sum().backward()
    # Every gradient should be non-zero (smoothness is the whole point).
    assert (x.grad.abs() > 1e-6).all()
