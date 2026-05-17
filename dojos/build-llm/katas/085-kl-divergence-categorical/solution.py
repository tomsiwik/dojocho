"""kl-divergence-categorical

Compute the Kullback-Leibler divergence between two categorical
distributions defined by logits over the same support.

KL is the asymmetric distance every RLHF / GRPO penalty is built on. In
GRPO with a KL term, you measure how far the *current* policy has drifted
from a *reference* policy — and the asymmetry matters: KL(new || ref) is
the standard, not KL(ref || new).
"""

import torch


def kl_div(logits_p: torch.Tensor, logits_q: torch.Tensor) -> torch.Tensor:
    """KL(p || q) for two categorical distributions on the same support.

    Args:
        logits_p: shape (..., V) — unnormalized log-scores for distribution p.
        logits_q: shape (..., V) — unnormalized log-scores for distribution q.

    Returns:
        Scalar tensor: KL(p || q) = sum_i p_i * (log p_i - log q_i),
        summed over the last dim, then meaned over any leading dims.

    Constraint: do NOT call `F.kl_div`. Use `log_softmax` + `softmax`.
    """
    ...  # implement me
