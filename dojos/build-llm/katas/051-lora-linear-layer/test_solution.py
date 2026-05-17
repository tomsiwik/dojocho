"""Tests for lora-linear-layer."""

import torch
import torch.nn as nn


def test_module_is_nn_module(solution):
    linear = nn.Linear(8, 4)
    lora = solution.LoRALinear(linear, rank=2, alpha=4)
    assert isinstance(lora, nn.Module)


def test_has_A_and_B_parameters(solution):
    linear = nn.Linear(8, 4)
    lora = solution.LoRALinear(linear, rank=2, alpha=4)
    names = {n for n, _ in lora.named_parameters()}
    # Must contain A and B somewhere in the name.
    has_A = any(n.endswith("A") or n == "A" for n in names)
    has_B = any(n.endswith("B") or n == "B" for n in names)
    assert has_A and has_B, f"Missing A/B in params: {names}"


def test_A_and_B_shapes(solution):
    linear = nn.Linear(8, 4)
    lora = solution.LoRALinear(linear, rank=2, alpha=4)
    assert lora.A.shape == (8, 2)
    assert lora.B.shape == (2, 4)


def test_B_initialized_to_zero(solution):
    linear = nn.Linear(8, 4)
    lora = solution.LoRALinear(linear, rank=2, alpha=4)
    assert torch.all(lora.B == 0)


def test_A_initialized_nonzero(solution):
    """Kaiming init should leave A nonzero with extremely high probability."""
    linear = nn.Linear(64, 32)
    lora = solution.LoRALinear(linear, rank=8, alpha=16)
    assert not torch.all(lora.A == 0)


def test_W_old_frozen(solution):
    linear = nn.Linear(8, 4)
    lora = solution.LoRALinear(linear, rank=2, alpha=4)
    # The wrapped linear's weight (and bias) must NOT require grad.
    assert lora.linear.weight.requires_grad is False
    if lora.linear.bias is not None:
        assert lora.linear.bias.requires_grad is False


def test_A_and_B_trainable(solution):
    linear = nn.Linear(8, 4)
    lora = solution.LoRALinear(linear, rank=2, alpha=4)
    assert lora.A.requires_grad is True
    assert lora.B.requires_grad is True


def test_forward_matches_linear_at_init(solution):
    """Because B = 0, the LoRA branch is zero → output == linear(x)."""
    torch.manual_seed(0)
    linear = nn.Linear(8, 4)
    lora = solution.LoRALinear(linear, rank=2, alpha=4)
    x = torch.randn(3, 8)
    y_lora = lora(x)
    y_linear = linear(x)
    assert torch.allclose(y_lora, y_linear, atol=1e-6)


def test_forward_shape(solution):
    linear = nn.Linear(8, 4)
    lora = solution.LoRALinear(linear, rank=2, alpha=4)
    x = torch.randn(5, 8)
    y = lora(x)
    assert y.shape == (5, 4)


def test_forward_uses_scaling(solution):
    """After perturbing B, output should equal linear(x) + (alpha/rank) * x @ A @ B."""
    torch.manual_seed(0)
    linear = nn.Linear(8, 4)
    lora = solution.LoRALinear(linear, rank=2, alpha=4)
    # Manually set B so the LoRA branch is nonzero.
    with torch.no_grad():
        lora.B.copy_(torch.randn(2, 4))
    x = torch.randn(3, 8)
    expected = linear(x) + (4 / 2) * (x @ lora.A @ lora.B)
    assert torch.allclose(lora(x), expected, atol=1e-5)


def test_gradient_flows_only_to_A_and_B(solution):
    torch.manual_seed(0)
    linear = nn.Linear(8, 4)
    lora = solution.LoRALinear(linear, rank=2, alpha=4)
    # Perturb B so loss has a gradient w.r.t. A and B.
    with torch.no_grad():
        lora.B.copy_(torch.randn(2, 4) * 0.1)
    x = torch.randn(3, 8)
    loss = lora(x).pow(2).sum()
    loss.backward()
    assert lora.A.grad is not None and lora.A.grad.abs().sum() > 0
    assert lora.B.grad is not None and lora.B.grad.abs().sum() > 0
    assert lora.linear.weight.grad is None
