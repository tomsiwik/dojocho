"""lr-warmup — Reference implementation."""


def linear_warmup(
    step: int,
    warmup_steps: int,
    initial_lr: float,
    peak_lr: float,
) -> float:
    if step >= warmup_steps:
        return float(peak_lr)
    return float(initial_lr + (peak_lr - initial_lr) * (step / warmup_steps))
