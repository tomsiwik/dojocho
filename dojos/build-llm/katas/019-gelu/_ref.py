"""Reference solution for gelu."""

import math

import torch
import torch.nn as nn

_SQRT_2_OVER_PI = math.sqrt(2.0 / math.pi)


def gelu(x: torch.Tensor) -> torch.Tensor:
    return 0.5 * x * (1.0 + torch.tanh(_SQRT_2_OVER_PI * (x + 0.044715 * x * x * x)))


class GELU(nn.Module):
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return gelu(x)
