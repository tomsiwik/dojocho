"""cross-entropy-from-logits

Implement cross-entropy loss by hand from logits + integer targets,
using only `log_softmax` and `gather`. This is the loss every LLM
trains with — Raschka §5.1.2, condensed.
"""

import torch


def cross_entropy_from_logits(logits: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
    """Mean negative log-probability of the target class.

    Args:
        logits: shape (N, V) — raw scores over a vocab of size V.
        targets: shape (N,) — integer class IDs in [0, V).

    Returns:
        Scalar tensor. Must match `F.cross_entropy(logits, targets)`.

    Implementation constraint: use `F.log_softmax` + `gather` (or
    fancy indexing). Do NOT call `F.cross_entropy` or `F.nll_loss`.
    """
    ...  # implement me


def cross_entropy_3d(logits: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
    """Same as above but for LLM-shaped tensors.

    Args:
        logits: shape (B, T, V).
        targets: shape (B, T).

    Returns:
        Scalar tensor.

    Flatten to (B*T, V) / (B*T,), then delegate to `cross_entropy_from_logits`.
    """
    ...  # implement me
