"""Reference implementation for cross-entropy-from-logits."""

import torch
import torch.nn.functional as F


def cross_entropy_from_logits(logits: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
    log_probs = F.log_softmax(logits, dim=-1)
    picked = log_probs.gather(dim=-1, index=targets.unsqueeze(-1)).squeeze(-1)
    return -picked.mean()


def cross_entropy_3d(logits: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
    B, T, V = logits.shape
    return cross_entropy_from_logits(logits.reshape(B * T, V), targets.reshape(B * T))
