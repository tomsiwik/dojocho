"""Reference solution for lora-merge."""

import math
from typing import Iterable, Optional

import torch
import torch.nn as nn


class LoRALinear(nn.Module):
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


def _get_parent_and_attr(model, qualified_name):
    parts = qualified_name.split(".")
    parent = model
    for p in parts[:-1]:
        parent = getattr(parent, p)
    return parent, parts[-1]


def merge_lora(model: nn.Module) -> nn.Module:
    to_merge = []
    for name, module in model.named_modules():
        if name == "":
            continue
        if isinstance(module, LoRALinear):
            to_merge.append(name)

    for name in to_merge:
        parent, attr = _get_parent_and_attr(model, name)
        lora = getattr(parent, attr)
        old_linear = lora.linear
        in_features = old_linear.in_features
        out_features = old_linear.out_features
        bias = old_linear.bias is not None

        merged = nn.Linear(in_features, out_features, bias=bias)
        with torch.no_grad():
            delta = lora.scaling * (lora.A @ lora.B).T
            merged.weight.copy_(old_linear.weight + delta)
            if bias:
                merged.bias.copy_(old_linear.bias)
        setattr(parent, attr, merged)

    return model
