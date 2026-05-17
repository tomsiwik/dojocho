"""Tests for lora-merge."""

import torch
import torch.nn as nn


def _perturb_lora(model, solution, scale=0.1):
    """Set B to small random values so LoRA actually contributes."""
    torch.manual_seed(42)
    with torch.no_grad():
        for m in model.modules():
            if isinstance(m, solution.LoRALinear):
                m.B.copy_(torch.randn_like(m.B) * scale)


def test_merge_replaces_lora_with_linear(solution):
    model = nn.Sequential(nn.Linear(8, 16), nn.ReLU(), nn.Linear(16, 4))
    solution.replace_linear_with_lora(model, rank=2, alpha=4)
    solution.merge_lora(model)
    # No LoRALinear should remain anywhere.
    has_lora = any(isinstance(m, solution.LoRALinear) for m in model.modules())
    assert not has_lora
    # The two Linears should be back as bare nn.Linear.
    linears = [m for m in model.modules() if isinstance(m, nn.Linear)]
    assert len(linears) == 2


def test_merge_preserves_output_at_init(solution):
    """B = 0 → merged weight equals W_old → output equals original."""
    torch.manual_seed(0)
    model = nn.Sequential(nn.Linear(8, 16), nn.ReLU(), nn.Linear(16, 4))
    x = torch.randn(3, 8)
    y_before = model(x).clone()
    solution.replace_linear_with_lora(model, rank=2, alpha=4)
    solution.merge_lora(model)
    y_after = model(x)
    assert torch.allclose(y_before, y_after, atol=1e-5)


def test_merge_preserves_output_after_perturbation(solution):
    """With B != 0, the merged forward must equal the LoRA forward."""
    torch.manual_seed(0)
    model = nn.Sequential(nn.Linear(8, 16), nn.ReLU(), nn.Linear(16, 4))
    solution.replace_linear_with_lora(model, rank=2, alpha=4)
    _perturb_lora(model, solution)

    x = torch.randn(3, 8)
    y_lora = model(x).clone()
    solution.merge_lora(model)
    y_merged = model(x)
    assert torch.allclose(y_lora, y_merged, atol=1e-5)


def test_merge_preserves_output_nested(solution):
    """Same property, but with a deeper model structure."""

    class Block(nn.Module):
        def __init__(self):
            super().__init__()
            self.fc1 = nn.Linear(8, 16)
            self.fc2 = nn.Linear(16, 8)

        def forward(self, x):
            return self.fc2(torch.relu(self.fc1(x)))

    class Model(nn.Module):
        def __init__(self):
            super().__init__()
            self.b1 = Block()
            self.b2 = Block()
            self.head = nn.Linear(8, 2)

        def forward(self, x):
            return self.head(self.b2(self.b1(x)))

    torch.manual_seed(0)
    model = Model()
    solution.replace_linear_with_lora(model, rank=2, alpha=4)
    _perturb_lora(model, solution)

    x = torch.randn(5, 8)
    y_lora = model(x).clone()
    solution.merge_lora(model)
    y_merged = model(x)
    assert torch.allclose(y_lora, y_merged, atol=1e-5)
    # No LoRALinear should remain.
    assert not any(isinstance(m, solution.LoRALinear) for m in model.modules())


def test_merge_keeps_bias(solution):
    """Bias must be carried through unchanged."""
    torch.manual_seed(0)
    model = nn.Sequential(nn.Linear(4, 8, bias=True))
    original_bias = model[0].bias.detach().clone()
    solution.replace_linear_with_lora(model, rank=2, alpha=4)
    solution.merge_lora(model)
    merged = model[0]
    assert isinstance(merged, nn.Linear)
    assert merged.bias is not None
    assert torch.allclose(merged.bias, original_bias)


def test_merge_uses_scaling(solution):
    """alpha/rank must be applied. Set B nonzero with known values
    and check the merged weight matches W_old + (alpha/rank)*(A@B).T."""
    torch.manual_seed(0)
    linear = nn.Linear(4, 3, bias=False)
    W_old = linear.weight.detach().clone()
    model = nn.Sequential(linear)
    solution.replace_linear_with_lora(model, rank=2, alpha=4)
    lora = model[0]
    A = lora.A.detach().clone()
    with torch.no_grad():
        lora.B.copy_(torch.randn(2, 3))
    B = lora.B.detach().clone()

    solution.merge_lora(model)
    merged = model[0]
    expected = W_old + (4 / 2) * (A @ B).T
    assert torch.allclose(merged.weight, expected, atol=1e-5)
