"""broadcasting — predict and use the broadcasting rule.

Broadcasting is "stretch a smaller tensor over a larger one without
copying memory". The rule is mechanical: align shapes from the right;
dims must be equal, one must be 1, or one must be missing. Predict the
result shape BEFORE writing the line.
"""

import torch


def broadcast_shape(
    a_shape: tuple[int, ...],
    b_shape: tuple[int, ...],
) -> tuple[int, ...]:
    """Return the broadcast result shape of two input shapes.

    Raise ValueError if the shapes are not broadcast-compatible.
    Do NOT create tensors — implement the rule directly.
    """
    ...  # implement me


def add_row_vector(matrix: torch.Tensor, row: torch.Tensor) -> torch.Tensor:
    """Add `row` of shape (C,) to every row of `matrix` of shape (R, C).

    Result shape: (R, C).
    """
    ...  # implement me


def add_col_vector(matrix: torch.Tensor, col: torch.Tensor) -> torch.Tensor:
    """Add `col` of shape (R,) to every column of `matrix` of shape (R, C).

    Result shape: (R, C). Hint: you need to reshape `col` first.
    """
    ...  # implement me


def outer_sum(a: torch.Tensor, b: torch.Tensor) -> torch.Tensor:
    """Given a of shape (M,) and b of shape (N,), return (M, N) where
    result[i, j] = a[i] + b[j].

    No loops. Use broadcasting.
    """
    ...  # implement me


def pairwise_diff(points: torch.Tensor) -> torch.Tensor:
    """Given points of shape (N, D), return (N, N, D) where
    result[i, j] = points[i] - points[j].

    The building block of distance matrices and (some flavors of)
    self-attention. No loops.
    """
    ...  # implement me
