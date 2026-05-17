"""Tests for nn-module-subclass."""

import torch
import torch.nn as nn


def test_sequential_layer_types(solution):
    seq = solution.build_sequential()
    assert isinstance(seq, nn.Sequential)
    assert isinstance(seq[0], nn.Linear)
    assert isinstance(seq[1], nn.ReLU)
    assert isinstance(seq[2], nn.Linear)
    assert seq[0].in_features == 4 and seq[0].out_features == 8
    assert seq[2].in_features == 8 and seq[2].out_features == 2


def test_module_is_nn_module(solution):
    m = solution.MLPModule()
    assert isinstance(m, nn.Module)
    # Output shape sanity check.
    x = torch.randn(3, 4)
    y = m(x)
    assert y.shape == torch.Size([3, 2])


def test_module_has_parameters(solution):
    m = solution.MLPModule()
    params = list(m.parameters())
    # Two Linear layers => 4 parameter tensors (W1, b1, W2, b2).
    assert len(params) == 4


def test_functional_output_shape(solution):
    torch.manual_seed(0)
    x = torch.randn(5, 4)
    W1 = torch.randn(8, 4)
    b1 = torch.randn(8)
    W2 = torch.randn(2, 8)
    b2 = torch.randn(2)
    y = solution.mlp_functional(x, W1, b1, W2, b2)
    assert y.shape == torch.Size([5, 2])


def test_functional_matches_nn_linear(solution):
    """The functional form must implement out = x @ W.T + b correctly."""
    torch.manual_seed(0)
    x = torch.randn(3, 4)
    fc1 = nn.Linear(4, 8)
    fc2 = nn.Linear(8, 2)
    expected = fc2(torch.relu(fc1(x)))
    got = solution.mlp_functional(
        x, fc1.weight, fc1.bias, fc2.weight, fc2.bias
    )
    assert torch.allclose(got, expected, atol=1e-6)


def test_all_three_forms_equivalent(solution):
    """After copying module weights into the sequential, and pulling
    the same weights into the functional call, all three produce the
    same output."""
    torch.manual_seed(42)
    module = solution.MLPModule()
    seq = solution.build_sequential()
    solution.copy_weights_into(module, seq)

    x = torch.randn(7, 4)
    out_module = module(x)
    out_seq = seq(x)
    # Extract weights from the module for the functional call.
    W1 = module.fc1.weight
    b1 = module.fc1.bias
    W2 = module.fc2.weight
    b2 = module.fc2.bias
    out_func = solution.mlp_functional(x, W1, b1, W2, b2)

    assert torch.allclose(out_module, out_seq, atol=1e-6)
    assert torch.allclose(out_module, out_func, atol=1e-6)
