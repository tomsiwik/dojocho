"""Reference solution for Freeze, Unfreeze, Verify."""

import torch
import torch.nn as nn


def freeze_all(model: nn.Module) -> None:
    for p in model.parameters():
        p.requires_grad = False


def _matches(name: str, path: str) -> bool:
    return name == path or name.startswith(path + ".")


def unfreeze(model: nn.Module, names: list[str]) -> None:
    for pname, p in model.named_parameters():
        if any(_matches(pname, path) for path in names):
            p.requires_grad = True


def is_frozen(param: nn.Parameter) -> bool:
    return param.requires_grad is False


def trainable_param_names(model: nn.Module) -> list[str]:
    return sorted(n for n, p in model.named_parameters() if p.requires_grad)


def params_with_grad(model: nn.Module) -> list[str]:
    return sorted(n for n, p in model.named_parameters() if p.grad is not None)
