"""Tests for greedy-on-tiny-gpt."""

import pytest
import torch


@pytest.fixture
def model(solution):
    torch.manual_seed(0)
    m = solution.TinyGPT()
    m.eval()
    return m


def test_returns_tensor(solution, model):
    ids = torch.tensor([[1, 2, 3]])
    out = solution.generate_greedy(model, ids, n_tokens=2)
    assert isinstance(out, torch.Tensor)


def test_output_shape(solution, model):
    """Result is prompt concatenated with n_tokens new tokens."""
    ids = torch.tensor([[1, 2, 3, 4]])
    out = solution.generate_greedy(model, ids, n_tokens=5)
    assert out.shape == (1, 9)


def test_prompt_preserved(solution, model):
    """The first T columns are the original prompt, untouched."""
    ids = torch.tensor([[5, 7, 11, 13]])
    out = solution.generate_greedy(model, ids, n_tokens=3)
    assert torch.equal(out[:, :4], ids)


def test_batch_dim_preserved(solution, model):
    """Generation handles B > 1."""
    ids = torch.tensor([[1, 2, 3], [4, 5, 6]])
    out = solution.generate_greedy(model, ids, n_tokens=2)
    assert out.shape == (2, 5)


def test_is_argmax(solution, model):
    """The appended token at each step is the argmax of the model's
    last-position logits over the running sequence."""
    ids = torch.tensor([[1, 2, 3, 4]])
    out = solution.generate_greedy(model, ids, n_tokens=4)

    running = ids.clone()
    with torch.inference_mode():
        for _ in range(4):
            logits = model(running)[:, -1, :]
            nxt = torch.argmax(logits, dim=-1, keepdim=True)
            running = torch.cat([running, nxt], dim=1)

    assert torch.equal(out, running)


def test_zero_tokens_is_identity(solution, model):
    """n_tokens=0 returns the prompt unchanged."""
    ids = torch.tensor([[2, 4, 6]])
    out = solution.generate_greedy(model, ids, n_tokens=0)
    assert torch.equal(out, ids)
