"""tensor-basics — create, reshape, view, and transpose PyTorch tensors.

Every shape bug in the rest of this dojo traces back to a tensor whose
shape you did not predict before writing the line. Build the muscle now.
"""

import torch


def make_scalar(x: float) -> torch.Tensor:
    """Return a 0-D tensor (shape ()) holding `x`."""
    ...  # implement me


def make_vector(values: list[float]) -> torch.Tensor:
    """Return a 1-D tensor (shape (N,)) from a Python list."""
    ...  # implement me


def make_matrix(rows: list[list[float]]) -> torch.Tensor:
    """Return a 2-D tensor (shape (R, C)) from a list of lists."""
    ...  # implement me


def make_3d(shape: tuple[int, int, int], fill: float) -> torch.Tensor:
    """Return a 3-D tensor of the given shape, filled with `fill`."""
    ...  # implement me


def reshape_to(t: torch.Tensor, new_shape: tuple[int, ...]) -> torch.Tensor:
    """Return `t` reshaped to `new_shape`. Use .reshape (always works)."""
    ...  # implement me


def view_to(t: torch.Tensor, new_shape: tuple[int, ...]) -> torch.Tensor:
    """Return `t` reinterpreted with `new_shape`. Use .view (requires
    contiguous memory — raises otherwise).
    """
    ...  # implement me


def transpose_2d(t: torch.Tensor) -> torch.Tensor:
    """Swap the two axes of a 2-D tensor."""
    ...  # implement me
