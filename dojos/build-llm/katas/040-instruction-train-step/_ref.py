"""Reference solution for instruction-train-step."""

import torch
import torch.nn.functional as F


def _masked_ce(logits, targets, mask):
    B, T, V = logits.shape
    flat_logits = logits.reshape(-1, V)
    flat_targets = targets.reshape(-1)
    flat_mask = mask.reshape(-1).float()
    per_pos = F.cross_entropy(flat_logits, flat_targets, reduction="none")
    denom = flat_mask.sum()
    if denom.item() == 0:
        return (per_pos * flat_mask).sum()
    return (per_pos * flat_mask).sum() / denom


def train_one_step(model, batch, optimizer) -> float:
    input_ids, target_ids, mask = batch
    model.train()
    optimizer.zero_grad()
    logits = model(input_ids)
    loss = _masked_ce(logits, target_ids, mask)
    loss.backward()
    optimizer.step()
    return float(loss.item())


def train_until(model, batches, optimizer, steps: int = 50) -> list[float]:
    losses = []
    n = len(batches)
    for i in range(steps):
        losses.append(train_one_step(model, batches[i % n], optimizer))
    return losses
