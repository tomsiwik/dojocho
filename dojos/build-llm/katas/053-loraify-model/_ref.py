"""Reference solution for loraify-model."""

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


def _get_parent_and_attr(model: nn.Module, qualified_name: str):
    """Return (parent_module, attr_name) given a dotted qualified name."""
    if "." not in qualified_name:
        return model, qualified_name
    parent_path, attr = qualified_name.rsplit(".", 1)
    parent = model
    for part in parent_path.split("."):
        parent = getattr(parent, part)
    return parent, attr


def replace_linear_with_lora(
    model: nn.Module,
    rank: int = 8,
    alpha: float = 16,
    target_names: Optional[Iterable[str]] = None,
) -> nn.Module:
    targets = set(target_names) if target_names is not None else None

    # Snapshot first to avoid mutating during iteration.
    to_replace = []
    for name, module in model.named_modules():
        if name == "":
            continue
        if isinstance(module, nn.Linear) and not isinstance(module, LoRALinear):
            attr = name.rsplit(".", 1)[-1]
            if targets is None or attr in targets:
                to_replace.append(name)

    for name in to_replace:
        parent, attr = _get_parent_and_attr(model, name)
        child = getattr(parent, attr)
        setattr(parent, attr, LoRALinear(child, rank=rank, alpha=alpha))

    return model
