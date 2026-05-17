# SENSEI — tensor-basics

## Briefing

### Goal

Make tensors feel like ordinary containers with a `.shape`. Build
scalars, vectors, matrices, and 3D tensors, then reshape, view, and
transpose them. Every shape mistake in the next 100 katas starts here.

### Tasks

1. Implement `make_scalar(x)` — return a 0-D tensor with value `x`
   (shape `()`).
2. Implement `make_vector(values)` — return a 1-D tensor from a Python
   list (shape `(N,)`).
3. Implement `make_matrix(rows)` — return a 2-D tensor from a list of
   lists (shape `(R, C)`).
4. Implement `make_3d(shape, fill)` — return a 3-D tensor of the given
   shape filled with `fill`.
5. Implement `reshape_to(t, new_shape)` — return `t` with the requested
   shape. Use `.reshape`.
6. Implement `view_to(t, new_shape)` — same idea, but use `.view`. (You
   will discover when `.view` refuses and `.reshape` does not.)
7. Implement `transpose_2d(t)` — swap the two axes of a matrix.

### Hints

- `torch.tensor(x)` infers dtype and shape from a Python object.
- `torch.full(shape, fill_value)` builds a filled tensor in one call.
- `.reshape` always works; `.view` requires contiguous memory.
- `.transpose(0, 1)` swaps two axes. For a 2-D matrix, `.T` is the same.

## Prerequisites

None for PyTorch. Python lists and basic numeric types.

## References

- Raschka appendix A §A.2 — "Understanding tensors".
- PyTorch docs: https://pytorch.org/docs/stable/tensors.html
- `torch.Tensor.view` vs `.reshape`:
  https://pytorch.org/docs/stable/generated/torch.Tensor.view.html

## Teaching Approach

Drill kata: the failing tests are the teacher. Volunteer hints only on
request.

### Socratic prompts

- "Before you run the test, predict the shape. What does
  `torch.tensor(3.0).shape` print? What about `torch.tensor([3.0]).shape`?
  Why are they different?"
- "`.reshape(6)` on a 2x3 matrix gives a vector of length 6. What did
  the underlying memory have to do? Anything?"
- "Transpose a 2x3 to 3x2. Is the result contiguous? Try `.view` on
  it — what error do you get? Now try `.reshape`. What does PyTorch do
  under the hood to make it work?"

### Common pitfalls

1. **0-D vs 1-D confusion** — `torch.tensor(3.0)` is shape `()`;
   `torch.tensor([3.0])` is shape `(1,)`. They are NOT the same.
2. **`.view` on non-contiguous tensors** — after `.transpose`, memory
   is no longer contiguous. `.view` raises; `.reshape` either returns
   a view or silently copies.
3. **Reshape size mismatch** — `(2, 3).reshape(2, 4)` raises. Product
   of dims must be preserved.

## On Completion

### Insight

A tensor is just a flat array plus a (shape, stride) interpretation.
`.view` is free — it reinterprets the same memory. `.reshape` may need
to copy when the request is incompatible with the current strides.
This distinction will matter every time you debug a "non-contiguous"
error in attention or in mixed-precision training.

### Bridge

Next: **broadcasting**. Two tensors with different shapes can still
participate in the same op, as long as their shapes are "broadcast
compatible". You will predict shapes before running.
