"""adaptive-kl-coefficient

Schulman-style adaptive controller for the KL penalty coefficient
(PPO paper §4 — https://arxiv.org/abs/1707.06347).

Picking a fixed `beta` is annoying: too high stalls learning, too low
lets the policy drift. The fix is a feedback controller: pick a
`target_kl` that you'd *like* the per-step KL to be, observe the
actual KL after each update, and bump `beta` up or down to drive
observed KL toward target.

Rule (Schulman):
  if observed_kl > 2 * target_kl  → beta *= (1 + lr)
  if observed_kl < 0.5 * target_kl → beta /= (1 + lr)
  else                              → beta unchanged
"""


def update_beta(beta: float, kl: float, target_kl: float, lr: float = 0.5) -> float:
    """Adjust KL coefficient based on observed vs target KL.

    Args:
        beta: current KL coefficient.
        kl: observed KL divergence on the latest batch.
        target_kl: desired KL per update.
        lr: how aggressively to adjust (default 0.5 from PPO paper).

    Returns:
        New beta (always > 0).
    """
    ...  # implement me
