# SENSEI — int8-quantization-roundtrip

## Briefing

### Goal

Implement symmetric per-tensor int8 quantization from scratch, then
dequantize and measure the round-trip error. This is the operation that
shrinks a model's weights from 2 bytes/param to 1 byte/param — at a
controlled cost.

### Background

Symmetric quantization maps a float tensor `x` to int8 (range -127 to
127) by a single scaling factor:

```
scale = max(|x|) / 127
q = round(x / scale).clamp(-127, 127).to(int8)
x_hat = q.to(float) * scale
```

A single `scale` for the whole tensor is called **per-tensor**
quantization. Round-trip error per element is at most `scale / 2`, i.e.
`max(|x|) / 254` ≈ `max(|x|) / 127`-half. We will assert a slightly
looser bound (`max(|x|) / 127`) so rounding direction is not assumed.

### Tasks

1. Implement `quantize_int8(x) -> (q, scale)`:
   - `x` is a 1-D float tensor.
   - `q` is an `int8` tensor of the same shape.
   - `scale` is a Python `float`.
2. Implement `dequantize_int8(q, scale) -> x_hat`:
   - Returns a `float32` tensor of the same shape as `q`.
3. Edge case: when `x` is all zeros, `scale` is `0.0` and `q` is all
   zeros. Dequantizing returns all zeros without dividing by zero.

### Hints

- `x.abs().max()` gives the symmetric absolute range.
- `torch.round(...).clamp(-127, 127).to(torch.int8)` is the typical
  encoder.
- `q.to(torch.float32) * scale` is the decoder.
- For the all-zeros edge case, branch on `max_abs == 0`.

## Prerequisites

- `tensor-basics` — `.abs()`, `.max()`, `.to(dtype)`.
- `model-memory-footprint` — why quantization saves bytes.

## References

- Appendix D §D.1 — bf16 → int8 is one of the standard memory tricks.
- Raschka LLMs-from-scratch ch05/08 — memory-efficient weight loading.
- PyTorch docs on `torch.quantize_per_tensor` (for comparison only — you
  are writing the math by hand).

## Teaching Approach

**Worked example + Socratic.** The math is on one page. The pedagogical
weight is on the *error*: what did you just introduce, and can you
shrink it?

### Socratic prompts

- "Before you run dequantize: predict the error. Each int8 value covers
  a slice of width `scale`. What's the maximum reconstruction error per
  element?"
- "Your tensor has one big outlier and a thousand small values. What
  does that do to `scale`? What does that do to the precision of the
  small values?"
- "If you double `max(|x|)`, what happens to the per-element error? Is
  the error scale-invariant?"
- "Imagine your tensor is all zeros. What is `scale`? What did your
  code just divide by?"

### Common pitfalls

1. **Dividing by zero on all-zero tensors** — `max(|x|) == 0` makes
   `scale = 0`. Guard before the division.
2. **Asymmetric clamping** — int8 range is `-128..127`. Symmetric
   quantization clamps to `-127..127` so the positive and negative
   sides are balanced.
3. **Returning the wrong dtype** — `q` must be `torch.int8`, not
   `int32` or `float`. Tests check `.dtype` explicitly.
4. **Forgetting to round** — `(x / scale).to(int8)` truncates toward
   zero. Use `torch.round`.

## On Completion

### Insight

One scale for an entire tensor is brutal: a single outlier compresses
the precision of every other value. You've discovered the central
tension of quantization — fewer bits means coarser representation, and
"coarseness" is set by the *range*, not the *typical value*.

The next kata (`group-quantization`) is the standard fix: chunk the
tensor and give each chunk its own scale. The outlier only ruins its
own group.

### Bridge

Next: **group-quantization**. Same encoder/decoder, but per `group_size`
elements. The round-trip error drops, the byte cost is barely higher
(one extra scale per group), and you've reproduced the core trick
behind GPTQ/AWQ-style 4-bit quantization.
