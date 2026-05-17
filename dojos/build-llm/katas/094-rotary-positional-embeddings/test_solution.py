"""Tests for rotary-positional-embeddings."""

import torch


def test_precompute_shapes(solution):
    cos, sin = solution.precompute_rope_freqs(seq_len=16, head_dim=8)
    assert cos.shape == (16, 8)
    assert sin.shape == (16, 8)


def test_precompute_first_position_is_identity(solution):
    """At position 0, all angles are 0 → cos=1, sin=0."""
    cos, sin = solution.precompute_rope_freqs(seq_len=4, head_dim=8)
    torch.testing.assert_close(cos[0], torch.ones(8))
    torch.testing.assert_close(sin[0], torch.zeros(8))


def test_apply_rope_output_shape(solution):
    B, n_heads, T, head_dim = 2, 4, 8, 8
    q = torch.randn(B, n_heads, T, head_dim)
    k = torch.randn(B, n_heads, T, head_dim)
    cos, sin = solution.precompute_rope_freqs(seq_len=T, head_dim=head_dim)
    q_rot, k_rot = solution.apply_rope(q, k, cos, sin)
    assert q_rot.shape == q.shape
    assert k_rot.shape == k.shape


def test_apply_rope_preserves_norm(solution):
    """Rotations preserve vector norm: ||q_rot|| == ||q|| per token."""
    torch.manual_seed(0)
    B, n_heads, T, head_dim = 2, 2, 8, 16
    q = torch.randn(B, n_heads, T, head_dim)
    k = torch.randn(B, n_heads, T, head_dim)
    cos, sin = solution.precompute_rope_freqs(seq_len=T, head_dim=head_dim)
    q_rot, k_rot = solution.apply_rope(q, k, cos, sin)
    torch.testing.assert_close(
        q_rot.norm(dim=-1), q.norm(dim=-1), atol=1e-5, rtol=1e-5
    )
    torch.testing.assert_close(
        k_rot.norm(dim=-1), k.norm(dim=-1), atol=1e-5, rtol=1e-5
    )


def test_apply_rope_position_zero_is_identity(solution):
    """The token at position 0 should be unchanged by RoPE."""
    torch.manual_seed(0)
    B, n_heads, T, head_dim = 1, 1, 4, 8
    q = torch.randn(B, n_heads, T, head_dim)
    k = torch.randn(B, n_heads, T, head_dim)
    cos, sin = solution.precompute_rope_freqs(seq_len=T, head_dim=head_dim)
    q_rot, k_rot = solution.apply_rope(q, k, cos, sin)
    torch.testing.assert_close(q_rot[:, :, 0, :], q[:, :, 0, :], atol=1e-6, rtol=1e-5)
    torch.testing.assert_close(k_rot[:, :, 0, :], k[:, :, 0, :], atol=1e-6, rtol=1e-5)


def test_dot_product_depends_only_on_relative_position(solution):
    """The key property of RoPE: q_m · k_n depends only on (m - n), not
    on the absolute positions m, n.

    We construct identical Q and K vectors at all positions, then verify
    that <q_rot[m], k_rot[n]> equals <q_rot[m+s], k_rot[n+s]> for any
    shift s (as long as both stay in range).
    """
    torch.manual_seed(123)
    head_dim = 16
    seq_len = 32
    cos, sin = solution.precompute_rope_freqs(seq_len=seq_len, head_dim=head_dim)

    # Use the SAME q and k vector at every position so any difference in
    # the dot product is purely due to RoPE rotation.
    base_q = torch.randn(1, 1, 1, head_dim)
    base_k = torch.randn(1, 1, 1, head_dim)
    q = base_q.expand(1, 1, seq_len, head_dim).contiguous()
    k = base_k.expand(1, 1, seq_len, head_dim).contiguous()

    q_rot, k_rot = solution.apply_rope(q, k, cos, sin)

    # For a fixed relative offset r, <q_rot[m], k_rot[m-r]> should be
    # constant in m (for valid m).
    for r in [1, 3, 7]:
        ref = (q_rot[0, 0, r] * k_rot[0, 0, 0]).sum().item()
        for m in range(r, seq_len):
            val = (q_rot[0, 0, m] * k_rot[0, 0, m - r]).sum().item()
            assert abs(val - ref) < 1e-4, (
                f"relative offset {r}, position {m}: got {val}, expected {ref}"
            )


def test_dot_product_differs_for_different_offsets(solution):
    """Sanity: different relative offsets should give different dot
    products (otherwise RoPE is encoding nothing)."""
    torch.manual_seed(7)
    head_dim = 16
    seq_len = 16
    cos, sin = solution.precompute_rope_freqs(seq_len=seq_len, head_dim=head_dim)
    base_q = torch.randn(1, 1, 1, head_dim)
    base_k = torch.randn(1, 1, 1, head_dim)
    q = base_q.expand(1, 1, seq_len, head_dim).contiguous()
    k = base_k.expand(1, 1, seq_len, head_dim).contiguous()
    q_rot, k_rot = solution.apply_rope(q, k, cos, sin)
    dot_offset_1 = (q_rot[0, 0, 1] * k_rot[0, 0, 0]).sum().item()
    dot_offset_5 = (q_rot[0, 0, 5] * k_rot[0, 0, 0]).sum().item()
    assert abs(dot_offset_1 - dot_offset_5) > 1e-3
