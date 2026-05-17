# SENSEI — lora-merge

## Briefing

### Goal

LoRA's forward pass is `y = x @ W.T + α(x @ A) @ B`. That's **two**
matmuls where the original needs one. After training, you may want to
ship a model with **zero LoRA overhead** — by folding the adapter back
into a single Linear:

```
W_merged = W_old + (alpha / rank) * (B.T @ A.T)
```

(Note the transpose: PyTorch's `nn.Linear` uses `y = x @ W.T`, so the
effective weight is the transpose of what you'd write on a chalkboard.)

Implement `merge_lora(model)` that walks the model, replaces every
`LoRALinear` with a single `nn.Linear` whose weight is the merged
matrix, and returns the same model.

### Tasks

1. `merge_lora(model)` — for every `LoRALinear` child somewhere in
   `model`, replace it with a single `nn.Linear` whose
   `weight = W_old + (alpha/rank) * (B @ A).T` and `bias` is the
   original bias.
2. The merged model's forward pass should produce **numerically
   identical** output to the LoRA-wrapped model (within float
   tolerance).

A `LoRALinear` class and a `replace_linear_with_lora` helper are
provided in `solution.py`. You only write `merge_lora`.

### Hints

- For `nn.Linear`, `weight` has shape `(out_features, in_features)`.
- `LoRALinear` stores `A: (in, rank)` and `B: (rank, out)`. The product
  `A @ B` has shape `(in, out)`. To match `weight`'s `(out, in)` shape
  you must transpose: `(A @ B).T` or equivalently `B.T @ A.T`.
- Construct the new Linear with `nn.Linear(in_features, out_features,
  bias=(orig.bias is not None))`, then copy the merged weight in via
  `with torch.no_grad(): new_linear.weight.copy_(...)`.
- The traversal pattern is the same as `loraify-model`: snapshot
  `named_modules`, then `setattr(parent, attr, merged)`.

## Prerequisites

- `lora-linear-layer` and `loraify-model`.
- Knowing `nn.Linear` stores `weight` as `(out, in)` (not `(in, out)`).

## References

- LoRA paper §3, equation 3 — the merge formula.
- HuggingFace PEFT `lora/layer.py::Linear.merge` — the production
  version with safety checks (e.g., refusing to merge if dtype mismatch
  or if multiple adapters are active).

## Teaching Approach

### Kata + Socratic on *when*

The mechanic is small. The interesting question is **when you'd
merge**.

### Socratic prompts

- "When you call `merge_lora(model)`, what do you lose? (Answer: the
  ability to swap the adapter or revert to the base model. The base
  weights are gone — overwritten with the merged ones.)"
- "Concretely: name one production scenario where you would NOT merge."
  → Multi-adapter serving (one base model, dozens of customer-specific
  LoRAs swapped at request time — the whole *point* is keeping the
  adapter separate so you don't ship N copies of a 7B model).
- "Name one scenario where you WOULD merge." → Distilling a final
  fine-tuned checkpoint for handoff; eliminating the per-token
  overhead on a single-tenant deployment.
- "What's the rank-shape constraint? Can you merge a rank-8 LoRA into
  a Linear if the Linear is, say, in `bfloat16`? (Yes, but you should
  do the matmul in fp32 then cast back to avoid precision loss.)"

### Common pitfalls

1. **Transpose** — `(A @ B)` is `(in, out)`; `weight` wants `(out, in)`.
   Forgetting the `.T` is the #1 bug. Print `weight.shape` and
   `(A @ B).shape` if confused.
2. **Forgetting the scaling factor** — the merged weight must include
   `alpha / rank`, not just `B @ A`.
3. **Not copying the bias** — `nn.Linear(..., bias=False)` will silently
   drop it. Check `original.bias is not None`.
4. **`weight.data = ...`** — works but bypasses autograd hooks. Use
   `with torch.no_grad(): weight.copy_(...)` instead.

## On Completion

### Insight

Merging is the proof that LoRA is a *constraint on the update*, not a
new kind of layer. After the merge there is no LoRA — just a regular
`Linear` whose weight happens to be of the form `W + ΔW` with `ΔW`
low-rank.

You can also un-merge if you saved A and B separately: `W_old =
W_merged - (α/r)(BA).T`. **In multi-adapter serving, you swap adapters
by adding then subtracting their contributions** — exactly this
arithmetic.

### Bridge

Final kata: `lora-train-vs-full` — train a tiny regressor two ways
(full vs LoRA) and feel the trade-off in trainable param count and
final loss. That's the close on appendix E.
