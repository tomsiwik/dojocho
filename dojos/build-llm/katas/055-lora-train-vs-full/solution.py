"""lora-train-vs-full — train y = 3x + 2 two ways and compare.

Implement `train_full` and `train_lora`. Each returns
{"final_loss": float, "trainable_params": int}.

A `LoRALinear` and `replace_linear_with_lora` are provided.
"""

import math
from typing import Iterable, Optional

import torch
import torch.nn as nn


class LoRALinear(nn.Module):
    """Provided."""

    def __init__(self, linear: nn.Linear, rank: int, alpha: float):
        super().__init__()
        self.linear = linear
        self.linear.weight.requires_grad = False
        if self.linear.bias is not None:
            self.linear.bias.requires_grad = False
        self.rank = rank
        self.alpha = alpha
        self.scaling = alpha / rank
        self.A = nn.Parameter(torch.empty(linear.in_features, rank))
        nn.init.kaiming_uniform_(self.A, a=math.sqrt(5))
        self.B = nn.Parameter(torch.zeros(rank, linear.out_features))

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.linear(x) + self.scaling * (x @ self.A @ self.B)


def replace_linear_with_lora(
    model: nn.Module,
    rank: int = 8,
    alpha: float = 16,
    target_names: Optional[Iterable[str]] = None,
) -> nn.Module:
    """Provided."""
    targets = set(target_names) if target_names is not None else None
    to_replace = []
    for name, module in model.named_modules():
        if name == "":
            continue
        if isinstance(module, nn.Linear) and not isinstance(module, LoRALinear):
            attr = name.rsplit(".", 1)[-1]
            if targets is None or attr in targets:
                to_replace.append(name)
    for name in to_replace:
        parts = name.split(".")
        parent = model
        for p in parts[:-1]:
            parent = getattr(parent, p)
        child = getattr(parent, parts[-1])
        setattr(parent, parts[-1], LoRALinear(child, rank=rank, alpha=alpha))
    return model


def train_full(steps: int = 400, lr: float = 0.05, seed: int = 0) -> dict:
    """Train a small model on y = 3x + 2 with ALL params trainable.

    Returns {"final_loss": float, "trainable_params": int}.
    """
    ...  # implement me


def train_lora(
    steps: int = 400,
    lr: float = 0.05,
    seed: int = 0,
    rank: int = 2,
    alpha: float = 4,
) -> dict:
    """Same model + same seed, but wrapped with LoRA. Only LoRA params
    are trained.

    Returns {"final_loss": float, "trainable_params": int}.
    """
    ...  # implement me
