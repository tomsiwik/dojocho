"""Classification Head Swap.

Replace a pretrained LM's `out_head` (Linear -> vocab) with a new head
(Linear -> n_classes). Verify the body is untouched and the new head
is trainable.
"""

import torch
import torch.nn as nn


def swap_head(model: nn.Module, n_classes: int) -> nn.Module:
    """Replace `model.out_head` with `nn.Linear(d_model, n_classes)`.

    `d_model` is read from `model.out_head.in_features`. The new head
    is trainable (default). Returns the same model object, mutated.
    """
    ...  # implement me


def body_state_dict(model: nn.Module) -> dict[str, torch.Tensor]:
    """Snapshot every parameter that is NOT in `out_head`.

    Returns a dict `{param_name: cloned_tensor}` so the caller can
    later verify the body is byte-for-byte identical.
    """
    ...  # implement me


def verify_body_unchanged(
    model: nn.Module, snapshot: dict[str, torch.Tensor]
) -> bool:
    """Return True iff every tensor in `snapshot` equals the current
    model param of the same name (exact match via `torch.equal`).
    """
    ...  # implement me
