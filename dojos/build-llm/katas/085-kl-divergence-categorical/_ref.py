"""Reference solution for kl-divergence-categorical."""

import torch
import torch.nn.functional as F


def kl_div(logits_p: torch.Tensor, logits_q: torch.Tensor) -> torch.Tensor:
    log_p = F.log_softmax(logits_p, dim=-1)
    log_q = F.log_softmax(logits_q, dim=-1)
    p = log_p.exp()
    kl_per_row = (p * (log_p - log_q)).sum(dim=-1)
    return kl_per_row.mean()
