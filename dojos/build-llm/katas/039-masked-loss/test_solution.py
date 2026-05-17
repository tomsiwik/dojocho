"""Tests for Masked Loss."""

import torch
import torch.nn.functional as F


def test_returns_scalar(solution):
    logits = torch.randn(2, 5, 7)
    targets = torch.randint(0, 7, (2, 5))
    mask = torch.ones(2, 5, dtype=torch.long)
    loss = solution.masked_ce(logits, targets, mask)
    assert loss.dim() == 0


def test_all_ones_matches_plain_cross_entropy(solution):
    """When mask is all ones, masked_ce equals plain cross_entropy(mean)."""
    torch.manual_seed(0)
    B, T, V = 3, 4, 6
    logits = torch.randn(B, T, V)
    targets = torch.randint(0, V, (B, T))
    mask = torch.ones(B, T, dtype=torch.long)

    masked = solution.masked_ce(logits, targets, mask)
    plain = F.cross_entropy(logits.view(-1, V), targets.view(-1))
    assert torch.allclose(masked, plain, atol=1e-6)


def test_equivalence_with_ignore_index(solution):
    """The whole point: masked_ce ≡ cross_entropy(targets-with-ignore, ignore_index=-100)."""
    torch.manual_seed(42)
    B, T, V = 4, 8, 10
    logits = torch.randn(B, T, V)
    targets = torch.randint(0, V, (B, T))
    # Random mask, but ensure at least one masked-in position.
    mask = (torch.rand(B, T) > 0.4).long()
    if mask.sum() == 0:
        mask[0, 0] = 1

    masked = solution.masked_ce(logits, targets, mask)

    ignored = solution.targets_with_ignore(targets, mask, ignore_index=-100)
    plain = F.cross_entropy(
        logits.view(-1, V),
        ignored.view(-1),
        ignore_index=-100,
    )
    assert torch.allclose(masked, plain, atol=1e-6), (
        f"masked={masked.item()} vs ignore_index={plain.item()}"
    )


def test_raschka_worked_example(solution):
    """Reproduces Raschka §7.3: masking position 2 yields the 2-token loss."""
    logits = torch.tensor(
        [[-1.0, 1.0],
         [-0.5, 1.5],
         [-0.5, 1.5]]
    ).unsqueeze(0)  # (1, 3, 2)
    targets_full = torch.tensor([[0, 1, 1]])
    targets_two = torch.tensor([[0, 1]])
    logits_two = logits[:, :2, :]

    mask = torch.tensor([[1, 1, 0]])
    masked = solution.masked_ce(logits, targets_full, mask)

    two_token = F.cross_entropy(
        logits_two.view(-1, 2),
        targets_two.view(-1),
    )
    assert torch.allclose(masked, two_token, atol=1e-6)


def test_all_zero_mask_returns_zero(solution):
    """Degenerate case: don't divide by zero."""
    logits = torch.randn(2, 3, 5)
    targets = torch.randint(0, 5, (2, 3))
    mask = torch.zeros(2, 3, dtype=torch.long)
    loss = solution.masked_ce(logits, targets, mask)
    assert loss.item() == 0.0


def test_targets_with_ignore_replaces_correctly(solution):
    targets = torch.tensor([[1, 2, 3], [4, 5, 6]])
    mask = torch.tensor([[1, 0, 1], [0, 1, 0]])
    out = solution.targets_with_ignore(targets, mask, ignore_index=-100)
    expected = torch.tensor([[1, -100, 3], [-100, 5, -100]])
    assert torch.equal(out, expected)


def test_targets_with_ignore_does_not_mutate(solution):
    """Original targets tensor must be unchanged."""
    targets = torch.tensor([[1, 2, 3]])
    mask = torch.tensor([[1, 0, 1]])
    original = targets.clone()
    _ = solution.targets_with_ignore(targets, mask, ignore_index=-100)
    assert torch.equal(targets, original)


def test_gradient_flows_through_masked_positions(solution):
    """Gradient should flow only through masked-in positions."""
    torch.manual_seed(7)
    logits = torch.randn(1, 3, 4, requires_grad=True)
    targets = torch.tensor([[0, 1, 2]])
    mask = torch.tensor([[1, 0, 1]])
    loss = solution.masked_ce(logits, targets, mask)
    loss.backward()
    grads = logits.grad
    # Position 1 is masked out → its gradient is zero.
    assert torch.allclose(grads[0, 1], torch.zeros(4), atol=1e-7)
    # Positions 0 and 2 had gradient flow.
    assert grads[0, 0].abs().sum().item() > 0
    assert grads[0, 2].abs().sum().item() > 0
