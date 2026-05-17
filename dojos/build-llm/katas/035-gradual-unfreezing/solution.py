"""Gradual Unfreezing (ULMFiT-style).

A per-epoch scheduler that flips requires_grad on a model:

  epoch < head_only_epochs:
      trainable = {out_head, final_norm}
  epoch >= head_only_epochs:
      k = min(epoch - head_only_epochs + 1, n_blocks)
      trainable = {out_head, final_norm, blocks[N-k], ..., blocks[N-1]}

Embedding (tok_emb) is always frozen.
"""

import torch
import torch.nn as nn


def count_blocks(model: nn.Module) -> int:
    """Return the number of blocks in `model.blocks`."""
    ...  # implement me


def unfreeze_for_epoch(
    model: nn.Module,
    epoch: int,
    head_only_epochs: int = 2,
) -> None:
    """Apply the gradual unfreezing schedule for a given epoch.

    - Always freeze `tok_emb`.
    - Always trainable: `out_head`, `final_norm`.
    - Unfreeze the last `k` blocks where
      `k = max(0, epoch - head_only_epochs + 1)`, clamped to
      `count_blocks(model)`.
    - Idempotent: must work correctly when called twice for the same
      or different epoch.
    """
    ...  # implement me


def schedule_summary(
    model: nn.Module,
    n_blocks: int,
    n_epochs: int,
    head_only_epochs: int = 2,
) -> list[set[str]]:
    """Return one set of top-level trainable module names per epoch.

    For each epoch in `range(n_epochs)`:
      - call `unfreeze_for_epoch(model, epoch, head_only_epochs)`
      - collect the set of top-level module names whose params are
        trainable.

    "Top-level module name" for `blocks.2.attn.weight` is `"blocks.2"`.
    For `out_head.weight` it's `"out_head"`.
    """
    ...  # implement me
