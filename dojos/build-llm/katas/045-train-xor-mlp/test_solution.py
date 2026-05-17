"""Tests for train-xor-mlp."""

import torch


def test_xor_data_shapes_and_values(solution):
    X, y = solution.build_xor_data()
    assert X.shape == torch.Size([4, 2])
    assert y.shape == torch.Size([4])
    assert X.dtype == torch.float32
    assert y.dtype == torch.float32
    # XOR truth table.
    expected_X = torch.tensor([[0., 0.], [0., 1.], [1., 0.], [1., 1.]])
    expected_y = torch.tensor([0., 1., 1., 0.])
    # Order-independent check.
    pairs_got = {(float(a), float(b), float(t)) for (a, b), t in zip(X, y)}
    pairs_expected = {
        (float(a), float(b), float(t))
        for (a, b), t in zip(expected_X, expected_y)
    }
    assert pairs_got == pairs_expected


def test_mlp_architecture(solution):
    import torch.nn as nn
    model = solution.build_xor_mlp()
    assert isinstance(model, nn.Sequential)
    # First layer maps 2 -> N, last layer maps N -> 1.
    linears = [m for m in model if isinstance(m, nn.Linear)]
    assert len(linears) >= 2
    assert linears[0].in_features == 2
    assert linears[-1].out_features == 1
    # Must contain a nonlinearity.
    nonlinears = [m for m in model if isinstance(m, (nn.Tanh, nn.ReLU, nn.Sigmoid))]
    assert len(nonlinears) >= 1


def test_training_lowers_loss(solution):
    torch.manual_seed(0)
    X, y = solution.build_xor_data()
    model = solution.build_xor_mlp()
    final_loss = solution.train(model, X, y, steps=1000, lr=0.1)
    assert isinstance(final_loss, float)
    assert final_loss < 0.05, f"Loss did not go down enough: {final_loss}"


def test_predictions_match_xor_truth_table(solution):
    torch.manual_seed(0)
    X, y = solution.build_xor_data()
    model = solution.build_xor_mlp()
    solution.train(model, X, y, steps=1000, lr=0.1)
    preds = solution.predict(model, X)
    assert preds.shape == torch.Size([4])
    assert torch.equal(preds.to(torch.int64), y.to(torch.int64))
