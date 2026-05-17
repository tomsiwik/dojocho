# SENSEI — broadcasting

## Briefing

### Goal

Predict the shape of a broadcast op **before** running it. Broadcasting
is the rule that lets `(3, 1) + (1, 4)` produce `(3, 4)` without
writing a single loop — it is the reason PyTorch code looks like math.
Misunderstand it and your attention masks will silently corrupt your
training.

### Tasks

1. Implement `broadcast_shape(a_shape, b_shape)` — return the resulting
   shape of broadcasting two shapes, or raise `ValueError` if they are
   incompatible. (You re-implement the rule. No tensor needed.)
2. Implement `add_row_vector(matrix, row)` — add a row vector
   `(C,)` to every row of a matrix `(R, C)`. Result shape `(R, C)`.
3. Implement `add_col_vector(matrix, col)` — add a column vector
   `(R, 1)` to every column of a matrix `(R, C)`. Result shape `(R, C)`.
4. Implement `outer_sum(a, b)` — given vectors `a` of shape `(M,)` and
   `b` of shape `(N,)`, return an `(M, N)` tensor where
   `result[i, j] = a[i] + b[j]`. Use broadcasting, not loops.
5. Implement `pairwise_diff(points)` — given a `(N, D)` tensor of
   points, return an `(N, N, D)` tensor where
   `result[i, j] = points[i] - points[j]`. This is the building block
   for distance matrices and self-attention.

### Hints

- The rule: align shapes from the **right**. Each dimension must be
  equal, or one of them must be 1, or one shape must be missing that
  dimension. Otherwise: incompatible.
- `tensor.unsqueeze(dim)` adds a size-1 axis. `tensor[:, None]` does
  the same with slicing notation.
- For `outer_sum`, think `a[:, None] + b[None, :]`.

## Prerequisites

- `tensor-basics` (you need shapes to be intuitive before this).

## References

- Raschka appendix A §A.2.3 — "Common PyTorch tensor operations".
- NumPy broadcasting docs (PyTorch follows the same rule):
  https://numpy.org/doc/stable/user/basics.broadcasting.html

## Teaching Approach

Parsons + Socratic. The student should be able to *say the answer
shape aloud* before writing code.

### Socratic prompts

- "Align `(3, 1)` and `(1, 4)` from the right. What does each output
  dim become? Now `(2, 3, 4)` and `(4,)`. Now `(2, 3)` and `(2, 1, 3)`."
- "`(2, 3)` and `(3, 2)` — broadcastable or not? Why? (Hint: align
  right. The rightmost is 3 vs 2 — neither is 1.)"
- "For `pairwise_diff`, what's the shape of `points[:, None, :]`? What
  about `points[None, :, :]`? Subtract them — what do you get?"
- "Why does broadcasting NOT copy memory? (Hint: strides. A size-1
  axis can have stride 0.)"

### Common pitfalls

1. **Aligning from the left** — `(3,)` and `(3, 4)` is incompatible,
   not `(3, 4)`. Right-alignment is what makes a row vector "fit"
   under a matrix.
2. **Trying to add a row vector by transposing** — `(R, C) + (C,)`
   works directly. No transpose needed.
3. **Adding a column vector without an explicit `1` axis** — `(R, C)
   + (R,)` does NOT do what you want. You must reshape the column
   to `(R, 1)` first.
4. **Loops** — if you wrote a `for` in this kata, you missed the
   point. Re-read the hint about `[:, None]`.

## On Completion

### Insight

Broadcasting is just *implicit unsqueeze + implicit expand*. The
expand is free — it uses stride-0 axes, no memory copy. Once this
clicks, attention scores (`Q @ K.transpose(-2, -1) / sqrt(d)`) and
positional bias addition stop looking like magic.

### Bridge

Next: **autograd-hand-vs-machine**. You will compute a derivative on
paper, then watch `.backward()` compute the same thing. Knowing what
autograd does mechanically — and what it does NOT do — is a permanent
skill.
