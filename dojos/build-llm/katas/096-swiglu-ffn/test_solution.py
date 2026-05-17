"""Tests for swiglu-ffn."""

import torch
import torch.nn as nn
import torch.nn.functional as F


def test_swiglu_is_module(solution):
    ff = solution.SwiGLU(d_model=32, d_ff=64)
    assert isinstance(ff, nn.Module)


def test_swiglu_output_shape(solution):
    ff = solution.SwiGLU(d_model=32, d_ff=64)
    x = torch.randn(2, 8, 32)
    out = ff(x)
    assert out.shape == x.shape


def test_swiglu_has_three_linears(solution):
    """SwiGLU = 3 linear projections."""
    ff = solution.SwiGLU(d_model=32, d_ff=64)
    linears = [m for m in ff.modules() if isinstance(m, nn.Linear)]
    assert len(linears) == 3


def test_swiglu_no_bias(solution):
    """Modern LLM convention: no bias on FFN linears."""
    ff = solution.SwiGLU(d_model=32, d_ff=64)
    linears = [m for m in ff.modules() if isinstance(m, nn.Linear)]
    for lin in linears:
        assert lin.bias is None, "SwiGLU linears should use bias=False"


def test_swiglu_param_count(solution):
    """Exact: W_gate (d*ff) + W_up (d*ff) + W_down (ff*d) = 3*d*ff."""
    d, ff_dim = 32, 64
    ff = solution.SwiGLU(d_model=d, d_ff=ff_dim)
    expected = 3 * d * ff_dim
    assert sum(p.numel() for p in ff.parameters()) == expected


def test_swiglu_gating_is_element_wise(solution):
    """The middle product is element-wise: gate has the same shape as up.

    We replace the SiLU-gated tensor by hand and check the output matches
    `W_down( silu(gate(x)) * up(x) )`.
    """
    torch.manual_seed(0)
    d, ff_dim = 16, 32
    ff = solution.SwiGLU(d_model=d, d_ff=ff_dim)
    x = torch.randn(1, 4, d)

    linears = [m for m in ff.modules() if isinstance(m, nn.Linear)]
    # Two share the input dim (d), one shares the output dim (d).
    proj_in = [m for m in linears if m.in_features == d]
    proj_out = [m for m in linears if m.in_features == ff_dim]
    assert len(proj_in) == 2 and len(proj_out) == 1
    W_down = proj_out[0]

    # The two d→ff_dim linears are W_gate and W_up (interchangeable from
    # the test's POV — we just check that *some* assignment of one as the
    # gate and one as up reproduces the output).
    a, b = proj_in
    expected_ab = W_down(F.silu(a(x)) * b(x))
    expected_ba = W_down(F.silu(b(x)) * a(x))

    actual = ff(x)
    diff_ab = (actual - expected_ab).abs().max().item()
    diff_ba = (actual - expected_ba).abs().max().item()
    assert min(diff_ab, diff_ba) < 1e-5, (
        "Output doesn't match either assignment of silu(gate) * up; the "
        "gating may not be element-wise SiLU-then-multiply."
    )


def test_swiglu_applies_silu_not_just_multiply(solution):
    """Sanity: the gate IS non-linear. If we replaced SiLU with identity,
    the result would be a (small) bilinear form, which is NOT what we get."""
    torch.manual_seed(0)
    d, ff_dim = 16, 32
    ff = solution.SwiGLU(d_model=d, d_ff=ff_dim)
    x = torch.randn(1, 4, d)

    linears = [m for m in ff.modules() if isinstance(m, nn.Linear)]
    proj_in = [m for m in linears if m.in_features == d]
    proj_out = [m for m in linears if m.in_features == ff_dim]
    W_down = proj_out[0]
    a, b = proj_in

    # If no nonlinearity were applied, the output would be one of these:
    no_silu_ab = W_down(a(x) * b(x))
    no_silu_ba = W_down(b(x) * a(x))  # commutes; same value
    actual = ff(x)
    assert (actual - no_silu_ab).abs().max().item() > 1e-3
    assert (actual - no_silu_ba).abs().max().item() > 1e-3


def test_swiglu_grads_flow(solution):
    """All three linears must receive gradients."""
    ff = solution.SwiGLU(d_model=8, d_ff=16)
    x = torch.randn(2, 3, 8)
    ff(x).sum().backward()
    for p in ff.parameters():
        assert p.grad is not None
