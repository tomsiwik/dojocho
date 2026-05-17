"""Reference solution for nn-module-subclass."""

import torch
import torch.nn as nn


def build_sequential():
    return nn.Sequential(
        nn.Linear(4, 8),
        nn.ReLU(),
        nn.Linear(8, 2),
    )


class MLPModule(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(4, 8)
        self.fc2 = nn.Linear(8, 2)

    def forward(self, x):
        h = torch.relu(self.fc1(x))
        return self.fc2(h)


def mlp_functional(x, W1, b1, W2, b2):
    h = torch.relu(x @ W1.T + b1)
    return h @ W2.T + b2


def copy_weights_into(module, sequential):
    with torch.no_grad():
        sequential[0].weight.copy_(module.fc1.weight)
        sequential[0].bias.copy_(module.fc1.bias)
        sequential[2].weight.copy_(module.fc2.weight)
        sequential[2].bias.copy_(module.fc2.bias)
