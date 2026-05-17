"""Tests for perplexity."""

import math

import torch


def test_perplexity_of_zero_loss(solution):
    """exp(0) = 1 → perfect prediction has perplexity 1."""
    loss = torch.tensor(0.0)
    ppl = solution.perplexity_from_loss(loss)
    assert abs(ppl.item() - 1.0) < 1e-6


def test_perplexity_of_log_v(solution):
    """exp(log(V)) = V → uniform predictions have perplexity == vocab size."""
    V = 50
    loss = torch.tensor(math.log(V))
    ppl = solution.perplexity_from_loss(loss)
    assert abs(ppl.item() - V) < 1e-4


def test_uniform_logits_perplexity_equals_vocab(solution):
    """Uniform logits over V tokens → perplexity == V."""
    V = 50
    logits = torch.zeros(8, V)
    targets = torch.randint(0, V, (8,))
    ppl = solution.perplexity_from_logits(logits, targets)
    assert abs(ppl.item() - V) < 1e-3


def test_perfect_logits_perplexity_one(solution):
    """Logits that strongly favor the target → perplexity ≈ 1."""
    V = 10
    logits = torch.full((4, V), -100.0)
    targets = torch.tensor([0, 1, 2, 3])
    for i, t in enumerate(targets):
        logits[i, t] = 100.0
    ppl = solution.perplexity_from_logits(logits, targets)
    assert abs(ppl.item() - 1.0) < 1e-3


def test_perplexity_returns_scalar(solution):
    ppl = solution.perplexity_from_loss(torch.tensor(2.0))
    assert ppl.dim() == 0


def test_perplexity_monotonic_in_loss(solution):
    """Higher loss → higher perplexity (perplexity is monotone in loss)."""
    losses = [0.5, 1.0, 2.0, 4.0]
    ppls = [solution.perplexity_from_loss(torch.tensor(l)).item() for l in losses]
    assert ppls == sorted(ppls)
