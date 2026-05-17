"""Tests for streaming-generation."""

import inspect

import pytest
import torch


@pytest.fixture
def model(solution):
    torch.manual_seed(0)
    m = solution.TinyGPT()
    m.eval()
    return m


def _greedy_reference(model, ids, n):
    """Non-streaming reference: same loop, collect into a list."""
    out = []
    running = ids.clone()
    with torch.inference_mode():
        for _ in range(n):
            logits = model(running)[:, -1, :]
            nxt = torch.argmax(logits, dim=-1, keepdim=True)
            out.append(int(nxt.item()))
            running = torch.cat([running, nxt], dim=1)
    return out


def test_is_generator_function(solution):
    """stream_generate must be a generator (uses yield), not a function
    that returns a list."""
    assert inspect.isgeneratorfunction(solution.stream_generate), (
        "stream_generate must use `yield` — not `return [list]`."
    )


def test_yields_exactly_n_tokens(solution, model):
    ids = torch.tensor([[1, 2, 3]])
    yielded = list(solution.stream_generate(model, ids, n_tokens=5))
    assert len(yielded) == 5


def test_yields_python_ints(solution, model):
    """Each yielded value is a plain int — not a tensor."""
    ids = torch.tensor([[1, 2, 3]])
    for tok in solution.stream_generate(model, ids, n_tokens=3):
        assert isinstance(tok, int), f"Expected int, got {type(tok)}"


def test_matches_non_streaming_greedy(solution, model):
    """The full collection must equal the greedy reference."""
    ids = torch.tensor([[1, 2, 3, 4]])
    yielded = list(solution.stream_generate(model, ids, n_tokens=6))
    expected = _greedy_reference(model, ids, n=6)
    assert yielded == expected


def test_zero_tokens_yields_nothing(solution, model):
    ids = torch.tensor([[1, 2, 3]])
    yielded = list(solution.stream_generate(model, ids, n_tokens=0))
    assert yielded == []


def test_is_lazy(solution, model):
    """Calling stream_generate does not invoke the model. Only iteration
    does. Verify by patching the model with a counter."""
    ids = torch.tensor([[1, 2, 3]])
    call_count = {"n": 0}
    real_forward = model.forward

    def counted(idx):
        call_count["n"] += 1
        return real_forward(idx)

    model.forward = counted
    try:
        gen = solution.stream_generate(model, ids, n_tokens=4)
        assert call_count["n"] == 0, (
            "stream_generate ran the model before iteration started."
        )
        # Consume one token; one forward should have happened.
        next(gen)
        assert call_count["n"] == 1
    finally:
        model.forward = real_forward
