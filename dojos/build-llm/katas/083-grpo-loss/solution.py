"""grpo-loss — the clipped GRPO surrogate for one (action, advantage).

GRPO updates the policy with a clipped importance-ratio surrogate
borrowed from PPO. Given two policies (the one that produced the
rollout, `logits_old`, and the current policy `logits_new`):

    ratio   = exp( log pi_new(a) - log pi_old(a) )
    clipped = clamp(ratio, 1 - eps, 1 + eps)
    loss    = - min(ratio * A, clipped * A)

The minimum is the "pessimistic bound" trick from PPO: it caps the
upside when the new policy strays from the sampling distribution,
which prevents exploding updates.

Two things MUST be detached:
- the advantage (it's an environment signal, not a parameter)
- the old log-prob (it's a snapshot of the rollout-time policy)
"""

import torch


def grpo_loss(
    logits_old: torch.Tensor,
    logits_new: torch.Tensor,
    action: int,
    advantage: torch.Tensor,
    clip_eps: float,
) -> torch.Tensor:
    """Clipped GRPO surrogate loss for one (action, advantage) sample.

    Args:
        logits_old: 1D logits from the policy used to sample `action`.
        logits_new: 1D logits from the current policy being updated.
        action: int index of the sampled action.
        advantage: scalar tensor; treated as a fixed signal (detached).
        clip_eps: clip threshold, e.g. 0.2.

    Returns:
        Scalar loss tensor whose gradient flows only into `logits_new`.
    """
    ...  # implement me
