"""lr-warmup — Linear learning-rate warmup.

For the first `warmup_steps` of training, linearly interpolate the
learning rate from `initial_lr` up to `peak_lr`. After warmup, return
`peak_lr`.

Why: AdamW's adaptive learning rate depends on running estimates of the
gradient's first and second moments. At step 1 those estimates are
based on a single batch and are not yet reliable. A full-size step on
unreliable statistics can destabilize the model. Warmup gives the
moment estimates time to stabilize.
"""


def linear_warmup(
    step: int,
    warmup_steps: int,
    initial_lr: float,
    peak_lr: float,
) -> float:
    """Return the learning rate at `step` under linear warmup.

    Boundary conditions:
      - step == 0              -> initial_lr
      - step == warmup_steps   -> peak_lr
      - step >  warmup_steps   -> peak_lr  (clamped)
      - 0 < step < warmup_steps -> linear interpolation
    """
    ...  # implement me
