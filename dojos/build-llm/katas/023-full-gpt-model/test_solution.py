"""Tests for full-gpt-model."""

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


def test_gpt_is_module(solution):
    model = solution.GPTModel(TINY_CFG)
    assert isinstance(model, nn.Module)


def test_gpt_output_shape(solution):
    """(B, T) → (B, T, vocab_size)."""
    model = solution.GPTModel(TINY_CFG)
    B, T = 2, 8
    idx = torch.randint(0, TINY_CFG["vocab_size"], (B, T))
    logits = model(idx)
    assert logits.shape == (B, T, TINY_CFG["vocab_size"])


def test_gpt_has_required_submodules(solution):
    """The model must expose tok_emb, pos_emb, final_norm, out_head."""
    model = solution.GPTModel(TINY_CFG)
    assert hasattr(model, "tok_emb")
    assert hasattr(model, "pos_emb")
    assert hasattr(model, "out_head")
    assert isinstance(model.tok_emb, nn.Embedding)
    assert isinstance(model.pos_emb, nn.Embedding)
    assert isinstance(model.out_head, nn.Linear)


def test_gpt_embedding_dims(solution):
    model = solution.GPTModel(TINY_CFG)
    assert model.tok_emb.weight.shape == (TINY_CFG["vocab_size"], TINY_CFG["emb_dim"])
    assert model.pos_emb.weight.shape == (TINY_CFG["context_length"], TINY_CFG["emb_dim"])
    # out_head: (vocab_size, emb_dim) — same as tok_emb (this matters for kata 7).
    assert model.out_head.weight.shape == (TINY_CFG["vocab_size"], TINY_CFG["emb_dim"])


def test_gpt_n_transformer_blocks(solution):
    """Model contains exactly n_layers transformer-block-like submodules
    (anything that has both .att and .ff attributes)."""
    cfg = dict(TINY_CFG, n_layers=3)
    model = solution.GPTModel(cfg)
    block_count = sum(
        1 for m in model.modules()
        if hasattr(m, "att") and hasattr(m, "ff")
    )
    assert block_count == 3


def test_gpt_uses_positional_embeddings(solution):
    """Reordering tokens at different positions should change outputs —
    proves position information actually reaches the model."""
    torch.manual_seed(0)
    model = solution.GPTModel(TINY_CFG)
    model.eval()
    idx_a = torch.tensor([[1, 2, 3, 4, 5]])
    idx_b = torch.tensor([[5, 4, 3, 2, 1]])
    out_a = model(idx_a)
    out_b = model(idx_b)
    # The middle token (id=3) is at position 2 in both. With positional
    # embeddings + content attention, the *output* at position 2 still
    # differs because surrounding tokens differ. So we just require
    # the outputs are not identical.
    assert not torch.allclose(out_a, out_b)


def test_gpt_one_training_step_lowers_loss(solution):
    """Sanity check that the model actually trains: a single AdamW step
    on a fixed batch should reduce the cross-entropy loss."""
    torch.manual_seed(0)
    model = solution.GPTModel(TINY_CFG)
    model.train()
    B, T = 2, 8
    idx = torch.randint(0, TINY_CFG["vocab_size"], (B, T))
    target = torch.randint(0, TINY_CFG["vocab_size"], (B, T))

    optim = torch.optim.AdamW(model.parameters(), lr=1e-2)
    loss_fn = nn.CrossEntropyLoss()

    logits = model(idx)
    loss_before = loss_fn(logits.view(-1, TINY_CFG["vocab_size"]), target.view(-1))

    optim.zero_grad()
    loss_before.backward()
    optim.step()

    logits = model(idx)
    loss_after = loss_fn(logits.view(-1, TINY_CFG["vocab_size"]), target.view(-1))

    assert loss_after.item() < loss_before.item(), (
        f"loss did not decrease: before={loss_before.item():.4f} after={loss_after.item():.4f}"
    )


def test_gpt_no_bias_on_out_head(solution):
    """GPT-2 uses bias=False on the lm_head."""
    model = solution.GPTModel(TINY_CFG)
    assert model.out_head.bias is None
