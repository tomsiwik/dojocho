"""Tests for lora-parameter-count."""

import math

import torch
import torch.nn as nn


def test_count_total_linear(solution):
    """Linear(768, 768) has 768*768 weight + 768 bias = 590592 params."""
    m = nn.Linear(768, 768)
    assert solution.count_total(m) == 768 * 768 + 768


def test_count_trainable_linear_default(solution):
    """A fresh Linear is fully trainable."""
    m = nn.Linear(768, 768)
    assert solution.count_trainable(m) == 768 * 768 + 768


def test_count_trainable_after_freezing(solution):
    """Freeze the weight → only bias is trainable."""
    m = nn.Linear(768, 768)
    m.weight.requires_grad = False
    assert solution.count_trainable(m) == 768  # bias only
    assert solution.count_total(m) == 768 * 768 + 768


def test_count_zero_when_all_frozen(solution):
    m = nn.Linear(32, 16)
    for p in m.parameters():
        p.requires_grad = False
    assert solution.count_trainable(m) == 0
    assert solution.count_total(m) == 32 * 16 + 16


def test_count_lora_savings_768_rank_8(solution):
    """The headline number: Linear(768, 768) wrapped with LoRA(r=8)
    has 768*8 + 8*768 = 12288 trainable params (A and B), 768*768+768
    frozen, and 768*768+768+12288 total. Savings ratio ~48×."""

    class TinyLoRALinear(nn.Module):
        def __init__(self, linear, rank, alpha):
            super().__init__()
            self.linear = linear
            self.linear.weight.requires_grad = False
            if self.linear.bias is not None:
                self.linear.bias.requires_grad = False
            self.A = nn.Parameter(torch.empty(linear.in_features, rank))
            nn.init.kaiming_uniform_(self.A, a=math.sqrt(5))
            self.B = nn.Parameter(torch.zeros(rank, linear.out_features))

        def forward(self, x):
            return self.linear(x) + (alpha / rank) * (x @ self.A @ self.B)

    linear = nn.Linear(768, 768)
    wrapped = TinyLoRALinear(linear, rank=8, alpha=16)

    trainable = solution.count_trainable(wrapped)
    total = solution.count_total(wrapped)
    assert trainable == 768 * 8 + 8 * 768  # 12288
    assert total == (768 * 768 + 768) + (768 * 8 + 8 * 768)

    # Savings ratio: ~48× fewer trainable than the original full Linear.
    full_trainable = 768 * 768 + 768  # 590592
    ratio = full_trainable / trainable
    assert 47 < ratio < 49


def test_recurses_into_submodules(solution):
    """count_* must recurse through Sequential / submodules."""
    m = nn.Sequential(nn.Linear(4, 8), nn.ReLU(), nn.Linear(8, 2))
    expected = (4 * 8 + 8) + (8 * 2 + 2)
    assert solution.count_total(m) == expected
    assert solution.count_trainable(m) == expected
