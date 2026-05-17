"""advantage-normalization — three ways to convert rewards to advantages.

REINFORCE multiplies log-prob gradients by `R`. If `R` is always
non-negative, every gradient pushes UP. To get a two-sided signal,
we subtract a *baseline*. The simplest baseline is the mean reward
across a group of rollouts.

This kata implements three modes so you can feel the difference:
- "raw":                 R                            (no baseline)
- "mean_centered":       R - mean(R)                  (push up if above avg)
- "mean_std_normalized": (R - mean(R)) / (std(R)+eps) (scale-invariant)

The third mode is exactly the formula used inside GRPO (chapter 6,
section 6.7). The next kata applies it per *prompt group* rather
than across the whole batch.
"""

import torch


def compute_advantages(rewards: torch.Tensor, mode: str) -> torch.Tensor:
    """Return an advantage tensor from rewards.

    Args:
        rewards: 1D float tensor of rewards.
        mode: "raw" | "mean_centered" | "mean_std_normalized".

    Returns:
        Tensor of the same shape as `rewards`.

    Raises:
        ValueError if `mode` is not one of the three above.
    """
    ...  # implement me
