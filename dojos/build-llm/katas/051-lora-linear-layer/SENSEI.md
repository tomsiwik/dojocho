# SENSEI — lora-linear-layer

## Briefing

### Goal

A 7B-parameter model has, well, 7 billion parameters. Fine-tuning all
of them on one downstream task means producing one 7B checkpoint *per
task*, plus paying the optimizer-state memory cost (Adam ~3× the
parameter count). **LoRA** sidesteps both: freeze the original weight
matrix `W` and learn a low-rank *update* `ΔW = α · B @ A` that gets
added at inference.

This kata is the heart of the technique. You will wrap an existing
`nn.Linear` so it computes

```
y = x @ W_old.T + α · (x @ A) @ B
```

where `W_old` is frozen and only `A`, `B` are trained.

### Tasks

1. Implement `class LoRALinear(nn.Module)`:
   - `__init__(self, linear: nn.Linear, rank: int, alpha: float)`
     stores the wrapped `linear` and creates two trainable parameters
     `A` of shape `(in_features, rank)` and `B` of shape
     `(rank, out_features)`.
   - **Freeze** `linear.weight` and `linear.bias` (set
     `requires_grad=False`).
   - **Initialize** `A` with `nn.init.kaiming_uniform_(A, a=math.sqrt(5))`
     and `B` with zeros.
   - **Scaling**: store `self.scaling = alpha / rank`.
2. `forward(self, x)` returns `linear(x) + scaling * (x @ A @ B)`.

### Hints

- `nn.Parameter(torch.empty(in_features, rank))` then init in-place.
- Don't reassign `.weight` — set `linear.weight.requires_grad = False`.
- `math.sqrt(5)` matches PyTorch's default `Linear` init exactly — the
  same A-init avoids surprises when the user expects "vanilla" behavior.
- Because `B` starts at zero, the LoRA branch contributes **exactly zero**
  at step 0 — the wrapped model produces identical outputs to the
  original. Verify this property; the test checks it.

## Prerequisites

- Familiarity with `nn.Module`, `nn.Parameter`, and forward-pass
  composition (build-llm ch3-ch4).

## References

- LoRA paper, Hu et al. 2021 — https://arxiv.org/abs/2106.09685
  (read §3 "Our Method", figure 1 is the picture).
- Raschka appendix E §E.4 — listing E.5/E.6 is the same construction
  split across two modules; this kata fuses them.
- HuggingFace PEFT `lora/layer.py` — production-grade version with
  dropout, multi-adapter merging, etc.

## Teaching Approach

### Socratic prompts

- "Fine-tuning a 7B model means updating 7B numbers. You want to update
  ~1% of that. **Constraint:** whatever you change must be expressible
  as an *added* matrix `ΔW` of the same shape as `W` — so inference
  code doesn't change. How do you parameterize a `d × d` matrix using
  *far fewer* than `d²` numbers?"
- (After they suggest something) → "Low-rank factorization. If
  `ΔW = B @ A` with `A: (d, r)` and `B: (r, d)`, how many parameters?
  For `d=768, r=8`?"
- "Why does `B` start at zero? What happens at step 0 if `A` is random
  and `B` is also random?"
- "Why scale by `α/r`? What goes wrong if you increase `r` without
  scaling? (Hint: the magnitude of `BA`.)"
- After it works: "What gradients flow through `W_old`? Trace one step
  of backprop in your head."

### Common pitfalls

1. **Shape mismatch on the LoRA branch** — `x @ A` is `(*, rank)`, then
   `... @ B` is `(*, out_features)`. Print shapes if confused.
2. **Forgetting to freeze `W_old`** — the test counts trainable params;
   if `linear.weight.requires_grad` is still True, you'll fail it.
3. **Initializing B with `kaiming` too** — then `BA` is nonzero at
   step 0 and the model output drifts from the original immediately.
4. **Hardcoding `alpha == rank`** — store the ratio. A=16, r=8 is a
   common tuning.

## On Completion

### Insight

`ΔW = BA` is a *rank-r constraint* on the update. You're betting that
the "useful" direction of fine-tuning lives in a low-dimensional
subspace of weight space — empirically, for downstream-task adaptation,
it does. This is why LoRA works at all.

You also got a freebie: because `B = 0` at init, the wrapped model is
*bit-identical* to the original until you take a gradient step. No
"warm-up drift" to debug.

### Bridge

Next: `lora-parameter-count` — make the savings concrete. You'll
compute exactly how many parameters you spared, for a representative
Linear(768, 768).

After that: `loraify-model` (sweep every Linear in a model) and
`lora-merge` (collapse `W_old + αBA` back into one matrix for
zero-overhead inference).
