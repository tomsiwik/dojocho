# SENSEI — Classification Train Step

## Briefing

### Goal

The complete classification training loop is five lines:

```
optimizer.zero_grad()
logits = model(x)[:, -1, :]              # last-token logits
loss = F.cross_entropy(logits, y)
loss.backward()
optimizer.step()
```

You're going to write those five lines and verify them with the
strictest possible test: **loss after step < loss before step**, on a
tiny synthetic dataset, every time.

### Tasks

1. Implement `last_token_logits(model, x)` — run the model, return
   `output[:, -1, :]` of shape `(B, n_classes)`.
2. Implement `compute_loss(logits, y)` — return
   `F.cross_entropy(logits, y)`. `y` is `(B,)` of class indices.
3. Implement `train_step(model, optimizer, x, y)`:
   - `optimizer.zero_grad()`
   - forward → last-token logits → CE loss
   - `loss.backward()`
   - `optimizer.step()`
   - Return the **scalar loss value (before the step)** as a float.
4. Implement `loss_decreases(model, optimizer, x, y, n_steps=5)`:
   - Snapshot `loss_before` with the model in `eval()` (no step).
   - Run `train_step` `n_steps` times on the same `(x, y)`.
   - Snapshot `loss_after` (again, no step).
   - Return `loss_after < loss_before`.

### Hints

- `torch.nn.functional.cross_entropy(logits, targets)` expects
  `(B, C)` and `(B,)` of integer class indices.
- `output[:, -1, :]` is "all batches, last time step, all classes".
- Call `optimizer.zero_grad()` BEFORE forward, or grads from the
  previous step accumulate.
- For `loss_decreases`, freeze and unfreeze with `torch.no_grad():`
  when you compute the snapshot losses; you don't want those forwards
  building autograd graphs you'll never use.
- A high learning rate (e.g. 0.1) and a tiny synthetic dataset
  guarantees the loss drops in 5 steps. Don't use 1e-5; you'll
  flake-fail.

## Prerequisites

- Kata `classification-head-swap` (you have a 2-class output head).
- Kata `last-token-vs-pooling` (you know what `[:, -1, :]` does and
  why).
- Kata `freeze-unfreeze-verify` (you know which params will move).

## References

- Raschka chapter 6 §6.6 — `calc_loss_batch` uses exactly this
  pattern.
- Raschka chapter 6 §6.7 listing 6.10 — `train_classifier_simple`,
  the full loop you're writing one step of.
- `F.cross_entropy` — https://pytorch.org/docs/stable/generated/torch.nn.functional.cross_entropy.html

## Teaching Approach

Strong Socratic. The mechanics are five lines; the *why* of
last-token is the whole lesson.

### Socratic prompts

- "Causal attention means token `i` sees only positions `0..i`. So
  which token has read the entire input? Why classify on THAT token?"
- "If you classified on the FIRST token instead, what would change?
  (See Raschka exercise 6.3.) Why does it perform worse?"
- "What does last-token classification imply about padding? If you
  right-pad with `<pad>`, what does the 'last token' actually
  represent? What about left-pad?"
- "If you forgot `optimizer.zero_grad()`, what happens to the loss
  trajectory over 5 steps? (Hint: gradients accumulate. The first
  step is fine; the second step gets a doubled grad; by step 5 the
  loss is exploding.)"
- After it works: "You ran 5 steps on the same (x, y) — you basically
  *memorized* one batch. What changes when (x, y) rotates each
  step?"

### Common pitfalls

1. **Forgetting `[:, -1, :]`** — passing `(B, T, C)` to
   `cross_entropy` raises a shape error or, worse, silently does
   per-token CE (the wrong loss for classification).
2. **`y` is the wrong dtype** — must be `torch.long` (int64). Float
   `y` raises.
3. **`zero_grad` after backward** — wipes the gradients you just
   computed. Always `zero_grad → forward → backward → step`.
4. **Returning the post-step loss** — the contract is "return the
   loss the optimizer minimized," which is *before* the step.
5. **Learning rate too small for the test** — if you set lr=1e-5,
   loss might not drop in 5 steps. Use lr ~0.1 for synthetic data;
   real fine-tuning uses 5e-5.

## On Completion

### Insight

You now have a full classification training loop in 5 lines plus an
outer `for epoch / for batch` loop. Raschka's
`train_classifier_simple` is exactly that, plus eval logging.

The deeper lesson: **`[:, -1, :]` is the whole bridge from "language
model" to "classifier"**. Cross-entropy doesn't care if the targets
are vocabulary tokens or class labels — they're both indices into a
softmax. You're using the same loss, the same backward, the same
optimizer as pretraining. You just changed what the indices mean.

### Bridge

You can train one step. You can freeze a body. Final kata: combine
them on a schedule. Train only the head for 2 epochs, then also
unfreeze the last block, then the next-to-last, etc. This is
ULMFiT-style **gradual unfreezing** — the canonical recipe for not
catastrophically forgetting your pretraining.
