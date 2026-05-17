"""lora-merge — collapse LoRALinear modules back into plain nn.Linear.

After training, fold W_old + (alpha/rank) * (A @ B) into one Linear
so the forward pass has zero LoRA overhead.

A `LoRALinear` and a `replace_linear_with_lora` helper are provided so
this kata is self-contained. YOUR job is to implement `merge_lora`.
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
    """Provided. Same as the `loraify-model` kata."""
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


def merge_lora(model: nn.Module) -> nn.Module:
    """Replace every `LoRALinear` in `model` with a single `nn.Linear`
    whose weight equals `W_old + (alpha/rank) * (A @ B).T`.

    The merged model's forward pass should produce output identical
    (within float tolerance) to the LoRA-wrapped model.
    """
    ...  # implement me
