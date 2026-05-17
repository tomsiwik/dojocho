# SENSEI — Causal Attention Mask

## Briefing

### Goal

Stop the model from cheating. In **causal** (a.k.a. *masked*)
attention, position *i* may attend to positions 0..*i* but not *i+1*
onward. Without this, training a next-token predictor on a sequence
would let position 5 read position 6 — the very token it is supposed to
predict — and your model would learn nothing.

You'll implement the standard trick: fill the upper-triangular slots
of the attention-score matrix with `-inf` *before* softmax. Because
`softmax(-inf) = 0`, those positions contribute zero weight.

### Tasks

1. Implement `causal_mask(T)` — return a boolean tensor of shape
   `(T, T)` where `mask[i, j] = True` iff `j > i` (the cells to mask).
2. Implement `apply_causal_mask(scores, mask)` — return scores with
   masked positions set to `-inf`. Don't mutate the input; return a new
   tensor.
3. Implement `causal_attention(Q, K, V)` — full forward pass with mask
   and `1/sqrt(d_k)` scale.
4. Implement `CausalAttention(d_in, d_out, context_length)` — `nn.Module`
   with `W_q`, `W_k`, `W_v` (no bias) and a *registered buffer* named
   `mask` of shape `(context_length, context_length)`.

### Hints

- `torch.triu(torch.ones(T, T), diagonal=1).bool()` gives you exactly
  the upper-triangular boolean mask (zeros on/below the diagonal,
  ones above).
- `scores.masked_fill(mask, float('-inf'))` is the non-mutating variant.
  `masked_fill_` mutates; pick one and stay consistent.
- For arbitrary `T <= context_length`, slice the mask:
  `self.mask[:T, :T]`.
- `register_buffer('mask', ...)` stores a non-trainable tensor that
  moves with `.to(device)` and shows up in `state_dict`. The chapter
  explains why this matters in §3.5.3.

### A small demo to run first

```python
import torch
s = torch.tensor([[1.0, 2.0, 3.0, 4.0],
                  [1.0, 2.0, 3.0, 4.0],
                  [1.0, 2.0, 3.0, 4.0],
                  [1.0, 2.0, 3.0, 4.0]])
m = torch.triu(torch.ones(4, 4), diagonal=1).bool()
masked = s.masked_fill(m, float('-inf'))
print(masked)
print(torch.softmax(masked, dim=-1))
```

Look at row 0. Only position 0 has any weight. Look at row 3 — all four
positions have weight, summing to 1. That is causal attention.

## Prerequisites

- `simplified-self-attention`
- `qkv-projections`
- `scaled-dot-product-attention`

## References

- Raschka chapter 3 §3.5 — "Hiding future words with causal attention"
  (figures 3.19–3.21; the "negative infinity *before* softmax" trick is
  in §3.5.1, figure 3.21).
- Raschka chapter 3 §3.5.3, listing 3.3 — `CausalAttention` class.
- `torch.triu` — https://pytorch.org/docs/stable/generated/torch.triu.html
- `Tensor.masked_fill` — https://pytorch.org/docs/stable/generated/torch.Tensor.masked_fill.html
- `Module.register_buffer` — https://pytorch.org/docs/stable/generated/torch.nn.Module.html#torch.nn.Module.register_buffer

## Teaching Approach

Demo-driven. **Run the demo above first.** Then Socratic.

### Socratic prompts

- "Why mask the *scores* with `-inf` instead of zeroing the *weights*
  after softmax?" (If you zero weights post-softmax, your rows no
  longer sum to 1 — you'd need to renormalize. The chapter shows the
  two-step approach in figure 3.20 and then upgrades to the one-step
  `-inf` approach in figure 3.21. Both work; the latter is cleaner.)
- "Future-token V vectors will contribute 0 to the weighted sum
  anyway. Why not just *slice* the tensor — compute attention only
  over positions 0..i — and skip the masked positions entirely?"
  (Two reasons: (1) different positions in the same sequence need
  different effective lengths, so you can't slice uniformly across a
  batch; (2) GPUs love uniform shapes — a single mask + a single
  matmul is faster than a Python loop over per-position slices.)
- "Why `register_buffer` and not just `self.mask = ...`?" (Buffer
  moves with `.to(device)`; a plain attribute doesn't, which causes
  device-mismatch errors during GPU training.)
- "Should the mask be `requires_grad=True`?" (No; it's a constant
  pattern, no learning. Buffers default to no grad.)

### Common pitfalls

1. **Off-by-one on the diagonal** — `diagonal=0` would mask the
   diagonal too (position *i* can't see itself, which is wrong). Use
   `diagonal=1`.
2. **Masking after softmax** — kills the row-sum-1 invariant; you'd
   need to renormalize.
3. **Storing the mask as a plain attribute** — passes single-device
   tests, breaks under `.to('cuda')`. Use `register_buffer`.
4. **Hardcoding `T`** — `forward` must work for any `T <=
   context_length`. Slice `self.mask[:T, :T]`.
5. **`masked_fill_` followed by re-use** — in-place ops can surprise
   you if you cached `scores`. The tests use a fresh score tensor each
   call; either variant is fine here.

## On Completion

### Insight

Causal masking is **information hiding via numerics**. You didn't
change the architecture, didn't add parameters, didn't change the
forward graph — you just changed some entries of one matrix to
`-inf` and softmax did the rest. This is also why decoder-only LLMs
can be trained with *one* forward pass per sequence: every position
predicts its own next token in parallel, but the mask makes sure no
position sees the answer.

### Bridge

Kata `multihead-attention-naive` introduces *parallel heads* — running
attention several times with different learned projections and
concatenating. You'll first build the naive `ModuleList` version (slow,
clear), then the efficient `view` + `transpose` version (fast,
unfamiliar syntax).
