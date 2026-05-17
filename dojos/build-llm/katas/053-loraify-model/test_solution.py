"""Tests for loraify-model."""

import torch
import torch.nn as nn


def _count_linear(model):
    return sum(1 for m in model.modules() if isinstance(m, nn.Linear))


def test_replaces_inside_sequential(solution):
    model = nn.Sequential(nn.Linear(8, 16), nn.ReLU(), nn.Linear(16, 4))
    solution.replace_linear_with_lora(model, rank=2, alpha=4)
    # No bare nn.Linear left at the top level of Sequential (they should
    # have been wrapped).
    direct_children = list(model.children())
    bare = [c for c in direct_children if isinstance(c, nn.Linear) and not isinstance(c, solution.LoRALinear)]
    assert bare == []
    lora_count = sum(1 for m in model.modules() if isinstance(m, solution.LoRALinear))
    assert lora_count == 2


def test_replaces_nested_modules(solution):
    class Inner(nn.Module):
        def __init__(self):
            super().__init__()
            self.fc = nn.Linear(8, 8)

        def forward(self, x):
            return self.fc(x)

    class Outer(nn.Module):
        def __init__(self):
            super().__init__()
            self.a = Inner()
            self.b = Inner()
            self.head = nn.Linear(8, 2)

        def forward(self, x):
            return self.head(self.b(self.a(x)))

    model = Outer()
    solution.replace_linear_with_lora(model, rank=2, alpha=4)
    # Three Linears originally; all should be wrapped.
    lora_count = sum(1 for m in model.modules() if isinstance(m, solution.LoRALinear))
    assert lora_count == 3


def test_target_names_restricts_replacement(solution):
    class Attn(nn.Module):
        def __init__(self):
            super().__init__()
            self.W_query = nn.Linear(8, 8)
            self.W_key = nn.Linear(8, 8)
            self.W_value = nn.Linear(8, 8)
            self.out_proj = nn.Linear(8, 8)

        def forward(self, x):
            return x

    model = Attn()
    solution.replace_linear_with_lora(
        model, rank=2, alpha=4, target_names={"W_query", "W_value"}
    )
    assert isinstance(model.W_query, solution.LoRALinear)
    assert isinstance(model.W_value, solution.LoRALinear)
    # Key and out_proj should remain bare nn.Linear.
    assert not isinstance(model.W_key, solution.LoRALinear)
    assert isinstance(model.W_key, nn.Linear)
    assert not isinstance(model.out_proj, solution.LoRALinear)


def test_forward_pass_unchanged_at_init(solution):
    """After loraification, output should still match the original
    (because B = 0)."""
    torch.manual_seed(0)
    model = nn.Sequential(nn.Linear(8, 16), nn.ReLU(), nn.Linear(16, 4))
    x = torch.randn(3, 8)
    y_before = model(x)
    solution.replace_linear_with_lora(model, rank=2, alpha=4)
    y_after = model(x)
    assert torch.allclose(y_before, y_after, atol=1e-6)


def test_returns_model(solution):
    model = nn.Sequential(nn.Linear(4, 8), nn.Linear(8, 2))
    out = solution.replace_linear_with_lora(model, rank=2, alpha=4)
    assert out is model
