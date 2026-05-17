"""Reference implementation for perplexity."""

import torch
import torch.nn.functional as F


def perplexity_from_loss(cross_entropy_loss: torch.Tensor) -> torch.Tensor:
    return torch.exp(cross_entropy_loss)


def perplexity_from_logits(logits: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
    return torch.exp(F.cross_entropy(logits, targets))
