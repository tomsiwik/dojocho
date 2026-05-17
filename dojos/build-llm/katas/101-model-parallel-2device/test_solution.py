"""Tests for model-parallel-2device."""

from unittest.mock import MagicMock

import pytest
import torch
import torch.nn as nn


@pytest.fixture
def mlp():
    """A small reproducible 2-layer MLP."""
    torch.manual_seed(0)
    layer1 = nn.Linear(4, 8)
    layer2 = nn.Linear(8, 2)
    return layer1, layer2


def test_output_shape(solution, mlp):
    layer1, layer2 = mlp
    x = torch.randn(4)
    cb = MagicMock()
    y = solution.forward_split(x, layer1, layer2, cb)
    assert isinstance(y, torch.Tensor)
    assert y.shape == torch.Size([2])


def test_callback_called_exactly_once(solution, mlp):
    layer1, layer2 = mlp
    x = torch.randn(4)
    cb = MagicMock()
    solution.forward_split(x, layer1, layer2, cb)
    assert cb.call_count == 1


def test_callback_receives_intermediate_activation(solution, mlp):
    """The callback's argument must equal relu(layer1(x))."""
    layer1, layer2 = mlp
    x = torch.randn(4)
    expected_activation = torch.relu(layer1(x))

    captured = {}

    def cb(activation):
        captured["a"] = activation

    solution.forward_split(x, layer1, layer2, cb)
    assert "a" in captured
    assert torch.allclose(captured["a"], expected_activation)


def test_output_matches_reference_forward(solution, mlp):
    """End-to-end, the result must equal layer2(relu(layer1(x)))."""
    layer1, layer2 = mlp
    x = torch.randn(4)
    expected = layer2(torch.relu(layer1(x)))
    actual = solution.forward_split(x, layer1, layer2, lambda _a: None)
    assert torch.allclose(actual, expected)


def test_callback_argument_is_a_tensor(solution, mlp):
    layer1, layer2 = mlp
    x = torch.randn(4)
    received = []
    solution.forward_split(x, layer1, layer2, received.append)
    assert len(received) == 1
    assert isinstance(received[0], torch.Tensor)


def test_callback_is_not_called_with_input_or_output(solution, mlp):
    """Sanity: the transferred tensor must not be `x` or final `y`."""
    layer1, layer2 = mlp
    x = torch.randn(4)
    received = []
    solution.forward_split(x, layer1, layer2, received.append)
    activation = received[0]
    # Shape between layers is layer1.out_features == 8, not 4 (input)
    # and not 2 (output).
    assert activation.shape == torch.Size([8])


def test_works_with_different_layer_sizes(solution):
    """Generalize: any (in, hidden, out) shape should work."""
    torch.manual_seed(1)
    layer1 = nn.Linear(16, 32)
    layer2 = nn.Linear(32, 5)
    x = torch.randn(16)
    cb = MagicMock()
    y = solution.forward_split(x, layer1, layer2, cb)
    assert y.shape == torch.Size([5])
    assert cb.call_count == 1


def test_relu_is_applied_between_layers(solution):
    """Build a layer1 whose output is guaranteed negative, then verify
    the activation passed to the callback is all zeros (post-ReLU).
    """
    layer1 = nn.Linear(2, 3)
    # Force all-negative pre-activation: weights = 0, bias = -1.
    with torch.no_grad():
        layer1.weight.zero_()
        layer1.bias.fill_(-1.0)
    layer2 = nn.Linear(3, 1)

    x = torch.tensor([1.0, 2.0])
    received = []
    solution.forward_split(x, layer1, layer2, received.append)
    activation = received[0]
    # Post-ReLU of a negative tensor is all zeros.
    assert torch.all(activation == 0)
