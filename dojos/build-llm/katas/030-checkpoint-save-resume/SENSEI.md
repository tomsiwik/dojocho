# SENSEI — checkpoint-save-resume

## Briefing

### Goal

Save the full state of a training run — model weights, optimizer
state, and step counter — to disk. Reload it later and continue
training as if nothing happened.

This is the difference between "academic project" code and
"production training" code. A 7B-parameter model takes weeks to
train. If your machine reboots and you only saved the weights, you
lose the optimizer's momentum/variance estimates — and you may also
lose the entire next epoch as the optimizer "re-warms".

### Tasks

1. Implement `save_checkpoint(path, model, optimizer, step)`:
   - Save a single `dict` via `torch.save`:
     ```
     {"model": model.state_dict(),
      "optimizer": optimizer.state_dict(),
      "step": step}
     ```

2. Implement `load_checkpoint(path, model, optimizer)`:
   - `torch.load` the dict.
   - Restore via `model.load_state_dict(...)` and
     `optimizer.load_state_dict(...)`.
   - Return the saved `step` (int).

3. Implement `train_steps(model, optimizer, dataloader, n_steps)`:
   - Run exactly `n_steps` minibatch updates (cycle through the
     dataloader if needed).
   - Return a `list[float]` of the per-step losses.

### Hints

- `torch.save(obj, path)` accepts any picklable object. A dict of
  state-dicts is the standard recipe.
- `torch.load(path)` returns whatever was saved. For PyTorch 2.6+ you
  may need `weights_only=False` since we save more than just weights.
- `model.load_state_dict(d)` and `optimizer.load_state_dict(d)` mutate
  in place — no return value to use.
- Don't forget to `model.train()` (or set it deterministically) for
  reproducible behavior in tests.

## Prerequisites

- Kata: training-loop.
- Familiarity with `torch.optim.AdamW` (the test uses it because
  AdamW's `state_dict` has rich state — moments per parameter — that
  makes the "save model only" mistake visible).

## References

- Raschka chapter 5 §5.4 — "Saving and loading model weights in
  PyTorch". The book covers `state_dict` saving; this kata adds the
  optimizer-and-step recipe.
- PyTorch tutorial: "Saving and Loading a General Checkpoint".

## Teaching Approach

**Worked example + Socratic on WHAT to save.**

### Socratic prompts

- "If you save ONLY `model.state_dict()`, what happens to AdamW's
  state on resume? Why does that matter?" (AdamW maintains per-parameter
  first and second moment estimates — `m_t` and `v_t`. Without them,
  AdamW resets to a "cold start" optimizer, which means the first few
  steps after resume are effectively unscaled SGD. You can SEE this:
  the loss spikes for a few steps. Save the optimizer too.)
- "Why save `step` separately? Can't you derive it?" (You can't, unless
  you log every loss. `step` controls the learning-rate schedule —
  if you resume at step 0 of a cosine schedule that's halfway done,
  you re-apply the warmup. Wrong LR = wrong updates.)
- "Your `load_checkpoint` returns `int`, but `torch.save`/`torch.load`
  could roundtrip the whole dict. What's the API contract you want?"
  (Caller wants `step` to continue counting from; they don't want to
  reach into the dict themselves. Hide the format.)

### Common pitfalls

1. **Saving `model` instead of `model.state_dict()`** — pickling
   the whole module ties the checkpoint to your class definition.
   Move the file to another project and you can't load it.
2. **`torch.load` weights_only error** — PyTorch 2.6+ defaults to
   `weights_only=True`, which refuses to load arbitrary objects.
   Since we save dicts (not just tensors), pass
   `weights_only=False`. (Or use a recent enough PyTorch with the
   `safe_globals` context manager.)
3. **Optimizer state device mismatch** — if you save on GPU and
   load on CPU, optimizer state tensors stay on GPU. Use
   `map_location` on `torch.load` for cross-device portability.
   (Test runs on CPU only, so this doesn't bite here.)
4. **Forgetting determinism** — to verify "resumed trajectory ==
   non-resumed trajectory", you need the same RNG state. The test
   handles this by reseeding before each comparison and using a
   fixed-order dataloader.

## On Completion

### Insight

Three things define a training run's resumability:

1. **Model weights** — the *what* the model knows.
2. **Optimizer state** — the *how* the optimizer is currently
   adapting (momentum, variance, recent gradients).
3. **Step counter** — *where in the schedule* we are (LR, warmup,
   data shuffle index).

Lose any one and resumption is "approximate" at best. Lose the
optimizer state and AdamW behaves like vanilla SGD for the first
several hundred steps after resume — silently degrading your final
model.

Real production training also saves the RNG state, the dataloader's
position, and a hash of the dataset. The pattern is the same: save
*everything that affects the next step*.

### Bridge

Chapter 5 is complete. You have:

- A loss (`cross_entropy_from_logits`).
- A way to report it (`perplexity`).
- A way to decrease it (`training-loop`).
- A way to know when to stop (`train-val-split-with-divergence-detect`).
- A way to consume the trained distribution (`decoding-strategies`).
- A way to persist progress (`checkpoint-save-resume`).

Chapter 6 starts fine-tuning: take a pretrained model and adapt it
to a specific task. You'll see why each of the above is even more
critical when you're working from someone else's expensive weights.
