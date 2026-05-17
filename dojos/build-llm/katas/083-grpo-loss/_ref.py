"""Reference solution for grpo-loss."""

import torch


def grpo_loss(
    logits_old: torch.Tensor,
    logits_new: torch.Tensor,
    action: int,
    advantage: torch.Tensor,
    clip_eps: float,
) -> torch.Tensor:
    log_pi_old = torch.log_softmax(logits_old, dim=-1)[action].detach()
    log_pi_new = torch.log_softmax(logits_new, dim=-1)[action]
    ratio = torch.exp(log_pi_new - log_pi_old)
    clipped = torch.clamp(ratio, 1.0 - clip_eps, 1.0 + clip_eps)
    A = advantage.detach()
    return -torch.min(ratio * A, clipped * A)
