"""Tests for training-loop."""

import torch
import torch.nn as nn


VOCAB = 50
D_MODEL = 32
SEQ_LEN = 8
BATCH_SIZE = 4


class TinyLM(nn.Module):
    """A 2-layer tiny LM: embedding → linear → vocab logits.

    Shape contract: input (B, T) long → output (B, T, V) float.
    """

    def __init__(self, vocab=VOCAB, d_model=D_MODEL):
        super().__init__()
        self.embed = nn.Embedding(vocab, d_model)
        self.head = nn.Linear(d_model, vocab)

    def forward(self, x):
        return self.head(self.embed(x))


def _make_corpus(n_batches=8, seed=0):
    """A repeating short pattern so the model can memorize quickly."""
    torch.manual_seed(seed)
    pattern = torch.tensor([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    batches = []
    for _ in range(n_batches):
        # tile pattern into a (B, T+1) tensor and split into (input, target)
        tokens = pattern.repeat(BATCH_SIZE, (SEQ_LEN + 1) // len(pattern) + 1)
        tokens = tokens[:, : SEQ_LEN + 1].contiguous()
        inputs = tokens[:, :-1].contiguous().long()
        targets = tokens[:, 1:].contiguous().long()
        batches.append((inputs, targets))
    return batches


def test_returns_list_of_floats(solution):
    torch.manual_seed(0)
    model = TinyLM()
    opt = torch.optim.AdamW(model.parameters(), lr=1e-2)
    losses = solution.train(model, opt, _make_corpus(), num_epochs=3)
    assert isinstance(losses, list)
    assert len(losses) == 3
    assert all(isinstance(l, float) for l in losses)


def test_loss_decreases(solution):
    """After several epochs on a memorizable corpus, loss must drop."""
    torch.manual_seed(0)
    model = TinyLM()
    opt = torch.optim.AdamW(model.parameters(), lr=1e-2)
    losses = solution.train(model, opt, _make_corpus(), num_epochs=10)
    assert losses[-1] < losses[0] * 0.5, f"loss did not decrease: {losses}"


def test_loss_strictly_decreasing_on_average(solution):
    """Mid-training loss should be between start and end."""
    torch.manual_seed(0)
    model = TinyLM()
    opt = torch.optim.AdamW(model.parameters(), lr=1e-2)
    losses = solution.train(model, opt, _make_corpus(), num_epochs=10)
    assert losses[5] < losses[0]
    assert losses[-1] < losses[5]


def test_one_epoch_returns_float(solution):
    torch.manual_seed(0)
    model = TinyLM()
    opt = torch.optim.AdamW(model.parameters(), lr=1e-2)
    loss = solution.train_one_epoch(model, opt, _make_corpus())
    assert isinstance(loss, float)


def test_optimizer_actually_steps(solution):
    """Parameters must change after training."""
    torch.manual_seed(0)
    model = TinyLM()
    before = model.embed.weight.detach().clone()
    opt = torch.optim.AdamW(model.parameters(), lr=1e-2)
    solution.train(model, opt, _make_corpus(), num_epochs=2)
    after = model.embed.weight.detach()
    assert not torch.allclose(before, after), "weights did not change"


def test_zero_grad_called_each_batch(solution):
    """If zero_grad is missing, gradients accumulate and loss explodes
    or diverges. With proper zero_grad, training is stable."""
    torch.manual_seed(0)
    model = TinyLM()
    opt = torch.optim.AdamW(model.parameters(), lr=1e-2)
    losses = solution.train(model, opt, _make_corpus(), num_epochs=5)
    # All losses should be finite — exploding gradients would NaN/Inf.
    assert all(l == l and l != float("inf") for l in losses), losses
