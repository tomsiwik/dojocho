"""Tests for dataset-dataloader-device."""

import torch
from torch.utils.data import DataLoader, Dataset


def _make_xy(n=6, d=3):
    X = torch.arange(n * d, dtype=torch.float32).reshape(n, d)
    y = torch.arange(n, dtype=torch.float32)
    return X, y


def test_dataset_is_subclass(solution):
    X, y = _make_xy()
    ds = solution.ToyDataset(X, y)
    assert isinstance(ds, Dataset)


def test_dataset_len(solution):
    X, y = _make_xy(n=10)
    ds = solution.ToyDataset(X, y)
    assert len(ds) == 10


def test_dataset_getitem_returns_one_pair(solution):
    X, y = _make_xy(n=6, d=3)
    ds = solution.ToyDataset(X, y)
    x0, y0 = ds[0]
    assert isinstance(x0, torch.Tensor)
    assert isinstance(y0, torch.Tensor)
    # ONE example: x is shape (d,), y is scalar.
    assert x0.shape == torch.Size([3])
    assert y0.shape == torch.Size([])
    assert torch.equal(x0, X[0])
    assert float(y0) == float(y[0])


def test_dataloader_batches(solution):
    X, y = _make_xy(n=6, d=3)
    ds = solution.ToyDataset(X, y)
    dl = solution.make_dataloader(ds, batch_size=2)
    assert isinstance(dl, DataLoader)
    batches = list(dl)
    # 6 examples, batch_size=2 -> 3 batches.
    assert len(batches) == 3
    for xb, yb in batches:
        assert xb.shape == torch.Size([2, 3])
        assert yb.shape == torch.Size([2])


def test_dataloader_preserves_values_shuffle_false(solution):
    X, y = _make_xy(n=4, d=2)
    ds = solution.ToyDataset(X, y)
    dl = solution.make_dataloader(ds, batch_size=2)
    batches = list(dl)
    # With shuffle=False, the first batch is the first two examples.
    assert torch.equal(batches[0][0], X[:2])
    assert torch.equal(batches[0][1], y[:2])


def test_get_device_returns_valid_device(solution):
    dev = solution.get_device()
    assert isinstance(dev, torch.device)
    assert dev.type in {"mps", "cuda", "cpu"}


def test_get_device_actually_usable(solution):
    """We must be able to allocate a tensor on the returned device."""
    dev = solution.get_device()
    t = torch.zeros(2, 2, device=dev)
    assert t.device.type == dev.type


def test_get_device_prefers_accelerator_when_available(solution):
    """If mps is available, prefer mps. If only cuda is available,
    prefer cuda. Otherwise cpu. The function MUST NOT raise either way.
    """
    dev = solution.get_device()
    mps_ok = (
        getattr(torch.backends, "mps", None) is not None
        and torch.backends.mps.is_available()
        and torch.backends.mps.is_built()
    )
    cuda_ok = torch.cuda.is_available()
    if mps_ok:
        assert dev.type == "mps"
    elif cuda_ok:
        assert dev.type == "cuda"
    else:
        assert dev.type == "cpu"
