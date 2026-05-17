"""Reference solution for broadcasting."""

import torch


def broadcast_shape(a_shape, b_shape):
    a = list(a_shape)
    b = list(b_shape)
    # Right-align by left-padding with 1s.
    n = max(len(a), len(b))
    a = [1] * (n - len(a)) + a
    b = [1] * (n - len(b)) + b
    out = []
    for da, db in zip(a, b):
        if da == db:
            out.append(da)
        elif da == 1:
            out.append(db)
        elif db == 1:
            out.append(da)
        else:
            raise ValueError(
                f"Shapes {tuple(a_shape)} and {tuple(b_shape)} not broadcastable"
            )
    return tuple(out)


def add_row_vector(matrix, row):
    return matrix + row


def add_col_vector(matrix, col):
    return matrix + col.unsqueeze(1)


def outer_sum(a, b):
    return a[:, None] + b[None, :]


def pairwise_diff(points):
    return points[:, None, :] - points[None, :, :]
