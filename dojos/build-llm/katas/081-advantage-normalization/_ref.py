"""Reference solution for advantage-normalization."""

import torch


def compute_advantages(rewards: torch.Tensor, mode: str) -> torch.Tensor:
    if mode == "raw":
        return rewards.clone()
    if mode == "mean_centered":
        return rewards - rewards.mean()
    if mode == "mean_std_normalized":
        return (rewards - rewards.mean()) / (rewards.std(unbiased=False) + 1e-8)
    raise ValueError(f"unknown mode: {mode!r}")
