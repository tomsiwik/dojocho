"""Last Token vs Pooling.

Three strategies for collapsing (B, T, d_model) -> (B, d_model):
- last-token pool: x[:, -1, :]
- mean pool (optionally with a 0/1 mask)
- attention pool: learned query vector, softmax-weighted sum
"""

import torch
import torch.nn as nn


def last_token_pool(x: torch.Tensor) -> torch.Tensor:
    """Return the representation of the last time step.

    Input:  (B, T, d_model)
    Output: (B, d_model)
    """
    ...  # implement me


def mean_pool(x: torch.Tensor, mask: torch.Tensor | None = None) -> torch.Tensor:
    """Average over the time axis.

    If `mask` is None, plain mean over T.
    If `mask` is (B, T) of 0/1, average only the masked-in positions.

    Input:  x: (B, T, d_model), mask: (B, T) or None
    Output: (B, d_model)
    """
    ...  # implement me


class AttentionPool(nn.Module):
    """Learned-query attention pooling.

    scores  = x @ self.query        # (B, T)
    weights = softmax(scores, -1)   # (B, T)
    out     = sum_t weights[t] * x[t]   # (B, d_model)
    """

    def __init__(self, d_model: int):
        super().__init__()
        ...  # implement me — register self.query as nn.Parameter

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        ...  # implement me
