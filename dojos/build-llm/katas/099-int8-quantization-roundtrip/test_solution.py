"""Tests for int8-quantization-roundtrip."""

import pytest
import torch


def test_quantize_returns_int8_tensor(solution):
    x = torch.randn(100)
    q, scale = solution.quantize_int8(x)
    assert isinstance(q, torch.Tensor)
    assert q.dtype == torch.int8
    assert q.shape == x.shape


def test_quantize_returns_python_float_scale(solution):
    x = torch.randn(100)
    _, scale = solution.quantize_int8(x)
    assert isinstance(scale, float)


def test_quantize_values_in_int8_symmetric_range(solution):
    x = torch.randn(100) * 10  # big values
    q, _ = solution.quantize_int8(x)
    assert int(q.min()) >= -127
    assert int(q.max()) <= 127


def test_dequantize_returns_float_tensor(solution):
    x = torch.randn(100)
    q, scale = solution.quantize_int8(x)
    x_hat = solution.dequantize_int8(q, scale)
    assert x_hat.dtype in (torch.float32, torch.float64)
    assert x_hat.shape == x.shape


def test_roundtrip_max_error_within_bound(solution):
    """Per-tensor symmetric int8: max abs error must be <= max(|x|) / 127."""
    torch.manual_seed(0)
    x = torch.randn(100)
    max_abs = float(x.abs().max())
    q, scale = solution.quantize_int8(x)
    x_hat = solution.dequantize_int8(q, scale)
    err = (x - x_hat).abs().max().item()
    assert err < max_abs / 127, f"err={err}, bound={max_abs / 127}"


def test_roundtrip_on_uniform_tensor(solution):
    """A constant tensor should round-trip almost exactly."""
    x = torch.full((100,), 0.5)
    q, scale = solution.quantize_int8(x)
    x_hat = solution.dequantize_int8(q, scale)
    err = (x - x_hat).abs().max().item()
    assert err < 1e-6


def test_all_zeros_does_not_divide_by_zero(solution):
    x = torch.zeros(100)
    q, scale = solution.quantize_int8(x)
    assert scale == 0.0
    assert int(q.abs().max()) == 0
    x_hat = solution.dequantize_int8(q, scale)
    assert torch.all(x_hat == 0)


def test_max_abs_element_maps_to_127(solution):
    """The element with the largest |value| should saturate near +/-127."""
    x = torch.tensor([0.1, -0.05, 1.0, 0.3, -0.7])
    q, _ = solution.quantize_int8(x)
    # x[2] = 1.0 is max abs -> q[2] should be 127.
    assert int(q[2]) == 127


def test_scale_is_positive_for_nonzero_input(solution):
    x = torch.tensor([0.1, -0.2, 0.05])
    _, scale = solution.quantize_int8(x)
    assert scale > 0


@pytest.mark.parametrize("seed", [0, 1, 2, 3])
def test_roundtrip_random_seeds(solution, seed):
    torch.manual_seed(seed)
    x = torch.randn(100) * (seed + 1)
    max_abs = float(x.abs().max())
    q, scale = solution.quantize_int8(x)
    x_hat = solution.dequantize_int8(q, scale)
    err = (x - x_hat).abs().max().item()
    assert err < max_abs / 127
