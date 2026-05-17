"""perplexity

Perplexity = exp(cross_entropy). The standard metric for reporting
language-modeling quality.

- Perplexity 1 = perfect prediction.
- Perplexity V (vocab size) = random guessing.
- Anything in between = "the model is as confused as if it had to
  pick uniformly from <this many> tokens."
"""

import torch


def perplexity_from_loss(cross_entropy_loss: torch.Tensor) -> torch.Tensor:
    """Convert a scalar CE loss into perplexity."""
    ...  # implement me


def perplexity_from_logits(logits: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
    """Compute perplexity directly from logits + targets.

    Args:
        logits: shape (N, V).
        targets: shape (N,).

    Returns:
        Scalar perplexity tensor.

    You may use `F.cross_entropy`.
    """
    ...  # implement me
