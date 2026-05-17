"""Tests for checkpoint-save-resume."""

import tempfile
from pathlib import Path

import torch
import torch.nn as nn


VOCAB = 30
D_MODEL = 16
SEQ_LEN = 6
BATCH = 2


class TinyLM(nn.Module):
    def __init__(self, vocab=VOCAB, d_model=D_MODEL):
        super().__init__()
        self.embed = nn.Embedding(vocab, d_model)
        self.head = nn.Linear(d_model, vocab)

    def forward(self, x):
        return self.head(self.embed(x))


def _corpus(seed=0):
    torch.manual_seed(seed)
    pattern = torch.tensor([1, 2, 3, 4, 5, 6, 7, 8])
    batches = []
    for _ in range(4):
        toks = pattern.repeat(BATCH, (SEQ_LEN + 1) // len(pattern) + 1)
        toks = toks[:, : SEQ_LEN + 1].contiguous()
        batches.append((toks[:, :-1].contiguous().long(), toks[:, 1:].contiguous().long()))
    return batches


def _build():
    torch.manual_seed(0)
    model = TinyLM()
    opt = torch.optim.AdamW(model.parameters(), lr=1e-2)
    return model, opt


def test_save_and_load_step(solution):
    model, opt = _build()
    with tempfile.TemporaryDirectory() as td:
        path = Path(td) / "ckpt.pt"
        solution.save_checkpoint(path, model, opt, step=42)
        assert path.exists()
        model2, opt2 = _build()
        step = solution.load_checkpoint(path, model2, opt2)
        assert step == 42


def test_save_load_restores_model_weights(solution):
    model, opt = _build()
    # Mutate weights so save/load is non-trivial.
    with torch.no_grad():
        model.embed.weight.add_(1.0)
    with tempfile.TemporaryDirectory() as td:
        path = Path(td) / "ckpt.pt"
        solution.save_checkpoint(path, model, opt, step=0)
        model2, opt2 = _build()
        # Sanity: weights differ before load.
        assert not torch.allclose(model.embed.weight, model2.embed.weight)
        solution.load_checkpoint(path, model2, opt2)
        assert torch.allclose(model.embed.weight, model2.embed.weight)


def test_save_load_restores_optimizer_state(solution):
    """AdamW's optimizer state must round-trip. Otherwise resume is wrong."""
    model, opt = _build()
    # Run a few steps so optimizer has nontrivial state.
    solution.train_steps(model, opt, _corpus(), n_steps=4)
    saved_state = opt.state_dict()
    with tempfile.TemporaryDirectory() as td:
        path = Path(td) / "ckpt.pt"
        solution.save_checkpoint(path, model, opt, step=4)
        model2, opt2 = _build()
        solution.load_checkpoint(path, model2, opt2)
        loaded_state = opt2.state_dict()
        # Compare the 'state' subdict (per-parameter moments).
        assert set(saved_state["state"].keys()) == set(loaded_state["state"].keys())
        for k in saved_state["state"]:
            for sub in saved_state["state"][k]:
                a = saved_state["state"][k][sub]
                b = loaded_state["state"][k][sub]
                if isinstance(a, torch.Tensor):
                    assert torch.allclose(a, b), f"optimizer state {k}.{sub} diverged"


def test_resume_produces_identical_trajectory(solution):
    """Train N+M steps == train N, save, load, train M more."""
    # Reference: train 8 steps straight.
    model_ref, opt_ref = _build()
    losses_ref = solution.train_steps(model_ref, opt_ref, _corpus(), n_steps=8)

    # Round-trip: train 4, save, fresh model+opt, load, train 4 more.
    model_a, opt_a = _build()
    losses_a_part1 = solution.train_steps(model_a, opt_a, _corpus(), n_steps=4)
    with tempfile.TemporaryDirectory() as td:
        path = Path(td) / "ckpt.pt"
        solution.save_checkpoint(path, model_a, opt_a, step=4)
        model_b, opt_b = _build()
        step = solution.load_checkpoint(path, model_b, opt_b)
        assert step == 4
        losses_b_part2 = solution.train_steps(model_b, opt_b, _corpus(), n_steps=4)

    losses_combined = losses_a_part1 + losses_b_part2
    assert len(losses_combined) == 8
    # The combined trajectory should match the straight-through one.
    for i, (r, c) in enumerate(zip(losses_ref, losses_combined)):
        assert abs(r - c) < 1e-5, f"step {i}: ref={r:.6f} resumed={c:.6f}"


def test_resume_weights_match_continued_training(solution):
    """After resume + N steps, weights match training without resume."""
    model_ref, opt_ref = _build()
    solution.train_steps(model_ref, opt_ref, _corpus(), n_steps=6)
    ref_weights = model_ref.embed.weight.detach().clone()

    model_a, opt_a = _build()
    solution.train_steps(model_a, opt_a, _corpus(), n_steps=3)
    with tempfile.TemporaryDirectory() as td:
        path = Path(td) / "ckpt.pt"
        solution.save_checkpoint(path, model_a, opt_a, step=3)
        model_b, opt_b = _build()
        solution.load_checkpoint(path, model_b, opt_b)
        solution.train_steps(model_b, opt_b, _corpus(), n_steps=3)

    assert torch.allclose(ref_weights, model_b.embed.weight, atol=1e-6), (
        "resumed training does not match continuous training"
    )


def test_train_steps_returns_n_losses(solution):
    model, opt = _build()
    losses = solution.train_steps(model, opt, _corpus(), n_steps=5)
    assert len(losses) == 5
    assert all(isinstance(l, float) for l in losses)
