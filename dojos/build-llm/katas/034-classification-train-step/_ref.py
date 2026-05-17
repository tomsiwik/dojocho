"""Reference solution for Classification Train Step."""

import torch
import torch.nn as nn
import torch.nn.functional as F


def last_token_logits(model: nn.Module, x: torch.Tensor) -> torch.Tensor:
    return model(x)[:, -1, :]


def compute_loss(logits: torch.Tensor, y: torch.Tensor) -> torch.Tensor:
    return F.cross_entropy(logits, y)


def train_step(model, optimizer, x, y) -> float:
    optimizer.zero_grad()
    logits = last_token_logits(model, x)
    loss = compute_loss(logits, y)
    loss_value = loss.item()
    loss.backward()
    optimizer.step()
    return loss_value


def loss_decreases(model, optimizer, x, y, n_steps: int = 5) -> bool:
    model.eval()
    with torch.no_grad():
        loss_before = compute_loss(last_token_logits(model, x), y).item()
    model.train()
    for _ in range(n_steps):
        train_step(model, optimizer, x, y)
    model.eval()
    with torch.no_grad():
        loss_after = compute_loss(last_token_logits(model, x), y).item()
    return loss_after < loss_before
