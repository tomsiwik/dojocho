"""Reference solution for lora-train-vs-full."""

import math
from typing import Iterable, Optional

import torch
import torch.nn as nn


class LoRALinear(nn.Module):
    def __init__(self, linear: nn.Linear, rank: int, alpha: float):
        super().__init__()
        self.linear = linear
        self.linear.weight.requires_grad = False
        if self.linear.bias is not None:
            self.linear.bias.requires_grad = False
        self.rank = rank
        self.alpha = alpha
        self.scaling = alpha / rank
        self.A = nn.Parameter(torch.empty(linear.in_features, rank))
        nn.init.kaiming_uniform_(self.A, a=math.sqrt(5))
        self.B = nn.Parameter(torch.zeros(rank, linear.out_features))

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.linear(x) + self.scaling * (x @ self.A @ self.B)


def replace_linear_with_lora(
    model: nn.Module,
    rank: int = 8,
    alpha: float = 16,
    target_names: Optional[Iterable[str]] = None,
) -> nn.Module:
    targets = set(target_names) if target_names is not None else None
    to_replace = []
    for name, module in model.named_modules():
        if name == "":
            continue
        if isinstance(module, nn.Linear) and not isinstance(module, LoRALinear):
            attr = name.rsplit(".", 1)[-1]
            if targets is None or attr in targets:
                to_replace.append(name)
    for name in to_replace:
        parts = name.split(".")
        parent = model
        for p in parts[:-1]:
            parent = getattr(parent, p)
        child = getattr(parent, parts[-1])
        setattr(parent, parts[-1], LoRALinear(child, rank=rank, alpha=alpha))
    return model


def _build_model():
    return nn.Sequential(
        nn.Linear(1, 64), nn.ReLU(),
        nn.Linear(64, 64), nn.ReLU(),
        nn.Linear(64, 1),
    )


def _data():
    x = torch.linspace(-1, 1, 64).unsqueeze(1)
    y = 3 * x + 2
    return x, y


def _train(model, steps, lr):
    x, y = _data()
    trainable = [p for p in model.parameters() if p.requires_grad]
    opt = torch.optim.Adam(trainable, lr=lr)
    loss_fn = nn.MSELoss()
    for _ in range(steps):
        opt.zero_grad()
        loss = loss_fn(model(x), y)
        loss.backward()
        opt.step()
    return loss.item()


def train_full(steps: int = 400, lr: float = 0.05, seed: int = 0) -> dict:
    torch.manual_seed(seed)
    model = _build_model()
    final_loss = _train(model, steps, lr)
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    return {"final_loss": float(final_loss), "trainable_params": int(trainable)}


def train_lora(
    steps: int = 400,
    lr: float = 0.05,
    seed: int = 0,
    rank: int = 2,
    alpha: float = 4,
) -> dict:
    torch.manual_seed(seed)
    model = _build_model()
    replace_linear_with_lora(model, rank=rank, alpha=alpha)
    final_loss = _train(model, steps, lr)
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    return {"final_loss": float(final_loss), "trainable_params": int(trainable)}
