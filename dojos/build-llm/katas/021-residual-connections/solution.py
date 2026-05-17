"""residual-connections — See the vanishing gradient problem and fix it.

Build a deep MLP (Linear → GELU stacked many times) with and without
residual ("skip") connections, then compare per-layer gradient
magnitudes after a backward pass. Without residuals, early-layer
gradients shrink by orders of magnitude. With residuals, they stay
comparable. This is why transformers can stack dozens of blocks.
"""

import torch
import torch.nn as nn


class DeepMLP(nn.Module):
    """Stack of (Linear + GELU) layers with optional skip connections.

    Args:
        layer_sizes: list of ints; defines N=len(layer_sizes)-1 layers.
            Layer i maps from layer_sizes[i] → layer_sizes[i+1].
        use_shortcut: if True, add x to layer_output when shapes match.
    """

    def __init__(self, layer_sizes: list[int], use_shortcut: bool):
        super().__init__()
        ...  # implement me — use nn.ModuleList

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        ...  # implement me


def gradient_norms(model: nn.Module, x: torch.Tensor, target: torch.Tensor) -> list[float]:
    """Forward pass, MSE loss against `target`, backward, then return
    `param.grad.abs().mean().item()` for every weight parameter (skip
    biases), in the order they appear in `named_parameters()`.
    """
    ...  # implement me
