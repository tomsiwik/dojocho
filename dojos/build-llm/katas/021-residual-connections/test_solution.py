"""Tests for residual-connections."""

import torch
import torch.nn as nn


def _make_deep_model(solution, use_shortcut: bool):
    # 12 hidden layers of width 8, then 8 → 1.
    layer_sizes = [8] * 12 + [1]
    torch.manual_seed(123)
    return solution.DeepMLP(layer_sizes, use_shortcut=use_shortcut)


def test_deep_mlp_is_module(solution):
    model = solution.DeepMLP([4, 4, 4], use_shortcut=False)
    assert isinstance(model, nn.Module)


def test_deep_mlp_output_shape(solution):
    model = solution.DeepMLP([4, 8, 8, 2], use_shortcut=False)
    x = torch.randn(5, 4)
    out = model(x)
    assert out.shape == (5, 2)


def test_deep_mlp_uses_modulelist(solution):
    """Submodules must be visible to .parameters() — i.e., wrapped in
    nn.ModuleList or nn.Sequential, not a raw Python list."""
    model = solution.DeepMLP([4, 4, 4, 4], use_shortcut=False)
    # 3 Linears + biases = 6 parameter tensors total.
    params = list(model.parameters())
    assert len(params) == 6


def test_gradient_norms_returns_one_per_layer(solution):
    model = solution.DeepMLP([8, 8, 8, 8, 1], use_shortcut=False)
    x = torch.tensor([[1.0] * 8])
    target = torch.tensor([[0.0]])
    norms = solution.gradient_norms(model, x, target)
    # 4 weight matrices (one per Linear).
    assert len(norms) == 4
    assert all(isinstance(n, float) for n in norms)
    assert all(n > 0 for n in norms)


def test_vanishing_gradients_without_shortcut(solution):
    """The early-layer gradient should be far smaller than the late-layer
    gradient in a deep MLP without residuals."""
    model = _make_deep_model(solution, use_shortcut=False)
    x = torch.tensor([[1.0, 0.0, -1.0, 0.5, -0.5, 0.3, -0.3, 0.1]])
    target = torch.tensor([[0.0]])
    norms = solution.gradient_norms(model, x, target)
    # The first-layer gradient should be at least 50× smaller than the
    # last-layer gradient (in practice it's hundreds of × smaller).
    assert norms[-1] / norms[0] > 50.0


def test_residual_fixes_vanishing(solution):
    """With residuals, the early-layer gradient should be within ~1
    order of magnitude of the late-layer gradient."""
    model = _make_deep_model(solution, use_shortcut=True)
    x = torch.tensor([[1.0, 0.0, -1.0, 0.5, -0.5, 0.3, -0.3, 0.1]])
    target = torch.tensor([[0.0]])
    norms = solution.gradient_norms(model, x, target)
    # Last/first ratio should be modest (the chapter shows ~6×).
    ratio = norms[-1] / norms[0]
    assert ratio < 50.0, f"residuals failed to fix vanishing: ratio={ratio}"


def test_residual_skipped_when_shape_changes(solution):
    """Forward must not crash when a layer changes shape (no shortcut
    can be added there). The 8→1 last layer is the test case."""
    model = solution.DeepMLP([8, 8, 1], use_shortcut=True)
    x = torch.randn(2, 8)
    out = model(x)  # must not raise
    assert out.shape == (2, 1)
