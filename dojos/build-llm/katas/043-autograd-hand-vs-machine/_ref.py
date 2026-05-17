"""Reference solution for autograd-hand-vs-machine."""

import torch


def manual_derivative(x):
    return 2.0 * x + 3.0


def autograd_derivative(x):
    t = torch.tensor(float(x), requires_grad=True)
    y = t ** 2 + 3 * t
    y.backward()
    return float(t.grad)


def compare(x):
    m = manual_derivative(x)
    a = autograd_derivative(x)
    return (m, a, abs(m - a))
