"""cosine-decay — Half-cosine learning-rate decay.

Starting at `peak_lr`, smoothly decay to `min_lr` over `total_steps`
steps following the shape of the first half of a cosine wave
(`cos(0) = 1` at the start, `cos(pi) = -1` at the end).

This is the standard decay schedule for LLM pretraining — used by
GPT-3, LLaMA, Chinchilla, and friends. It spends roughly the first
25% of training near peak, the last 25% near min, and transitions
smoothly through the middle.
"""

import math  # noqa: F401  -- you'll likely want math.cos and math.pi


def cosine_decay(
    step: int,
    total_steps: int,
    peak_lr: float,
    min_lr: float,
) -> float:
    """Return the learning rate at `step` under half-cosine decay.

    Boundary conditions:
      - step == 0              -> peak_lr
      - step == total_steps    -> min_lr
      - step == total_steps/2  -> (peak_lr + min_lr) / 2
      - step >  total_steps    -> min_lr  (clamped)
    """
    ...  # implement me
