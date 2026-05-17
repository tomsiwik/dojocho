# SENSEI — nn-module-subclass

## Briefing

### Goal

Build the same 2-layer MLP three different ways. Verify all three
compute the exact same function. Develop taste for *when* to reach for
each.

The three forms:
- `nn.Sequential` — declarative, terse, no state.
- `nn.Module` subclass — explicit, hooks-friendly, can hold state.
- Pure function with explicit weight tensors — no `nn` at all; you
  pass `(W1, b1, W2, b2)` and do the matmuls yourself.

### Tasks

Each form implements: `Linear(in=4, out=8) → ReLU → Linear(in=8, out=2)`.

1. Implement `build_sequential()` — returns an `nn.Sequential` with
   the layers above.
2. Implement `MLPModule(nn.Module)` — subclass with `__init__` that
   constructs two `nn.Linear` layers, and `forward(x)` that applies
   them with ReLU in between.
3. Implement `mlp_functional(x, W1, b1, W2, b2)` — pure function. No
   `nn`. Use `torch.relu` and matmul (`@`) directly. The weight
   conventions match `nn.Linear`: `out = x @ W.T + b`.
4. Implement `copy_weights_into(module, sequential)` — copy the
   weights from `MLPModule` into the `nn.Sequential` so that the two
   compute the same function. (You need to know which submodules
   inside the `Sequential` are the linear layers — print it.)

### Hints

- `nn.Linear(in_f, out_f)` stores `weight` (shape `(out_f, in_f)`) and
  `bias` (shape `(out_f,)`). The forward is `x @ weight.T + bias`.
- For `nn.Sequential`, index into it like a list:
  `seq[0]` is the first layer.
- To copy weights without breaking autograd, wrap the assignment in
  `with torch.no_grad():` (or use `.data` — `no_grad` is cleaner).
- For `mlp_functional`, the formula per layer is exactly
  `x @ W.T + b`.

## Prerequisites

- `tensor-basics`, `broadcasting`, `autograd-hand-vs-machine`.

## References

- Raschka appendix A §A.5 — "Implementing multilayer neural networks".
- `torch.nn.Module`:
  https://pytorch.org/docs/stable/generated/torch.nn.Module.html
- `torch.nn.Sequential`:
  https://pytorch.org/docs/stable/generated/torch.nn.Sequential.html

## Teaching Approach

Use-Modify-Create. They use `nn.Sequential` (terse), modify it into an
`nn.Module` (state-bearing), then create the same forward pass from
first principles (no `nn`).

### Socratic prompts

- "All three forms must compute *exactly* the same function on the
  same input. What would have to be true about their weights for that
  to happen?"
- "When would you reach for `nn.Sequential`? When for an `nn.Module`
  subclass? When for pure functional?" (Answers: Sequential for quick
  prototypes; subclass when you need state, multiple forward paths,
  hooks, or registered buffers; functional when you want maximum
  control — e.g., research code, JAX-style transforms.)
- "Try `print(MLPModule())`. Now `print(build_sequential())`. What
  changes between the two? What's preserved?"
- "In `mlp_functional`, you do `x @ W1.T + b1`. Why the `.T`? (Hint:
  `nn.Linear.weight` is shape `(out, in)`.)"

### Common pitfalls

1. **Forgetting ReLU between layers** — without nonlinearity, your
   "MLP" is just one big linear map. Test will catch it by design (the
   weights of the three forms won't match through the activation).
2. **Wrong weight orientation** — if you write `x @ W` (no `.T`), the
   shapes won't match. Read the `nn.Linear` docs once more.
3. **Copying weights without `no_grad`** — assigning to a leaf
   parameter that has `requires_grad=True` raises. Use
   `with torch.no_grad():` around the copies.
4. **Mutating `weight` vs `.data`** — easiest path is
   `dst.weight.copy_(src.weight)` inside a `no_grad` block.

## On Completion

### Insight

`nn.Sequential` and `nn.Module` are sugar — convenient bookkeeping on
top of `Parameter` tensors. Underneath, every forward pass is just
matmul + bias + nonlinearity, exactly like your functional version.
When debugging shapes in a transformer, drop down to the functional
view in your head: "what is the tensor at this seam?" The class
hierarchy is decoration.

For research, functional is closest to the math; you can swap
optimizers, add gradient transforms, vmap, jvp, etc. For production,
the `nn.Module` API integrates with checkpoints, distributed training,
and `torch.compile` — that's why everyone uses it.

### Bridge

Next: **train-xor-mlp**. You will give the MLP teeth — a loss, an
optimizer, and 1000 steps to learn XOR (which a single linear layer
provably cannot).
