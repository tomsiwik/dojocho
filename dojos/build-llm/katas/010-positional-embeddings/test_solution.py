"""Tests for positional-embeddings."""

import torch
import torch.nn as nn


def test_positional_embedding_shape(solution):
    pos = solution.make_positional_embedding(context_length=4, d_model=8)
    assert isinstance(pos, nn.Embedding)
    assert pos.weight.shape == (4, 8)


def test_position_ids_basic(solution):
    p = solution.position_ids(5)
    assert torch.equal(p, torch.arange(5))


def test_add_positional_preserves_shape(solution):
    token_emb = torch.zeros(2, 3, 8)  # (B=2, T=3, D=8)
    pos_layer = solution.make_positional_embedding(3, 8, seed=0)
    out = solution.add_positional(token_emb, pos_layer)
    assert out.shape == (2, 3, 8)


def test_add_positional_broadcasts_across_batch(solution):
    """The same positional vector at position t is added to every
    batch element at position t."""
    token_emb = torch.zeros(2, 3, 8)
    pos_layer = solution.make_positional_embedding(3, 8, seed=1)
    out = solution.add_positional(token_emb, pos_layer)
    # Both batches should be identical: zeros + pos_emb_t, same per t.
    assert torch.equal(out[0], out[1])
    # And out[0, t] should equal pos_layer.weight[t].
    for t in range(3):
        assert torch.allclose(out[0, t], pos_layer.weight[t])


def test_forward_pipeline_shape(solution):
    """(B=2, T=4) ids → (B, T, D=8) embeddings."""
    ids = torch.tensor([[0, 1, 2, 3], [4, 5, 6, 7]])
    out = solution.forward_input_pipeline(
        ids, vocab_size=10, d_model=8, context_length=4
    )
    assert out.shape == (2, 4, 8)


def test_position_blindness_demo(solution):
    """Bare embeddings are reorder-invariant; +pos breaks that."""
    without_pos, with_pos = solution.demonstrate_position_blindness(
        vocab_size=8, d_model=4, seed=0
    )
    assert without_pos is True, (
        "Without positional embeddings, the set of vectors for "
        "[1,2,3] and [3,2,1] must be the same (just reordered)."
    )
    assert with_pos is False, (
        "After adding positional embeddings, the two orderings should "
        "produce different vectors at corresponding positions."
    )


def test_same_token_different_positions_yields_different_vectors(solution):
    """Adding pos breaks the 'same id => same vector' invariant."""
    ids = torch.tensor([[3, 3, 3, 3]])  # same token 4 times
    out = solution.forward_input_pipeline(
        ids, vocab_size=8, d_model=4, context_length=4, seed=2
    )
    # Without positional, all four would be identical. With positional,
    # adjacent positions should differ.
    for t in range(3):
        assert not torch.allclose(out[0, t], out[0, t + 1])


def test_pos_embedding_is_learnable(solution):
    pos = solution.make_positional_embedding(4, 8)
    assert pos.weight.requires_grad is True


def test_pipeline_uses_context_length_for_pos(solution):
    """If context_length < T, the pipeline would error (out of range)."""
    import pytest
    ids = torch.tensor([[0, 1, 2, 3, 4]])  # T=5
    with pytest.raises((IndexError, RuntimeError)):
        solution.forward_input_pipeline(
            ids, vocab_size=10, d_model=8, context_length=4
        )
