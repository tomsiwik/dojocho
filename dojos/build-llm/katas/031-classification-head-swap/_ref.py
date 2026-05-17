"""Reference solution for Classification Head Swap."""

import torch
import torch.nn as nn


def swap_head(model: nn.Module, n_classes: int) -> nn.Module:
    d_model = model.out_head.in_features
    model.out_head = nn.Linear(d_model, n_classes)
    return model


def body_state_dict(model: nn.Module) -> dict[str, torch.Tensor]:
    return {
        name: param.detach().clone()
        for name, param in model.named_parameters()
        if not name.startswith("out_head")
    }


def verify_body_unchanged(
    model: nn.Module, snapshot: dict[str, torch.Tensor]
) -> bool:
    current = dict(model.named_parameters())
    for name, snapped in snapshot.items():
        if name not in current:
            return False
        if not torch.equal(snapped, current[name].detach()):
            return False
    return True
