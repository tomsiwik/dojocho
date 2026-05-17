"""Tests for weight-tying."""

import torch
import torch.nn as nn


TINY_CFG = {
    "vocab_size": 50,
    "context_length": 32,
    "emb_dim": 64,
    "n_heads": 4,
    "n_layers": 2,
    "drop_rate": 0.0,
}


def _make_model(solution):
    torch.manual_seed(0)
    return solution.GPTModel(TINY_CFG)


def test_tie_returns_model(solution):
    model = _make_model(solution)
    out = solution.tie_weights(model)
    # Idiomatic: return the (mutated) model.
    assert out is model


def test_tied_weights_same_object(solution):
    model = _make_model(solution)
    solution.tie_weights(model)
    assert model.out_head.weight is model.tok_emb.weight


def test_tied_weights_same_data_ptr(solution):
    """Same underlying storage — the hard test for true tying."""
    model = _make_model(solution)
    solution.tie_weights(model)
    assert model.out_head.weight.data_ptr() == model.tok_emb.weight.data_ptr()


def test_tying_reduces_param_count(solution):
    """After tying, parameter iteration deduplicates the shared tensor."""
    model = _make_model(solution)
    params_before = sum(p.numel() for p in model.parameters())
    solution.tie_weights(model)
    params_after = sum(p.numel() for p in set(model.parameters()))
    expected_savings = TINY_CFG["vocab_size"] * TINY_CFG["emb_dim"]
    assert params_before - params_after == expected_savings


def test_tied_weights_share_gradients(solution):
    """Backward through both should produce a single, shared gradient."""
    model = _make_model(solution)
    solution.tie_weights(model)
    idx = torch.randint(0, TINY_CFG["vocab_size"], (2, 8))
    logits = model(idx)
    logits.sum().backward()
    # Same tensor → same .grad object.
    assert model.tok_emb.weight.grad is model.out_head.weight.grad
    assert model.tok_emb.weight.grad is not None


def test_tied_weights_update_together(solution):
    """An optimizer step on the shared param updates both 'layers'."""
    model = _make_model(solution)
    solution.tie_weights(model)
    optim = torch.optim.SGD(model.parameters(), lr=0.1)
    idx = torch.randint(0, TINY_CFG["vocab_size"], (2, 4))
    loss = model(idx).sum()
    loss.backward()
    before = model.tok_emb.weight.detach().clone()
    optim.step()
    after_tok = model.tok_emb.weight.detach()
    after_head = model.out_head.weight.detach()
    # Both views moved by the same amount.
    torch.testing.assert_close(after_tok, after_head)
    # And they actually moved.
    assert not torch.allclose(before, after_tok)


def test_tied_model_forward_still_works(solution):
    """Tying must not break the forward pass shape contract."""
    model = _make_model(solution)
    solution.tie_weights(model)
    idx = torch.randint(0, TINY_CFG["vocab_size"], (2, 8))
    logits = model(idx)
    assert logits.shape == (2, 8, TINY_CFG["vocab_size"])
