"""cosine-decay — Reference implementation."""

import math


def cosine_decay(
    step: int,
    total_steps: int,
    peak_lr: float,
    min_lr: float,
) -> float:
    if step >= total_steps:
        return float(min_lr)
    progress = step / total_steps
    return float(min_lr + (peak_lr - min_lr) * 0.5 * (1 + math.cos(math.pi * progress)))
