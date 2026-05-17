"""Reference solution for group-relative-advantage."""

import torch


def group_relative_advantage(
    rewards: list[float], group_size: int
) -> list[float]:
    out: list[float] = []
    for i in range(0, len(rewards), group_size):
        group = torch.tensor(rewards[i : i + group_size])
        adv = (group - group.mean()) / (group.std(unbiased=False) + 1e-8)
        out.extend(float(a) for a in adv)
    return out
