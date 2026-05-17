"""training-loop

The 5-line PyTorch training ritual:

    zero_grad → forward → loss → backward → step

Wrap it in an epoch loop and you have the entire training engine that
powers GPT, Llama, Claude, and every other deep model. Get the order
wrong and you either don't train or you silently corrupt training.
"""

import torch
import torch.nn.functional as F


def train_one_epoch(
    model: torch.nn.Module,
    optimizer: torch.optim.Optimizer,
    dataloader,
    device: str = "cpu",
) -> float:
    """Run one epoch of training. Return the mean loss across batches.

    Each batch from `dataloader` is `(inputs, targets)`:
      - inputs: shape (B, T), long
      - targets: shape (B, T), long

    The model returns logits of shape (B, T, V). Flatten to compute CE.

    Use the 5-step ritual in the correct order. The lines you need
    (scrambled — un-scramble them):

        loss.backward()
        optimizer.step()
        logits = model(inputs)
        optimizer.zero_grad()
        loss = F.cross_entropy(logits.view(-1, V), targets.view(-1))
    """
    ...  # implement me


def train(
    model: torch.nn.Module,
    optimizer: torch.optim.Optimizer,
    dataloader,
    num_epochs: int,
    device: str = "cpu",
) -> list[float]:
    """Train for `num_epochs`. Return per-epoch mean losses."""
    ...  # implement me
