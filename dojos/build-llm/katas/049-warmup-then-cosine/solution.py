"""warmup-then-cosine — Canonical LLM training schedule.

Linear warmup from `initial_lr` up to `peak_lr` over the first
`warmup_steps`, then half-cosine decay from `peak_lr` down to `min_lr`
over the remaining `total_steps - warmup_steps` steps.

This is the schedule used in essentially every modern LLM pretraining
run. Raschka Appendix D §D.4 wraps the same logic in the final
`train_model` function; here you're isolating the schedule from the
training loop so the bookkeeping is crisp.
"""

import math  # noqa: F401


def warmup_then_cosine(
    step: int,
    total_steps: int,
    warmup_steps: int,
    initial_lr: float,
    peak_lr: float,
    min_lr: float,
) -> float:
    """Return the learning rate at `step`.

    Phases:
      - 0 <= step < warmup_steps        -> linear warmup
      - step == warmup_steps            -> peak_lr (boundary)
      - warmup_steps < step <= total_steps -> half-cosine decay over
        (total_steps - warmup_steps) horizon
      - step > total_steps              -> min_lr (clamped)
    """
    ...  # implement me
