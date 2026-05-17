"""Reference solution for tensor-basics."""

import torch


def make_scalar(x):
    return torch.tensor(x)


def make_vector(values):
    return torch.tensor(values)


def make_matrix(rows):
    return torch.tensor(rows)


def make_3d(shape, fill):
    return torch.full(shape, float(fill))


def reshape_to(t, new_shape):
    return t.reshape(new_shape)


def view_to(t, new_shape):
    return t.view(new_shape)


def transpose_2d(t):
    return t.transpose(0, 1)
