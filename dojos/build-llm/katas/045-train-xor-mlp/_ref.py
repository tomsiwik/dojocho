"""Reference solution for train-xor-mlp."""

import torch
import torch.nn as nn


def build_xor_data():
    X = torch.tensor([[0., 0.], [0., 1.], [1., 0.], [1., 1.]], dtype=torch.float32)
    y = torch.tensor([0., 1., 1., 0.], dtype=torch.float32)
    return X, y


def build_xor_mlp():
    return nn.Sequential(
        nn.Linear(2, 8),
        nn.Tanh(),
        nn.Linear(8, 1),
    )


def train(model, X, y, steps=1000, lr=0.1):
    criterion = nn.MSELoss()
    optimizer = torch.optim.SGD(model.parameters(), lr=lr)
    last = 0.0
    for _ in range(steps):
        optimizer.zero_grad()
        out = model(X)
        loss = criterion(out, y.unsqueeze(1))
        loss.backward()
        optimizer.step()
        last = loss.item()
    return last


def predict(model, X):
    with torch.no_grad():
        out = model(X).squeeze(-1)
        return (out > 0.5).to(torch.int64)
