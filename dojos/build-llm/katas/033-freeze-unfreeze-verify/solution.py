"""Freeze, Unfreeze, Verify.

Helpers to flip requires_grad on subsets of a model, and to verify
(post-backward) which parameters actually received a gradient.
"""

import torch
import torch.nn as nn


def freeze_all(model: nn.Module) -> None:
    """Set requires_grad=False on every parameter."""
    ...  # implement me


def unfreeze(model: nn.Module, names: list[str]) -> None:
    """For each module path in `names` (e.g. 'blocks.1', 'out_head'),
    set requires_grad=True on every parameter under that path.

    Match `name.startswith(path + '.')` or `name == path` to avoid
    accidentally matching `blocks.10` when you meant `blocks.1`.
    """
    ...  # implement me


def is_frozen(param: nn.Parameter) -> bool:
    """Return True iff param.requires_grad is False."""
    ...  # implement me


def trainable_param_names(model: nn.Module) -> list[str]:
    """Return a sorted list of parameter names with requires_grad=True."""
    ...  # implement me


def params_with_grad(model: nn.Module) -> list[str]:
    """Return a sorted list of parameter names whose `.grad is not None`.

    Call this AFTER `loss.backward()`. Frozen params will be absent;
    trainable params will be present.
    """
    ...  # implement me
