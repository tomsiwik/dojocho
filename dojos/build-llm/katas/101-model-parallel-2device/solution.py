"""model-parallel-2device — split a 2-layer MLP across two fake devices.

Devices here are just string labels; the "transfer" is a mock callback
you call exactly once on the intermediate activation. This is the
conceptual core of HF Accelerate's dispatch_model.
"""

from typing import Callable

import torch
import torch.nn as nn


def forward_split(
    x: torch.Tensor,
    layer1: nn.Linear,
    layer2: nn.Linear,
    transfer_callback: Callable[[torch.Tensor], None],
) -> torch.Tensor:
    """Run a 2-layer MLP `x -> layer1 -> relu -> layer2 -> y`, but
    pretend `layer1` lives on device 1 and `layer2` lives on device 2.

    Invoke `transfer_callback(activation)` exactly once, on the tensor
    that crosses the device boundary (i.e. the post-activation output
    of layer1, before layer2 consumes it).
    """
    ...  # implement me
