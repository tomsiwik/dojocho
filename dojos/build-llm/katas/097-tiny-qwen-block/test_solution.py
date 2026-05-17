"""Tests for tiny-qwen-block."""

import torch
import torch.nn as nn

# Tiny config matches the kata briefing.
D_MODEL = 32
N_Q_HEADS = 4
N_KV_HEADS = 2
D_FF = 64
MAX_SEQ_LEN = 8
B, T = 2, 8


def _make_block(solution):
    return solution.TinyQwenBlock(
        d_model=D_MODEL,
        n_q_heads=N_Q_HEADS,
        n_kv_heads=N_KV_HEADS,
        d_ff=D_FF,
        max_seq_len=MAX_SEQ_LEN,
    )


def test_block_is_module(solution):
    blk = _make_block(solution)
    assert isinstance(blk, nn.Module)


def test_block_forward_shape(solution):
    blk = _make_block(solution)
    x = torch.randn(B, T, D_MODEL)
    out = blk(x)
    assert out.shape == (B, T, D_MODEL)


def test_block_contains_all_four_pieces(solution):
    """The block must use RMSNorm (twice), GQAWithRoPE, and SwiGLU."""
    blk = _make_block(solution)
    submods = list(blk.modules())
    rms = [m for m in submods if type(m).__name__ == "RMSNorm"]
    gqa = [m for m in submods if type(m).__name__ == "GQAWithRoPE"]
    swiglu = [m for m in submods if type(m).__name__ == "SwiGLU"]
    assert len(rms) == 2, f"expected 2 RMSNorm, got {len(rms)}"
    assert len(gqa) == 1, f"expected 1 GQAWithRoPE, got {len(gqa)}"
    assert len(swiglu) == 1, f"expected 1 SwiGLU, got {len(swiglu)}"


def test_block_uses_residual_connections(solution):
    """If x is large compared to the sub-block outputs, the output should
    still be close to x (the residual path dominates).

    We zero out all sub-block weights so attn(x)=0 and ffn(x)=0, and
    check the block is the identity (proving residual paths exist)."""
    blk = _make_block(solution)
    blk.eval()
    # Zero every nn.Linear weight inside the block.
    with torch.no_grad():
        for m in blk.modules():
            if isinstance(m, nn.Linear):
                m.weight.zero_()
                if m.bias is not None:
                    m.bias.zero_()
    x = torch.randn(B, T, D_MODEL)
    out = blk(x)
    # With all linears zeroed, attn and ffn output zeros, so y = x + 0 + 0 = x.
    torch.testing.assert_close(out, x, atol=1e-5, rtol=1e-4)


def test_block_is_causal(solution):
    """Perturbing the last token must not affect outputs at earlier positions."""
    torch.manual_seed(0)
    blk = _make_block(solution)
    blk.eval()
    x = torch.randn(B, T, D_MODEL)
    out_a = blk(x)
    x_p = x.clone()
    x_p[:, -1, :] += 100.0
    out_b = blk(x_p)
    torch.testing.assert_close(out_a[:, :-1], out_b[:, :-1], atol=1e-5, rtol=1e-4)


def test_block_training_step_lowers_loss(solution):
    """End-to-end differentiability + capacity check: one optimizer step
    on a random regression target should reduce the MSE loss."""
    torch.manual_seed(0)
    blk = _make_block(solution)
    blk.train()
    x = torch.randn(B, T, D_MODEL)
    target = torch.randn(B, T, D_MODEL)

    opt = torch.optim.Adam(blk.parameters(), lr=1e-2)
    loss_before = torch.nn.functional.mse_loss(blk(x), target).item()
    opt.zero_grad()
    loss = torch.nn.functional.mse_loss(blk(x), target)
    loss.backward()
    opt.step()
    loss_after = torch.nn.functional.mse_loss(blk(x), target).item()
    assert loss_after < loss_before, (
        f"loss did not decrease after one step: {loss_before:.4f} -> {loss_after:.4f}"
    )


def test_block_all_parameters_receive_gradients(solution):
    """Every parameter (in both sub-blocks and both norms) must train."""
    blk = _make_block(solution)
    x = torch.randn(B, T, D_MODEL)
    blk(x).sum().backward()
    missing = [n for n, p in blk.named_parameters() if p.grad is None]
    assert not missing, f"parameters with no grad: {missing}"
