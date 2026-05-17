"""kl-penalized-grpo

Add a KL penalty term to the GRPO policy-gradient loss. This is the
"complete" GRPO loss from Raschka build-reasoning §7.5, where you keep
a frozen reference copy of the original model and penalize the current
policy for drifting away from it.

    loss = grpo_loss + beta * kl(new_logps, ref_logps)

`beta=0` recovers vanilla GRPO. Large `beta` pins the policy near the
reference and may stall learning.
"""

import torch


def grpo_loss(new_logps: torch.Tensor, rewards: torch.Tensor) -> torch.Tensor:
    """Plain GRPO policy-gradient loss with group-normalized advantages.

    Args:
        new_logps: shape (G,) — summed sequence logprobs under the current policy.
        rewards: shape (G,) — scalar reward per rollout in the group.

    Returns:
        Scalar tensor: `-(advantages.detach() * new_logps).mean()`,
        where `advantages = (rewards - rewards.mean()) / (rewards.std() + 1e-4)`.
    """
    ...  # implement me


def kl_penalty(new_logps: torch.Tensor, ref_logps: torch.Tensor) -> torch.Tensor:
    """Simple per-sequence KL approximation used in Raschka §7.5.

    Args:
        new_logps: shape (G,) — summed sequence logprobs under current policy.
        ref_logps: shape (G,) — summed sequence logprobs under frozen reference.

    Returns:
        Scalar tensor: `mean(new_logps - ref_logps)`.
        (This is the cheap MC estimate used throughout Raschka ch07;
        it is the expected log-ratio under the new policy. Detach
        `ref_logps` before passing in.)
    """
    ...  # implement me


def kl_penalized_grpo_loss(
    new_logps: torch.Tensor,
    ref_logps: torch.Tensor,
    rewards: torch.Tensor,
    beta: float,
) -> torch.Tensor:
    """Combined loss: `grpo_loss + beta * kl_penalty`.

    Args:
        new_logps: (G,) current-policy summed sequence logprobs.
        ref_logps: (G,) reference summed sequence logprobs (already detached).
        rewards: (G,) per-rollout scalar rewards.
        beta: KL coefficient. `beta=0` collapses to plain GRPO.

    Returns:
        Scalar loss.
    """
    ...  # implement me
