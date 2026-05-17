# SENSEI — train-xor-mlp

## Briefing

### Goal

Train a tiny 2-layer MLP to learn XOR. This is the moment networks
**learn** — a forward pass, a loss, a backward pass, an optimizer
step, repeated.

XOR is the historical example for why hidden layers exist: a single
linear layer provably cannot learn it. Two layers with a nonlinearity
can. You will see this with your own eyes.

### Tasks

1. Implement `build_xor_data()` — return `(X, y)`:
   - `X` shape `(4, 2)`, dtype `float32`: the four XOR inputs
     `[[0,0], [0,1], [1,0], [1,1]]`.
   - `y` shape `(4,)`, dtype `float32`: the targets
     `[0, 1, 1, 0]`.
2. Implement `build_xor_mlp()` — return an `nn.Sequential`:
   - `Linear(2 -> 8) -> Tanh -> Linear(8 -> 1)`.
   - Tanh works robustly for XOR; ReLU can dead-neuron.
3. Implement `train(model, X, y, steps=1000, lr=0.1)`:
   - Use `nn.MSELoss()` (regression-style; targets are 0/1 but we
     measure squared error against a continuous output).
   - Use `torch.optim.SGD(model.parameters(), lr=lr)`.
   - For each step: zero grads, forward, compute loss against
     `y.unsqueeze(1)` (output shape is `(4, 1)`), backward, step.
   - Return the final loss as a float.
4. Implement `predict(model, X)` — forward `X` through the model and
   threshold at 0.5. Return a `(4,)` integer tensor of 0/1 predictions.

### Hints

- The model output is shape `(4, 1)`. Targets are `(4,)`. Either
  `unsqueeze(1)` the targets or `squeeze(1)` the output before
  computing the loss — pick one and be consistent.
- `optimizer.zero_grad()` BEFORE the backward, not after.
- `predict` should not collect gradients — wrap in `torch.no_grad()`.
- 1000 steps at `lr=0.1` is comfortably enough. Seed for determinism.

## Prerequisites

- `nn-module-subclass`, `autograd-hand-vs-machine`.

## References

- Raschka appendix A §A.7 — "A typical training loop".
- Why XOR needs a hidden layer (the original 1969 result):
  https://en.wikipedia.org/wiki/Perceptrons_(book)

## Teaching Approach

Worked example for the training loop syntax + Socratic on what
"learning" actually means.

### Socratic prompts

- "Before training, what does `model(X)` give you for XOR? Look at the
  raw outputs. Are they near 0.5? Why?"
- "After training, look at `model[0].weight` (the first Linear). Can
  you interpret any of its rows? (Hint: which directions in the (x, y)
  plane separate the two XOR classes?)"
- "Try `build_xor_mlp` but without the Tanh — just two Linears in a
  row. Train it. What happens? Why?" (Answer: two linears compose to
  one linear; you can't separate XOR with one hyperplane.)
- "What happens if you forget `optimizer.zero_grad()`? Try it. The
  loss will explode — why? (Hint: PyTorch *accumulates* gradients by
  default. That's a feature for some workloads, a bug here.)"

### Common pitfalls

1. **Shape mismatch on the loss** — `(4, 1)` vs `(4,)` silently
   broadcasts in MSE and gives you a `(4, 4)` loss matrix. Always
   match the output and target shape.
2. **Forgetting `zero_grad`** — gradients accumulate; loss explodes.
3. **No nonlinearity** — without Tanh/ReLU, the network is one linear
   map and XOR is unlearnable.
4. **Using BCE without a sigmoid** — `BCELoss` expects probabilities;
   `BCEWithLogitsLoss` expects logits. We sidestep both with MSE.

## On Completion

### Insight

Four lines is the entire training loop. Every model in this dojo —
GPT-2 included — uses exactly this skeleton:
```
optimizer.zero_grad()
loss = criterion(model(x), y)
loss.backward()
optimizer.step()
```
The only differences in real LLM training are: bigger batches,
gradient accumulation, learning-rate schedules, mixed precision, and
distributed sync. The four-line skeleton is invariant.

The Tanh is what makes XOR learnable. Without it, your model is `W2 @
W1 @ x + ...`, which is just one linear map. With Tanh in the middle,
the hidden layer can carve the input space into regions a final
linear can separate.

### Bridge

Next: **dataset-dataloader-device**. So far, you have hand-built every
input batch. Now you will wrap data in PyTorch's `Dataset` /
`DataLoader` abstraction and add a defensive `get_device()` that picks
mps → cuda → cpu.
