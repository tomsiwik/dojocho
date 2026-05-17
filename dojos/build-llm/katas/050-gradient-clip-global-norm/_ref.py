"""gradient-clip-global-norm — Reference implementation."""

import torch


def global_grad_norm(grads: list[torch.Tensor]) -> torch.Tensor:
    sq_sum = torch.zeros(())
    for g in grads:
        sq_sum = sq_sum + g.detach().pow(2).sum()
    return sq_sum.sqrt()


def clip_grads_by_global_norm(
    grads: list[torch.Tensor], max_norm: float
) -> torch.Tensor:
    total_norm = global_grad_norm(grads)
    clip_coef = max_norm / (total_norm + 1e-6)
    if total_norm.item() > max_norm:
        for g in grads:
            g.mul_(clip_coef)
    return total_norm
