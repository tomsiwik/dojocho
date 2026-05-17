"""loraify-model — recursively swap nn.Linear modules for LoRALinear.

The `LoRALinear` class is provided here so this kata is self-contained
(it duplicates the result of `lora-linear-layer`). YOUR job is to
implement `replace_linear_with_lora`.
"""

import math
from typing import Iterable, Optional

import torch
import torch.nn as nn


class LoRALinear(nn.Module):
    """Provided. Same as `lora-linear-layer`."""

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
    """Replace every `nn.Linear` in `model` with a `LoRALinear` wrapper.

    If `target_names` is given, only Linears whose attribute name on
    their parent module is in `target_names` are replaced. Mutates
    `model` in place; returns it for chaining.
    """
    ...  # implement me
