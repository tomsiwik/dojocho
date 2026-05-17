# SENSEI — Freeze, Unfreeze, Verify

## Briefing

### Goal

Make a concrete contract real: "freeze the body, train only the head
and the last transformer block." Then prove it — not by reading code,
not by trusting `requires_grad`, but by running a backward pass and
checking which tensors actually got a `.grad`.

This is the single most common test in fine-tuning code. Get it wrong
and you'll silently train a frozen layer (or not train an unfrozen
one) for an hour before noticing.

### Tasks

1. Implement `freeze_all(model)` — set `requires_grad=False` on every
   parameter.
2. Implement `unfreeze(model, names)` — `names` is a list of module
   paths like `["blocks.1", "out_head"]`. For each, set
   `requires_grad=True` on every parameter under that path.
3. Implement `is_frozen(param)` — return `True` iff
   `param.requires_grad is False`.
4. Implement `trainable_param_names(model)` — return a sorted list of
   parameter names where `requires_grad is True`.
5. After freezing all except last block + head, run a backward pass on
   a dummy loss and verify:
   - `param.grad is None` (or all-zero) for frozen params.
   - `param.grad is not None` for trainable params.

   You implement `params_with_grad(model)` returning a list of names
   whose `.grad` is not None.

### Hints

- `model.named_parameters()` gives `(qualified_name, Parameter)`.
- A qualified name is `"blocks.1.attn.weight"`. To match a module
  path `"blocks.1"`, check `name.startswith("blocks.1.")`.
- `param.requires_grad = False` flips the flag. PyTorch will then not
  compute a gradient for that param during backward.
- Frozen params keep `.grad is None` after backward (PyTorch never
  allocates a gradient tensor for them).
- For the backward-pass test: `loss = model(x).sum()` is the simplest
  dummy loss.

## Prerequisites

- Kata `classification-head-swap` (you swapped the head).
- Comfort with `param.requires_grad` and `tensor.grad`.

## References

- Raschka chapter 6 §6.5 — the `for param in
  model.trf_blocks[-1].parameters(): param.requires_grad = True`
  pattern.
- PyTorch autograd mechanics: https://pytorch.org/docs/stable/notes/autograd.html

## Teaching Approach

Mechanical drill. The test IS the lesson. Let it fail; the fix is
mostly off-by-one in matching `name.startswith(...)` and forgetting
to call `freeze_all` before `unfreeze`.

### Socratic prompts (only if the student is fully stuck)

- "If `requires_grad=False`, what does PyTorch skip in backward? What
  does `.grad` end up as?"
- "Why `name.startswith('blocks.1.')` and not `name.startswith('blocks.1')`?
  What does the trailing dot prevent?" (Answer: `blocks.10` would
  match `blocks.1` without the dot.)
- "If you call `unfreeze(model, ['out_head'])` without `freeze_all`
  first, what's the state of the rest of the model? Is that what you
  want?"

### Common pitfalls

1. **Forgetting the trailing dot** — `name.startswith("blocks.1")`
   also matches `blocks.10`, `blocks.11`, `blocks.12`. Use
   `name.startswith("blocks.1.")` or `name == "blocks.1"`.
2. **Order matters** — call `freeze_all` first, then `unfreeze` the
   chosen modules. Reverse order leaves everything trainable.
3. **`.grad is None` vs `.grad == 0`** — for a freshly initialized
   model, frozen params end up with `.grad is None`. After
   `optimizer.zero_grad(set_to_none=False)`, they'd be zeros. Test
   uses `is None` to keep it strict.
4. **Calling `.backward()` twice without zero_grad** — gradients
   accumulate. The test does one forward + one backward; don't loop.

## On Completion

### Insight

You now have ground truth for which parameters the optimizer would
touch. This is the test you should write on day one of every
fine-tuning project — it catches the "I named my unfrozen module
wrong" bug before you waste a GPU hour.

A second insight: `requires_grad=False` only stops *grad computation*
for that parameter. It does NOT stop forward activations from flowing
through it (the params still affect the output). Frozen != removed.

### Bridge

You can swap a head. You can pool. You can freeze. Next: a single
SGD step. Forward, loss on last-token logits, backward, step —
verify loss after < loss before. The smallest training loop that
actually trains.
