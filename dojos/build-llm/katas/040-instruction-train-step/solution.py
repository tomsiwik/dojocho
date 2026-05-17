"""Instruction Train Step

The full instruction fine-tuning loop in one function: dataset batch →
forward → masked loss → backward → optimizer step. The only thing
different from a pretraining step is that the loss respects a
prompt/response mask.
"""

import torch


def train_one_step(model, batch, optimizer) -> float:
    """One full optimizer step on one batch.

    Parameters
    ----------
    model : nn.Module
        Takes input_ids of shape (B, T), returns logits of shape (B, T, V).
    batch : tuple
        (input_ids, target_ids, mask), each shape (B, T). Mask is 0/1
        long tensor — 1 where the loss should count, 0 elsewhere.
    optimizer : torch.optim.Optimizer

    Returns
    -------
    float : the scalar loss value for this step.
    """
    ...  # implement me


def train_until(model, batches, optimizer, steps: int = 50) -> list[float]:
    """Cycle through `batches` for `steps` iterations.

    Returns the list of per-step loss values (length == steps).
    """
    ...  # implement me
