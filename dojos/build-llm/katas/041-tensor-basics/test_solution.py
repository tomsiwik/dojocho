"""Tests for tensor-basics."""

import pytest
import torch


def test_make_scalar_is_zero_d(solution):
    t = solution.make_scalar(3.0)
    assert isinstance(t, torch.Tensor)
    assert t.shape == torch.Size([])
    assert t.ndim == 0
    assert float(t) == pytest.approx(3.0)


def test_make_vector_shape_and_values(solution):
    t = solution.make_vector([1.0, 2.0, 3.0, 4.0])
    assert t.shape == torch.Size([4])
    assert t.ndim == 1
    assert torch.equal(t, torch.tensor([1.0, 2.0, 3.0, 4.0]))


def test_make_matrix_shape_and_values(solution):
    t = solution.make_matrix([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]])
    assert t.shape == torch.Size([2, 3])
    assert t.ndim == 2
    assert float(t[1, 2]) == pytest.approx(6.0)


def test_make_3d_shape_and_fill(solution):
    t = solution.make_3d((2, 3, 4), fill=7.0)
    assert t.shape == torch.Size([2, 3, 4])
    assert t.ndim == 3
    assert torch.all(t == 7.0)


def test_reshape_changes_shape_preserves_values(solution):
    src = torch.arange(12)
    out = solution.reshape_to(src, (3, 4))
    assert out.shape == torch.Size([3, 4])
    # Row-major flatten matches original.
    assert torch.equal(out.flatten(), src)


def test_reshape_to_3d(solution):
    src = torch.arange(24)
    out = solution.reshape_to(src, (2, 3, 4))
    assert out.shape == torch.Size([2, 3, 4])


def test_view_on_contiguous(solution):
    src = torch.arange(6)  # contiguous 1-D
    out = solution.view_to(src, (2, 3))
    assert out.shape == torch.Size([2, 3])
    assert torch.equal(out.flatten(), src)


def test_view_raises_on_noncontiguous(solution):
    # Transpose makes a non-contiguous tensor; .view should raise.
    src = torch.arange(6).reshape(2, 3).transpose(0, 1)
    assert not src.is_contiguous()
    with pytest.raises(RuntimeError):
        solution.view_to(src, (6,))


def test_transpose_2d_swaps_axes(solution):
    src = torch.tensor([[1, 2, 3], [4, 5, 6]])
    out = solution.transpose_2d(src)
    assert out.shape == torch.Size([3, 2])
    assert torch.equal(out, torch.tensor([[1, 4], [2, 5], [3, 6]]))
