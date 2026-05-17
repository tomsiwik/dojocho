"""Tests for embeddings-and-lookup."""

import torch
import torch.nn as nn


def test_make_embedding_shape(solution):
    emb = solution.make_embedding(8, 4)
    assert isinstance(emb, nn.Embedding)
    assert emb.weight.shape == (8, 4)


def test_make_embedding_reproducible(solution):
    a = solution.make_embedding(8, 4, seed=42)
    b = solution.make_embedding(8, 4, seed=42)
    assert torch.equal(a.weight, b.weight)


def test_embed_batch_output_shape(solution):
    ids = torch.tensor([[0, 1, 2], [3, 4, 5]])  # (B=2, T=3)
    out = solution.embed_batch(ids, vocab_size=8, d_model=4)
    assert out.shape == (2, 3, 4)


def test_embed_lookup_pulls_correct_row(solution):
    """embedding(torch.tensor([3])) == embedding.weight[3]."""
    emb = solution.make_embedding(8, 4, seed=7)
    ids = torch.tensor([3])
    out = solution.embed_via_lookup(ids, emb)
    assert torch.equal(out[0], emb.weight[3])


def test_embed_lookup_batch_shape(solution):
    emb = solution.make_embedding(8, 4, seed=1)
    ids = torch.tensor([[0, 1], [2, 3]])
    out = solution.embed_via_lookup(ids, emb)
    assert out.shape == (2, 2, 4)


def test_onehot_matmul_matches_lookup(solution):
    """THE WHOLE POINT: lookup and one-hot @ W produce identical results."""
    emb = solution.make_embedding(8, 4, seed=123)
    ids = torch.tensor([[0, 3, 7], [2, 5, 1]])
    via_lookup = solution.embed_via_lookup(ids, emb)
    via_matmul = solution.embed_via_onehot_matmul(ids, emb)
    assert via_matmul.shape == via_lookup.shape == (2, 3, 4)
    assert torch.allclose(via_matmul, via_lookup)


def test_onehot_matmul_correct_for_single_id(solution):
    """For one id, one-hot @ W is literally row k of W."""
    emb = solution.make_embedding(8, 4, seed=9)
    ids = torch.tensor([[5]])
    via_matmul = solution.embed_via_onehot_matmul(ids, emb)
    assert torch.allclose(via_matmul[0, 0], emb.weight[5])


def test_two_calls_with_same_id_give_same_vector(solution):
    """Position-independence: the same id always maps to the same vector."""
    emb = solution.make_embedding(8, 4, seed=2)
    ids_a = torch.tensor([[3, 0, 0]])
    ids_b = torch.tensor([[0, 0, 3]])
    out_a = solution.embed_via_lookup(ids_a, emb)
    out_b = solution.embed_via_lookup(ids_b, emb)
    # Position 0 in a and position 2 in b are both token 3.
    assert torch.equal(out_a[0, 0], out_b[0, 2])


def test_embedding_has_grad(solution):
    """Embeddings are learnable parameters."""
    emb = solution.make_embedding(8, 4)
    assert emb.weight.requires_grad is True
