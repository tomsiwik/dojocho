"""gradient-clip-global-norm — Clip gradients by global L2 norm.

Given a list of gradient tensors and a `max_norm`, compute the L2 norm
of the *concatenated* gradient vector. If that global norm exceeds
`max_norm`, scale every tensor by the same factor so the new global
norm equals `max_norm`. Otherwise, leave the gradients alone.

Why global, not per-tensor:
  Scaling every tensor by the same scalar preserves the *direction* of
  the full gradient vector — only its magnitude is reduced. Per-tensor
  clipping would change the relative magnitudes across layers, which
  changes the descent direction itself. Direction is the gradient's
  whole job; per-tensor clipping breaks it.

See:
  - Raschka Appendix D §D.3
  - torch.nn.utils.clip_grad_norm_ in PyTorch source
"""

import torch


def global_grad_norm(grads: list[torch.Tensor]) -> torch.Tensor:
    """Return the L2 norm of the concatenated gradient vector.

    Returns a 0-dim float tensor.
    """
    ...  # implement me


def clip_grads_by_global_norm(
    grads: list[torch.Tensor], max_norm: float
) -> torch.Tensor:
    """Clip gradients in place by global L2 norm.

    If the global L2 norm of `grads` exceeds `max_norm`, scale every
    tensor by `max_norm / (global_norm + 1e-6)` in place. Otherwise,
    do nothing.

    Returns the *pre-clip* global norm (the value clients log).
    """
    ...  # implement me
