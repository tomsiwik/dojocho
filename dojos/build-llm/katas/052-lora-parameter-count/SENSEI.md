# SENSEI — lora-parameter-count

## Briefing

### Goal

Make the savings **concrete**. A LoRA-wrapped `Linear(768, 768)`
trades 768² = 589,824 trainable parameters for `768·r + r·768 =
1,536·r` trainable parameters. At `r=8`, that's 12,288 — a **48×
reduction**. Compute it for arbitrary models.

### Tasks

1. `count_trainable(model)` — return the total number of *trainable*
   parameters (those with `requires_grad=True`), summing `numel()`.
2. `count_total(model)` — return the total number of parameters
   regardless of `requires_grad`.

That's it. Two short functions; the test does the arithmetic.

### Hints

- `model.parameters()` yields every `nn.Parameter` in the module tree
  (recursive — no need to walk children manually).
- `p.numel()` is the count of scalars in a tensor.
- `p.requires_grad` is the trainable flag.

## Prerequisites

- `lora-linear-layer` (you wrap a Linear in a LoRA module).
- Knowing how `nn.Module.parameters()` traverses children
  (build-llm ch3).

## References

- PyTorch `nn.Module.parameters()` docs.
- Raschka appendix E §E.4 prints the same counts (124,441,346 →
  2,666,528 after LoRA, ~47× reduction).

## Teaching Approach

### Drill + Socratic on the trade-off

This is a small computation kata. Run the test, fix the count, move on.
But the test parameters tell a story — pause on each:

- "For a `Linear(768, 768)`: how many params total? Now wrap it with
  LoRA(rank=8): how many *trainable* params? What ratio?"
- "Same Linear, rank=64: how many trainable? Why does the savings ratio
  shrink as `r` grows?"
- "At what rank does LoRA stop saving parameters? (Trick: when
  `2·d·r ≥ d²`, i.e. `r ≥ d/2`. For `d=768`, that's `r ≥ 384` —
  you'd never use rank that high.)"

### Common pitfalls

1. **Counting `Parameter` objects, not scalars** — `len(list(model.parameters()))`
   counts *tensors*; you want `sum(p.numel())`.
2. **Filtering with `if p.requires_grad`** for `count_total` — that's
   the bug for the trainable function. Keep them straight.
3. **Bias parameters** — `nn.Linear(d, d)` has `d² + d` params (weight
   + bias). Tests account for this.

## On Completion

### Insight

The savings ratio is `d / (2r)`. At `d=4096` (Llama 7B's hidden size),
`r=8`: 256× fewer trainable params. **Per layer.** A typical 7B model
has ~32 layers × ~7 LoRA-able Linears = ~224 wrapped layers, and the
ratio holds globally.

But trainable param count is only one of two wins. The bigger win in
practice is **optimizer state**: Adam stores `m` and `v` per trainable
parameter, so optimizer state shrinks by the same ratio. On a 7B model
with Adam in fp32, that's ~56 GB → ~250 MB. **That's why LoRA fits on
consumer GPUs.**

### Bridge

Next: `loraify-model` — automate "wrap every Linear in a real model
with `LoRALinear`". You'll write the traversal, then count again to
confirm the wins compound.
