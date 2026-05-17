"""Tests for group-quantization."""

import pytest
import torch


def test_quantize_returns_int8_and_scales_tensor(solution):
    x = torch.randn(128)
    q, scales = solution.quantize_group_int8(x, group_size=64)
    assert isinstance(q, torch.Tensor)
    assert q.dtype == torch.int8
    assert q.shape == x.shape
    assert isinstance(scales, torch.Tensor)
    assert scales.shape == torch.Size([2])  # 128 / 64


def test_scales_shape_for_various_group_sizes(solution):
    x = torch.randn(100)
    q, scales = solution.quantize_group_int8(x, group_size=10)
    assert scales.shape == torch.Size([10])


def test_quantize_values_in_int8_symmetric_range(solution):
    x = torch.randn(100) * 5
    q, _ = solution.quantize_group_int8(x, group_size=10)
    assert int(q.min()) >= -127
    assert int(q.max()) <= 127


def test_roundtrip_uniform_tensor_near_exact(solution):
    x = torch.full((100,), 0.5)
    q, scales = solution.quantize_group_int8(x, group_size=10)
    x_hat = solution.dequantize_group_int8(q, scales, group_size=10)
    err = (x - x_hat).abs().max().item()
    assert err < 1e-6


def test_roundtrip_all_zeros_no_division_error(solution):
    x = torch.zeros(100)
    q, scales = solution.quantize_group_int8(x, group_size=10)
    assert int(q.abs().max()) == 0
    x_hat = solution.dequantize_group_int8(q, scales, group_size=10)
    assert torch.all(x_hat == 0)


def test_group_beats_per_tensor_on_varying_magnitudes(solution):
    """Build a tensor where most values are tiny but one chunk is huge.

    Per-tensor quant has to cover the huge values, so the tiny ones get
    crushed. Group quant gives the tiny chunks their own (small) scale.

    We compare TOTAL squared error: the small chunks dominate the count,
    and group quant recovers their precision while per-tensor cannot.
    """
    torch.manual_seed(0)
    group_size = 10
    n_groups = 10
    x = torch.randn(n_groups * group_size) * 0.01  # tiny everywhere
    x[group_size : 2 * group_size] = torch.randn(group_size) * 100  # one huge chunk

    # --- per-tensor reference (inline) ---
    max_abs = float(x.abs().max())
    scale_pt = max_abs / 127.0
    q_pt = torch.round(x / scale_pt).clamp(-127, 127).to(torch.int8)
    x_hat_pt = q_pt.to(torch.float32) * scale_pt
    sse_per_tensor = ((x - x_hat_pt) ** 2).sum().item()

    # --- group quant ---
    q_g, scales_g = solution.quantize_group_int8(x, group_size=group_size)
    x_hat_g = solution.dequantize_group_int8(q_g, scales_g, group_size=group_size)
    sse_group = ((x - x_hat_g) ** 2).sum().item()

    # Group quant should massively reduce total error (it should be
    # several orders of magnitude smaller for this kind of input).
    assert sse_group < sse_per_tensor, (
        f"group={sse_group}, per_tensor={sse_per_tensor}"
    )


def test_each_group_uses_its_own_scale(solution):
    """A tensor with two very different chunks must get two distinct scales."""
    x = torch.cat([torch.full((10,), 0.01), torch.full((10,), 10.0)])
    _, scales = solution.quantize_group_int8(x, group_size=10)
    assert scales.shape == torch.Size([2])
    # The scales should differ by orders of magnitude.
    assert float(scales[1]) > 10 * float(scales[0])


def test_dequantize_returns_float_tensor(solution):
    x = torch.randn(100)
    q, scales = solution.quantize_group_int8(x, group_size=10)
    x_hat = solution.dequantize_group_int8(q, scales, group_size=10)
    assert x_hat.dtype in (torch.float32, torch.float64)
    assert x_hat.shape == x.shape


@pytest.mark.parametrize("seed", [0, 1, 2])
def test_roundtrip_random_within_bound(solution, seed):
    """Per-group max error must be <= max(|x_group|) / 127 in every group."""
    torch.manual_seed(seed)
    group_size = 20
    n_groups = 5
    x = torch.randn(n_groups * group_size)
    q, scales = solution.quantize_group_int8(x, group_size=group_size)
    x_hat = solution.dequantize_group_int8(q, scales, group_size=group_size)

    err = (x - x_hat).reshape(n_groups, group_size).abs().amax(dim=1)
    max_abs_per_group = x.reshape(n_groups, group_size).abs().amax(dim=1)
    bound = max_abs_per_group / 127.0
    assert torch.all(err < bound + 1e-9)
