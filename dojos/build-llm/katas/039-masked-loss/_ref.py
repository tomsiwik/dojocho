"""Reference solution for masked-loss."""

import torch
import torch.nn.functional as F


def masked_ce(logits, targets, mask):
    B, T, V = logits.shape
    flat_logits = logits.reshape(-1, V)
    flat_targets = targets.reshape(-1)
    flat_mask = mask.reshape(-1).float()

    per_pos = F.cross_entropy(flat_logits, flat_targets, reduction="none")
    denom = flat_mask.sum()
    if denom.item() == 0:
        # Return a 0 scalar that still participates in autograd graph.
        return (per_pos * flat_mask).sum()
    return (per_pos * flat_mask).sum() / denom


def targets_with_ignore(targets, mask, ignore_index: int = -100):
    out = targets.clone()
    out[mask == 0] = ignore_index
    return out
