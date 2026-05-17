"""Tests for broadcasting."""

import pytest
import torch


# --- broadcast_shape: the rule itself ---

@pytest.mark.parametrize(
    "a,b,expected",
    [
        ((3, 1), (1, 4), (3, 4)),
        ((1,), (5,), (5,)),
        ((2, 3, 4), (4,), (2, 3, 4)),
        ((2, 3, 4), (3, 1), (2, 3, 4)),
        ((5, 1, 3), (1, 4, 3), (5, 4, 3)),
        ((), (3, 4), (3, 4)),  # scalar broadcasts to anything
    ],
)
def test_broadcast_shape_compatible(solution, a, b, expected):
    assert solution.broadcast_shape(a, b) == expected


@pytest.mark.parametrize(
    "a,b",
    [
        ((3,), (4,)),
        ((2, 3), (3, 2)),
        ((2, 3, 4), (2, 4, 4)),
    ],
)
def test_broadcast_shape_incompatible_raises(solution, a, b):
    with pytest.raises(ValueError):
        solution.broadcast_shape(a, b)


# --- add_row_vector ---

def test_add_row_vector_shape_and_values(solution):
    m = torch.tensor([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]])
    row = torch.tensor([10.0, 20.0, 30.0])
    out = solution.add_row_vector(m, row)
    assert out.shape == torch.Size([2, 3])
    assert torch.equal(out, torch.tensor([[11.0, 22.0, 33.0], [14.0, 25.0, 36.0]]))


# --- add_col_vector ---

def test_add_col_vector_shape_and_values(solution):
    m = torch.tensor([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]])
    col = torch.tensor([10.0, 20.0])
    out = solution.add_col_vector(m, col)
    assert out.shape == torch.Size([2, 3])
    assert torch.equal(out, torch.tensor([[11.0, 12.0, 13.0], [24.0, 25.0, 26.0]]))


# --- outer_sum ---

def test_outer_sum_shape_and_values(solution):
    a = torch.tensor([1.0, 2.0, 3.0])
    b = torch.tensor([10.0, 20.0, 30.0, 40.0])
    out = solution.outer_sum(a, b)
    assert out.shape == torch.Size([3, 4])
    expected = torch.tensor(
        [
            [11.0, 21.0, 31.0, 41.0],
            [12.0, 22.0, 32.0, 42.0],
            [13.0, 23.0, 33.0, 43.0],
        ]
    )
    assert torch.equal(out, expected)


# --- pairwise_diff ---

def test_pairwise_diff_shape(solution):
    pts = torch.randn(5, 3)
    out = solution.pairwise_diff(pts)
    assert out.shape == torch.Size([5, 5, 3])


def test_pairwise_diff_values(solution):
    pts = torch.tensor([[0.0, 0.0], [1.0, 2.0], [3.0, 5.0]])
    out = solution.pairwise_diff(pts)
    # out[i, j] = pts[i] - pts[j]
    assert torch.equal(out[0, 0], torch.tensor([0.0, 0.0]))
    assert torch.equal(out[1, 0], torch.tensor([1.0, 2.0]))
    assert torch.equal(out[0, 1], torch.tensor([-1.0, -2.0]))
    assert torch.equal(out[2, 1], torch.tensor([2.0, 3.0]))


def test_pairwise_diff_antisymmetric(solution):
    pts = torch.randn(4, 2)
    out = solution.pairwise_diff(pts)
    # out[i, j] == -out[j, i]
    assert torch.allclose(out, -out.transpose(0, 1))
