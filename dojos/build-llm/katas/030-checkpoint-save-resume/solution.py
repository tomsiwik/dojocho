"""checkpoint-save-resume

Save full training state (model + optimizer + step) to disk, then
restore it and continue training as if nothing happened.

Why save the optimizer? AdamW keeps per-parameter momentum and
variance estimates. Without them, resume = cold restart for several
hundred steps — silently degrading your final model.
"""

from pathlib import Path

import torch


def save_checkpoint(
    path: str | Path,
    model: torch.nn.Module,
    optimizer: torch.optim.Optimizer,
    step: int,
) -> None:
    """Save model + optimizer + step under one path.

    Use `torch.save({...}, path)` with a dict of:
        - 'model':     model.state_dict()
        - 'optimizer': optimizer.state_dict()
        - 'step':      step
    """
    ...  # implement me


def load_checkpoint(
    path: str | Path,
    model: torch.nn.Module,
    optimizer: torch.optim.Optimizer,
) -> int:
    """Restore model + optimizer in place. Return the saved step.

    Note: for PyTorch 2.6+ you may need `weights_only=False` on
    torch.load because we save more than tensors.
    """
    ...  # implement me


def train_steps(
    model: torch.nn.Module,
    optimizer: torch.optim.Optimizer,
    dataloader,
    n_steps: int,
) -> list[float]:
    """Run exactly n_steps mini-batch updates. Cycle the dataloader if needed.

    Return per-step losses as a list of floats.
    """
    ...  # implement me
