# SENSEI — layer-norm

## Briefing

### Goal

Implement `LayerNorm` from scratch as an `nn.Module` and verify it
matches `torch.nn.LayerNorm` numerically. Layer normalization is the
first true building block of a transformer — every block uses it twice,
plus once more at the very end of the stack.

### Tasks

1. Implement `LayerNorm(emb_dim)` as an `nn.Module`:
   - `scale` parameter: `torch.ones(emb_dim)`, trainable.
   - `shift` parameter: `torch.zeros(emb_dim)`, trainable.
   - `eps = 1e-5`.
2. In `forward(x)`:
   - Mean and variance over the **last** dim (`dim=-1`,
     `keepdim=True`).
   - Use `unbiased=False` for variance (biased estimator, matches GPT-2).
   - Return `scale * (x - mean) / sqrt(var + eps) + shift`.

### Hints

- `x.mean(dim=-1, keepdim=True)` and `x.var(dim=-1, keepdim=True, unbiased=False)`.
- Register `scale` and `shift` via `nn.Parameter(...)` — otherwise they
  won't get gradients or appear in `.state_dict()`.
- `eps` goes *inside* the sqrt, not outside.

## Prerequisites

- Chapter 3 katas (you know `nn.Module`, `nn.Parameter`).
- Comfortable with PyTorch broadcasting.

## References

- Raschka chapter 4 §4.2, Listing 4.2.
- `torch.nn.LayerNorm` — https://docs.pytorch.org/docs/stable/generated/torch.nn.LayerNorm.html
- Ba, Kiros, Hinton (2016), "Layer Normalization" — https://arxiv.org/abs/1607.06450

## Teaching Approach

Worked example (math is in the chapter) + Socratic on placement.

### Socratic prompts

- "Pre-norm vs post-norm — what did Vaswani et al. (2017) use? What
  does GPT-2 use? Which is the modern convention?"
  (Answer: original was post-norm; GPT-2 is pre-norm; pre-norm wins
  on training stability for deep stacks.)
- "Why normalize over the embedding dim and not the batch? What does
  BatchNorm assume about batch size that LayerNorm doesn't?"
- "Why `unbiased=False`? When would the difference matter?"
  (Almost never — it's `1/n` vs `1/(n-1)` and `n=768`. The reason is
  compatibility with TensorFlow's default, which the original GPT-2
  used.)
- "What do `scale` and `shift` recover that the normalization
  destroys?" (Any affine post-normalization; they let the layer
  *undo* normalization if that's optimal.)

### Common pitfalls

1. **Forgetting `nn.Parameter`** — `self.scale = torch.ones(...)` makes
   it a buffer, not trainable. The test for `len(list(parameters()))`
   will catch this.
2. **`unbiased=True`** — small numerical difference from
   `nn.LayerNorm`. `assert_close` with `atol=1e-5` will fail.
3. **Normalizing over the wrong dim** — `dim=0` averages across the
   batch, which is BatchNorm, not LayerNorm.
4. **`eps` outside the sqrt** — `sqrt(var) + eps` vs `sqrt(var + eps)`
   diverges only when `var` is tiny, but tests pick inputs that expose it.

## On Completion

### Insight

You wrote ~6 lines of math and got bit-for-bit parity with PyTorch's
production layer. Now you can read `nn.LayerNorm` and understand
exactly what it does — the only "magic" was naming.

LayerNorm is the *only* normalization in a modern transformer block.
There is no BatchNorm, no GroupNorm, no InstanceNorm. The reason is
operational: LayerNorm is independent of batch size, which means it
behaves identically at train time (batch=64) and inference time
(batch=1) and during distributed training (sharded batches). The
"obvious" choice turns out to be the right one for sequence models.

### Bridge

Next: `gelu`. You'll implement the activation function GPT-2 uses
between the two linear layers of the feed-forward block — and discover
why a smooth ReLU was worth inventing.
