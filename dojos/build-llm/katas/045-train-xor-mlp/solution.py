"""train-xor-mlp — train a tiny MLP to learn XOR.

XOR is unlearnable by a single linear layer (proven in 1969). A
two-layer network with a nonlinearity solves it in seconds. You will
write the canonical four-line training loop and watch it work.
"""

import torch
import torch.nn as nn


def build_xor_data() -> tuple[torch.Tensor, torch.Tensor]:
    """Return (X, y) for XOR.

    X: shape (4, 2), float32, the four binary inputs.
    y: shape (4,), float32, the XOR targets [0, 1, 1, 0].
    """
    ...  # implement me


def build_xor_mlp() -> nn.Sequential:
    """Return an nn.Sequential implementing:
        Linear(2 -> 8) -> Tanh -> Linear(8 -> 1)
    """
    ...  # implement me


def train(
    model: nn.Module,
    X: torch.Tensor,
    y: torch.Tensor,
    steps: int = 1000,
    lr: float = 0.1,
) -> float:
    """Train `model` to fit (X, y) using MSE loss and SGD.

    Return the final loss as a Python float.

    Each step:
      optimizer.zero_grad()
      logits = model(X)                        # shape (4, 1)
      loss = nn.MSELoss()(logits, y.unsqueeze(1))
      loss.backward()
      optimizer.step()
    """
    ...  # implement me


def predict(model: nn.Module, X: torch.Tensor) -> torch.Tensor:
    """Forward X through `model`, threshold at 0.5, return integer
    predictions of shape (N,).

    Wrap the forward in torch.no_grad() — we are not training here.
    """
    ...  # implement me
