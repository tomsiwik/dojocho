"""Reference solution for policy-gradient-reinforce."""

import torch


def pg_loss(logits: torch.Tensor, action: int, reward: float) -> torch.Tensor:
    log_probs = torch.log_softmax(logits, dim=-1)
    return -log_probs[action] * reward
