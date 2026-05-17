"""nn-module-subclass — build the same 2-layer MLP three ways.

Architecture (identical in all three forms):
    Linear(4 -> 8) -> ReLU -> Linear(8 -> 2)

Three forms:
  1. `build_sequential()` — using nn.Sequential.
  2. `MLPModule` — subclassing nn.Module.
  3. `mlp_functional(x, W1, b1, W2, b2)` — pure function, no nn.

A fourth helper, `copy_weights_into`, copies weights from an
`MLPModule` into an `nn.Sequential` so the two compute the same
function — used by the test to verify equivalence.
"""

import torch
import torch.nn as nn


def build_sequential() -> nn.Sequential:
    """Return an nn.Sequential of Linear(4, 8) -> ReLU -> Linear(8, 2)."""
    ...  # implement me


class MLPModule(nn.Module):
    """nn.Module subclass: Linear(4, 8) -> ReLU -> Linear(8, 2)."""

    def __init__(self) -> None:
        super().__init__()
        ...  # implement me: construct self.fc1 and self.fc2

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        ...  # implement me: apply fc1, then ReLU, then fc2


def mlp_functional(
    x: torch.Tensor,
    W1: torch.Tensor,
    b1: torch.Tensor,
    W2: torch.Tensor,
    b2: torch.Tensor,
) -> torch.Tensor:
    """Pure functional MLP. Weight conventions match nn.Linear:
        out = x @ W.T + b

    W1 has shape (8, 4), b1 has shape (8,).
    W2 has shape (2, 8), b2 has shape (2,).
    """
    ...  # implement me


def copy_weights_into(module: "MLPModule", sequential: nn.Sequential) -> None:
    """Copy the weights from `module` into `sequential` so that the two
    compute the same function. Wrap mutations in `torch.no_grad()`.
    """
    ...  # implement me
