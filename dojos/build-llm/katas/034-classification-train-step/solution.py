"""Classification Train Step.

One SGD step for a last-token classifier:
  zero_grad -> forward -> last-token logits -> CE loss -> backward -> step

Plus a verification helper that runs N steps and confirms the loss
actually decreased.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F


def last_token_logits(model: nn.Module, x: torch.Tensor) -> torch.Tensor:
    """Forward the model and slice the last time step.

    Input:  x: (B, T) of token IDs
    Output: (B, n_classes)
    """
    ...  # implement me


def compute_loss(logits: torch.Tensor, y: torch.Tensor) -> torch.Tensor:
    """Standard classification cross-entropy.

    logits: (B, n_classes)
    y:      (B,) of class indices, dtype=torch.long
    Returns a scalar tensor.
    """
    ...  # implement me


def train_step(
    model: nn.Module,
    optimizer: torch.optim.Optimizer,
    x: torch.Tensor,
    y: torch.Tensor,
) -> float:
    """One full training step. Returns the loss value BEFORE the step
    (i.e. the loss the optimizer was about to minimize)."""
    ...  # implement me


def loss_decreases(
    model: nn.Module,
    optimizer: torch.optim.Optimizer,
    x: torch.Tensor,
    y: torch.Tensor,
    n_steps: int = 5,
) -> bool:
    """Snapshot loss, run n_steps of train_step on (x, y), snapshot
    again. Return True iff loss_after < loss_before.

    Use `torch.no_grad()` around the snapshot forwards.
    """
    ...  # implement me
