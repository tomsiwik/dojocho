# SENSEI — model-memory-footprint

## Briefing

### Goal

Turn "how big is a 70B model?" from a vague worry into mechanical
arithmetic. Compute bytes from parameter count and dtype, then pick the
cheapest dtype that fits into a given amount of memory.

Appendix D table D.2 gives bf16 estimates (about 2 bytes per param). You
will generalize that table.

### Tasks

1. Implement `model_memory(n_params, dtype='float16') -> int` returning
   total weight bytes for that dtype.
2. Implement `cheapest_dtype_that_fits(n_params, available_bytes) -> str`
   returning the highest-precision dtype whose weights fit, or `None`
   if even int4 does not fit.

### Bytes-per-parameter table

| dtype                  | bytes |
|------------------------|------|
| `float32`              | 4    |
| `float16` / `bfloat16` | 2    |
| `int8`                 | 1    |
| `int4`                 | 0.5  |

For `int4`, total bytes is `n_params // 2` (round down — packed nibbles).

Precision ranking, highest to lowest:
`float32 > bfloat16 == float16 > int8 > int4`.

### Hints

- `int4` packs two values per byte; ignore alignment/padding edge cases.
- Use a lookup dict for `{dtype: bytes_per_param}`.
- For `cheapest_dtype_that_fits`, walk the ranking from highest to
  lowest and return the first dtype whose `model_memory` fits.

## Prerequisites

None — this is pure arithmetic, no PyTorch needed.

## References

- Appendix D §D.1, table D.2 — bf16 memory estimates for Qwen3 1.7B–32B.
- Raschka LLMs-from-scratch ch05/08 — memory-efficient weight loading.

## Teaching Approach

Drill kata. The arithmetic is the point. Don't volunteer hints; let the
tests be the teacher.

### Socratic prompts

- "A 70-billion parameter model in float32. How many bytes? How many
  gigabytes? Now switch to int8 — how much did you save? At what cost?"
- "You have a 24 GB GPU. What is the largest fp16 model you can load
  (just the weights, ignore activations and KV cache)?"
- "Why does `bfloat16` use the same number of bytes as `float16` but is
  preferred for training? (Hint: same total bits, different bit
  allocation — bf16 has more exponent.)"
- "Real inference needs more than just weights — activations, KV cache,
  workspace. If your tool says 'fits' for the weights, what could still
  blow up at runtime?"

### Common pitfalls

1. **Forgetting int4 packs** — two int4 values per byte. `1_000` params
   in int4 is `500` bytes, not `1_000`.
2. **Returning float vs int** — `model_memory` returns `int`. Use
   integer division (`//`) at the boundary.
3. **Off-by-one in cheapest_dtype** — "fits" is `<=`, not `<`. A model
   whose weights are *exactly* `available_bytes` fits.

## On Completion

### Insight

Memory is the gating constraint for serving LLMs. The same model is
either trivial or impossible to run depending on dtype. This is why
quantization matters: dropping from fp16 to int4 takes a 14B model from
"needs a 28 GB GPU" to "fits on a 7 GB laptop GPU" — at the cost of
some quality.

The next two katas (`int8-quantization-roundtrip`,
`group-quantization`) make the *cost* concrete. You'll measure the
round-trip error you just bought yourself.

### Bridge

Next: **int8-quantization-roundtrip**. Implement symmetric int8
quantization yourself and measure the reconstruction error. Then
`group-quantization` shows how to drive that error down.
