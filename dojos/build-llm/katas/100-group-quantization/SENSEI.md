# SENSEI — group-quantization

## Briefing

### Goal

Per-tensor int8 (previous kata) uses **one scale for the whole
tensor**. A single outlier destroys precision for every small value.
**Group quantization** is the standard fix used in real systems
(GPTQ, AWQ, bitsandbytes "LLM.int8"): chunk the tensor into groups of
N elements and give each group its own scale.

You will implement the chunk-and-quantize, then measure that the
round-trip error is strictly smaller than per-tensor on tensors with
varying magnitudes.

### Tasks

1. Implement `quantize_group_int8(x, group_size=64) -> (q, scales)`:
   - `x` is a 1-D float tensor whose length is divisible by `group_size`.
   - `q` is an int8 tensor of the same shape.
   - `scales` is a 1-D float tensor of shape `(n_groups,)`.
2. Implement `dequantize_group_int8(q, scales, group_size=64) -> x_hat`:
   - Returns a float32 tensor of the same shape as `q`.

### Hints

- Reshape `x` to `(n_groups, group_size)` and apply the per-tensor
  formula along `dim=1`.
- `x.abs().amax(dim=1)` gives one max per group.
- Watch for zero-norm groups (`scale = 0`); handle them like the
  previous kata.
- Broadcast: `q = round(x / scales[:, None]).clamp(...)` then flatten.

## Prerequisites

- `int8-quantization-roundtrip` — same encoder/decoder, applied per
  group.
- `tensor-basics` — `.reshape`, `.amax`, broadcasting.

## References

- Appendix D §D.1 — memory savings of low-precision weights.
- GPTQ paper (Frantar et al., 2022) — popularized per-group 4-bit.
- bitsandbytes LLM.int8 — Dettmers et al., "8-bit Matrix Multiplication
  for Transformers at Scale".

## Teaching Approach

**Strong Socratic.** This is a *why* kata as much as a *how* kata. Do
not volunteer the answer to "why does group beat per-tensor". Make the
student articulate it.

### Socratic prompts

- "Per-tensor quant gives ONE scale for the whole tensor. Group quant
  gives one scale per `group_size` elements. *Why* does group beat
  per-tensor on tensors with varying magnitudes? Be specific about
  what the scale controls."
- "When would group quant NOT help? Construct a tensor where group and
  per-tensor produce identical error."
- "Group size is a hyperparameter. What does `group_size=1` give you?
  What does `group_size=len(x)` give you? Where on that spectrum do
  GPTQ/AWQ live, and why?"
- "Memory cost: per-tensor stores `n` int8s + 1 float. Group stores
  `n` int8s + `n/group_size` floats. For `group_size=64` and float16
  scales, what's the percentage overhead per parameter?"
- "The comparison test uses *total squared error* (SSE), not max
  error. Why? (Hint: max error is dominated by the outlier group in
  *both* schemes — they tie. The win is on the many small values.)"
- "On what input would group and per-tensor produce identical SSE?
  Hint: a tensor with the same magnitude in every group."

### Common pitfalls

1. **Forgetting to broadcast** — `x / scales` fails on shape mismatch.
   Use `scales[:, None]` (or `unsqueeze(-1)`).
2. **Dimension confusion after reshape** — `(n_groups, group_size)` not
   `(group_size, n_groups)`. The first axis groups; the second is
   intra-group.
3. **Zero-magnitude groups** — a chunk of all zeros has `scale=0`.
   Same guard as the previous kata, applied per group.
4. **Returning `scales` as a list of floats** — keep it a tensor; tests
   require `.shape`.

## On Completion

### Insight

You just compressed the dynamic range of each group independently.
The outliers only ruin their own group, not the whole tensor. This is
why every modern 4-bit quantization scheme uses groups (usually 64 or
128) — the metadata overhead is tiny (one fp16 scale per 64 weights ≈
0.25 bits per weight) and the quality recovery is large.

The trade-off you can now reason about: smaller groups → less error,
more scales. Larger groups → cheaper but coarser. Production setups
benchmark this on real model perplexity.

### Bridge

Final kata in this appendix: **model-parallel-2device**. When even
quantized weights don't fit on one GPU, you split the *layers* across
devices. You'll simulate a 2-device forward pass and observe the cost
that quantization can't fix: cross-device transfers.
