"""Reference solution for kl-penalized-grpo."""

import torch


def grpo_loss(new_logps: torch.Tensor, rewards: torch.Tensor) -> torch.Tensor:
    advantages = (rewards - rewards.mean()) / (rewards.std() + 1e-4)
    return -(advantages.detach() * new_logps).mean()


def kl_penalty(new_logps: torch.Tensor, ref_logps: torch.Tensor) -> torch.Tensor:
    return (new_logps - ref_logps).mean()


def kl_penalized_grpo_loss(
    new_logps: torch.Tensor,
    ref_logps: torch.Tensor,
    rewards: torch.Tensor,
    beta: float,
) -> torch.Tensor:
    return grpo_loss(new_logps, rewards) + beta * kl_penalty(new_logps, ref_logps)
