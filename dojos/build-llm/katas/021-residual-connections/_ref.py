"""Reference solution for residual-connections."""

import torch
import torch.nn as nn


class DeepMLP(nn.Module):
    def __init__(self, layer_sizes: list[int], use_shortcut: bool):
        super().__init__()
        self.use_shortcut = use_shortcut
        self.layers = nn.ModuleList([
            nn.Sequential(
                nn.Linear(layer_sizes[i], layer_sizes[i + 1]),
                nn.GELU(approximate="tanh"),
            )
            for i in range(len(layer_sizes) - 1)
        ])

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        for layer in self.layers:
            layer_out = layer(x)
            if self.use_shortcut and x.shape == layer_out.shape:
                x = x + layer_out
            else:
                x = layer_out
        return x


def gradient_norms(model, x, target):
    model.zero_grad()
    out = model(x)
    loss = nn.MSELoss()(out, target)
    loss.backward()
    norms = []
    for name, param in model.named_parameters():
        if "weight" in name and param.grad is not None:
            norms.append(param.grad.abs().mean().item())
    return norms
