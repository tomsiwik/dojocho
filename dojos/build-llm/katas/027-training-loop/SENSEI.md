# SENSEI — training-loop

## Briefing

### Goal

Write the 5-line PyTorch training loop that powers **every** neural
network you'll ever touch. Order matters. Get the order wrong and you
either don't train at all or you accumulate stale gradients silently.

The ritual:

```
zero_grad → forward → loss → backward → step
```

That's it. The rest of "training an LLM" is choosing the data, the
model, the optimizer — but this 5-line core never changes.

### Tasks

1. Implement `train_one_epoch(model, optimizer, dataloader, device)`:
   - Iterate the dataloader. Each batch is `(inputs, targets)` —
     `inputs` shape `(B, T)`, `targets` shape `(B, T)`.
   - Move tensors to `device`.
   - Run the 5 steps in correct order.
   - Use `F.cross_entropy` (the model returns logits `(B, T, V)`; you
     flatten to compute loss).
   - Return the **mean loss** across batches in this epoch (a float).

2. Implement `train(model, optimizer, dataloader, num_epochs, device='cpu')`:
   - Call `train_one_epoch` `num_epochs` times.
   - Return `list[float]` of per-epoch mean losses.

### Hints

- `model.train()` before training (sets dropout/batchnorm to train
  mode — not strictly needed for the test models, but good habit).
- `optimizer.zero_grad()` MUST come before `loss.backward()`,
  otherwise gradients from the previous batch accumulate.
- `logits.view(-1, V)` and `targets.view(-1)` to flatten for CE.
- `loss.item()` extracts a Python float from a 0-dim tensor.

### Stub order (Parsons-style — fix the order)

The stub has scrambled comments. The 5 lines are:
```
loss.backward()
optimizer.step()
logits = model(inputs)
optimizer.zero_grad()
loss = F.cross_entropy(logits.view(-1, V), targets.view(-1))
```
Put them in the right order.

## Prerequisites

- Kata: cross-entropy-from-logits.
- Kata 004 (you've seen `(input, target)` pairs).
- Familiarity with `torch.optim.AdamW` / SGD (the test will pass one
  in — you don't construct it).

## References

- Raschka chapter 5 §5.2 — "Training an LLM". The book's
  `train_model_simple` is the same 5 lines wrapped in eval/logging.
- minGPT trainer: https://github.com/karpathy/minGPT/blob/master/mingpt/trainer.py
- PyTorch docs: `torch.optim.Optimizer.zero_grad`,
  `torch.Tensor.backward`, `torch.optim.Optimizer.step`.

## Teaching Approach

**Worked example + Parsons (order matters).** The 5 steps are
non-negotiable. After they pass, one Socratic question:

### Socratic prompts

- "What happens if you call `optimizer.step()` BEFORE
  `loss.backward()`?" (Answer: `.step()` uses `param.grad`, which is
  still `None` or stale from the previous batch. You either get an
  error or you silently apply the wrong gradients.)
- "What happens if you call `loss.backward()` WITHOUT first calling
  `optimizer.zero_grad()`?" (Answer: gradients accumulate across
  batches. This is sometimes deliberate — 'gradient accumulation' for
  effectively larger batch sizes — but if you don't *mean* it, your
  model trains as if every batch were the running sum of all previous
  batches.)
- "Why `loss.item()` and not just `loss`? What's the cost of holding
  the tensor?" (Answer: the tensor holds the entire computation graph
  for backward. Storing it in a Python list across all batches OOMs
  the GPU.)

### Common pitfalls

1. **Wrong order** — see Socratic above. Always
   `zero_grad → forward → loss → backward → step`.
2. **Forgetting `.item()`** — appending `loss` (a tensor with grad
   graph) to a list, leaking memory. Always `.item()`.
3. **Not flattening for CE** — `F.cross_entropy` for sequence data
   needs `(N, V)` logits and `(N,)` targets, NOT `(B, T, V)` and
   `(B, T)`. Use `.view(-1, V)` and `.view(-1)`.
4. **Calling `model.eval()` before training** — disables dropout
   and uses running batchnorm stats. Use `model.train()`.

## On Completion

### Insight

You just wrote the same loop that trains GPT-4. Every fancy thing in
modern training — mixed precision, gradient accumulation, gradient
clipping, learning-rate schedules, distributed training — wraps
*around* these 5 lines without changing them.

The reason this loop is so short: PyTorch's `autograd` does all the
hard work. `loss.backward()` walks the computation graph and computes
`∂loss/∂param` for every parameter the loss touched. You never write
a gradient by hand.

### Bridge

You can decrease the loss. But can you tell when the model has
**learned the wrong thing**? Next: **train-val-split** — split your
data, watch train loss drop while val loss climbs back up, and meet
the central enemy of all of ML: **overfitting**.
