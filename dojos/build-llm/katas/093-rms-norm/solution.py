"""rms-norm — Root Mean Square Layer Normalization.

Modern LLMs (Llama, Qwen3, Mistral) replaced LayerNorm with RMSNorm:
drop the mean-subtraction, drop the bias, keep only the RMS scaling
and a learned per-feature gain.

    y = x * rsqrt(mean(x**2) + eps) * weight

One reduction across the feature dim instead of two. Same training
stability in practice; less compute, fewer parameters.
"""

import torch
import torch.nn as nn


class RMSNorm(nn.Module):
    """Root mean square normalization over the last dim.

    Args:
        d_model: size of the normalized dim (the feature/embedding dim).
        eps: stabilizer added inside the rsqrt; default 1e-6.
    """

    def __init__(self, d_model: int, eps: float = 1e-6):
        super().__init__()
        ...  # implement me: set self.eps, self.weight (nn.Parameter of ones)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Normalize `x` by its RMS over the last dim, then scale."""
        ...  # implement me
