"""Reference solution for Gradual Unfreezing."""

import torch
import torch.nn as nn


def count_blocks(model: nn.Module) -> int:
    return len(model.blocks)


def _top_level_name(param_name: str) -> str:
    """`blocks.2.attn.weight` -> `blocks.2`; `out_head.weight` -> `out_head`."""
    parts = param_name.split(".")
    if parts[0] == "blocks" and len(parts) >= 2:
        return f"blocks.{parts[1]}"
    return parts[0]


def unfreeze_for_epoch(
    model: nn.Module,
    epoch: int,
    head_only_epochs: int = 2,
) -> None:
    n_blocks = count_blocks(model)
    # How many blocks are unfrozen this epoch?
    k = max(0, epoch - head_only_epochs + 1)
    k = min(k, n_blocks)
    # Indices of unfrozen blocks (the last k).
    unfrozen_block_idxs = set(range(n_blocks - k, n_blocks))

    # Always-trainable top-level names.
    trainable_tops = {"out_head", "final_norm"}
    for i in unfrozen_block_idxs:
        trainable_tops.add(f"blocks.{i}")

    for name, p in model.named_parameters():
        top = _top_level_name(name)
        p.requires_grad = top in trainable_tops


def schedule_summary(
    model: nn.Module,
    n_blocks: int,
    n_epochs: int,
    head_only_epochs: int = 2,
) -> list[set[str]]:
    out: list[set[str]] = []
    for epoch in range(n_epochs):
        unfreeze_for_epoch(model, epoch, head_only_epochs=head_only_epochs)
        tops = {
            _top_level_name(n)
            for n, p in model.named_parameters()
            if p.requires_grad
        }
        out.append(tops)
    return out
