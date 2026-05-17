"""autograd-hand-vs-machine — derive a gradient on paper, then watch
PyTorch's autograd compute the same number.

f(x) = x**2 + 3*x

You will compute f'(x) BY HAND (use the power rule), implement it as
`manual_derivative`, and then have autograd reproduce it via
`.backward()` on a `requires_grad=True` tensor.

The point: autograd is not magic. It records ops during forward and
walks the graph backward applying the chain rule.
"""

import torch


def manual_derivative(x: float) -> float:
    """Return f'(x) for f(x) = x**2 + 3*x, evaluated at `x`.

    Derive f'(x) by hand on paper using the power rule, then implement
    it here. (No tensors — just Python arithmetic.)
    """
    ...  # implement me


def autograd_derivative(x: float) -> float:
    """Use PyTorch autograd to compute f'(x) for f(x) = x**2 + 3*x.

    Steps:
      1. Build `t = torch.tensor(x, requires_grad=True)` (use a float).
      2. Compute `y = t ** 2 + 3 * t`.
      3. Call `y.backward()`.
      4. Return `float(t.grad)`.
    """
    ...  # implement me


def compare(x: float) -> tuple[float, float, float]:
    """Return (manual, autograd, abs(manual - autograd)).

    The test asserts the difference is essentially zero — i.e., autograd
    really does compute what you derived by hand.
    """
    ...  # implement me
