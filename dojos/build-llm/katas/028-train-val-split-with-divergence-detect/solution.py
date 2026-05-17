"""train-val-split-with-divergence-detect

Train on a tiny corpus long enough to overfit. Track train + val loss
per epoch. Detect the epoch where val loss starts rising — the canonical
'stop training' signal.

This is the single most important diagnostic in supervised ML.
"""

import torch


def evaluate(model: torch.nn.Module, dataloader) -> float:
    """Mean cross-entropy over `dataloader` without updating weights.

    - `model.eval()` to disable dropout / set BN to eval mode.
    - `with torch.no_grad():` so we don't store the backward graph.
    """
    ...  # implement me


def train_with_val(
    model: torch.nn.Module,
    optimizer: torch.optim.Optimizer,
    train_loader,
    val_loader,
    num_epochs: int,
) -> tuple[list[float], list[float]]:
    """Per epoch: train one pass, then evaluate on val_loader.

    Returns:
        (train_losses, val_losses), both length == num_epochs.
    """
    ...  # implement me


def detect_overfit(train_losses: list[float], val_losses: list[float]) -> int:
    """Return the first epoch i >= 1 where val_losses[i] > min(val_losses[:i]).

    Return -1 if val loss never exceeds its running minimum (no overfit).

    Hint: walk once, keep a running minimum, fire on first strict
    excess. This avoids false positives from one-step jitter where val
    later resumes decreasing.
    """
    ...  # implement me
