"""Masked Loss

Masked cross-entropy for instruction fine-tuning: only target positions
where mask==1 contribute to the loss. Equivalent to PyTorch's
F.cross_entropy(..., ignore_index=-100) trick when masked-out target
positions are replaced with -100.
"""

import torch
import torch.nn.functional as F


def masked_ce(
    logits: torch.Tensor,  # (B, T, V)
    targets: torch.Tensor,  # (B, T) long
    mask: torch.Tensor,     # (B, T) 0/1
) -> torch.Tensor:
    """Mean cross-entropy over positions where mask == 1.

    Returns a scalar tensor. Returns 0.0 (with grad) if mask is all-zero.
    """
    ...  # implement me


def targets_with_ignore(
    targets: torch.Tensor,
    mask: torch.Tensor,
    ignore_index: int = -100,
) -> torch.Tensor:
    """Return a copy of `targets` with `mask == 0` positions replaced
    with `ignore_index`. Used by the equivalence test against
    F.cross_entropy(..., ignore_index=-100).
    """
    ...  # implement me
