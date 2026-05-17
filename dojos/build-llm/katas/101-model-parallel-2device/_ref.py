"""Reference solution for model-parallel-2device."""

from typing import Callable

import torch
import torch.nn as nn


def forward_split(
    x: torch.Tensor,
    layer1: nn.Linear,
    layer2: nn.Linear,
    transfer_callback: Callable[[torch.Tensor], None],
) -> torch.Tensor:
    # layer1 runs on "device 1"
    h = torch.relu(layer1(x))
    # cross the device boundary
    transfer_callback(h)
    # layer2 runs on "device 2"
    return layer2(h)
