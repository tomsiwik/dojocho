"""Tests for dynamic-batch-pack."""

import pytest


def test_total_tokens_conserved(solution):
    """Every input token ends up in exactly one batch."""
    reqs = [10, 20, 30, 40, 50]
    batches = solution.pack_to_budget(reqs, budget=100)
    flat = [tok for batch in batches for tok in batch]
    assert sorted(flat) == sorted(reqs)


def test_no_batch_exceeds_budget(solution):
    """The whole point: budget is hard."""
    reqs = [40, 30, 20, 10, 50, 60, 25]
    budget = 100
    for batch in solution.pack_to_budget(reqs, budget):
        assert sum(batch) <= budget


def test_first_fit_order(solution):
    """First-fit: request goes into the first batch that has room."""
    # 80 opens batch[0] (=80). 30 doesn't fit in batch[0] (80+30>100),
    # opens batch[1] (=30). 15 fits in batch[0] (80+15<=100), goes
    # there.
    batches = solution.pack_to_budget([80, 30, 15], budget=100)
    assert len(batches) == 2
    assert batches[0] == [80, 15]
    assert batches[1] == [30]


def test_single_request_under_budget(solution):
    batches = solution.pack_to_budget([42], budget=100)
    assert batches == [[42]]


def test_empty_returns_empty(solution):
    """No work, no batches."""
    assert solution.pack_to_budget([], budget=100) == []


def test_oversize_raises(solution):
    """A single request bigger than budget can never fit."""
    with pytest.raises(ValueError):
        solution.pack_to_budget([50, 150, 20], budget=100)


def test_exact_fit(solution):
    """A request that exactly fills a batch is fine."""
    batches = solution.pack_to_budget([100, 50, 50], budget=100)
    # 100 fills batch[0]. 50 opens batch[1] (=50). 50 fits in batch[1]
    # (50+50<=100), goes there.
    assert batches == [[100], [50, 50]]


def test_many_small_requests(solution):
    """Lots of tiny requests fit into few batches."""
    reqs = [1] * 250
    batches = solution.pack_to_budget(reqs, budget=100)
    # First-fit: every request fits in batch[0] until it has 100, then
    # batch[1], etc. 250 tokens / 100 budget -> 3 batches.
    assert len(batches) == 3
    assert sum(len(b) for b in batches) == 250
