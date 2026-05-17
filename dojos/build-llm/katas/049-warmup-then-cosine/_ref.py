"""warmup-then-cosine — Reference implementation."""

import math


def warmup_then_cosine(
    step: int,
    total_steps: int,
    warmup_steps: int,
    initial_lr: float,
    peak_lr: float,
    min_lr: float,
) -> float:
    if step < warmup_steps:
        return float(initial_lr + (peak_lr - initial_lr) * (step / warmup_steps))
    if step >= total_steps:
        return float(min_lr)
    progress = (step - warmup_steps) / (total_steps - warmup_steps)
    return float(min_lr + (peak_lr - min_lr) * 0.5 * (1 + math.cos(math.pi * progress)))
