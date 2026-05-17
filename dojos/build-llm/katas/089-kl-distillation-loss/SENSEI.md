# SENSEI — kl-distillation-loss

## Briefing

### Goal

Implement the **soft-label distillation loss** introduced by Hinton et
al. (2015) — the *Distilling the Knowledge in a Neural Network* loss
that started this whole subfield. Concretely:

```
kl_loss = T**2 * KL( softmax(teacher / T) || softmax(student / T) )
```

averaged over the batch, where `T` is the **temperature**. Higher T
softens both distributions and reveals more of the teacher's
"dark knowledge" about which wrong answers are still plausible.

### Tasks

Implement one function in `solution.py`:

```python
def kl_loss(
    student_logits: torch.Tensor,  # (B, V) or (B, T, V)
    teacher_logits: torch.Tensor,  # same shape as student
    T: float,
) -> torch.Tensor:  # scalar
```

- Compute `KL(teacher_soft || student_soft)` where both are softened by
  dividing logits by `T`.
- Multiply the result by `T**2` (this is the gradient-magnitude fix
  from Hinton's paper — see Socratic prompts).
- Average over the batch (and sequence, if 3D). Return a 0-dim tensor.

### Hints

- `F.kl_div(input, target, reduction=..., log_target=...)` — note the
  PyTorch quirk: the *first* argument is **log-probs of the student**,
  the *second* is **probabilities of the teacher**. (Or both
  log-probs, with `log_target=True`.) It computes
  `KL(target || input)`.
- `F.log_softmax(x / T, dim=-1)` is your friend — more numerically
  stable than `log(softmax(...))`.
- `reduction="batchmean"` divides by the **batch size**, which is what
  the Hinton paper specifies. Beware `reduction="mean"` — it divides
  by `batch * vocab`, which is wrong (a factor of V off).

## Prerequisites

- Familiarity with cross-entropy and softmax (kata
  `cross-entropy-from-logits`).
- You know `torch.nn.functional as F`.

## References

- Hinton, Vinyals, Dean (2015) *Distilling the Knowledge in a Neural
  Network* — https://arxiv.org/abs/1503.02531
- Raschka, *Build a Reasoning Model from Scratch*, chapter 8 §8.1 —
  "Introduction to model distillation". Note the book focuses on
  *hard* distillation; this kata covers the *soft* variant.
- PyTorch `F.kl_div`:
  https://pytorch.org/docs/stable/generated/torch.nn.functional.kl_div.html

## Teaching Approach

**Strong Socratic.** This is a 3-line function but it packs three
non-obvious decisions: which direction is the KL, why divide by T,
why multiply by T**2.

### Socratic prompts

- **The point of soft labels.** "Hard label: '7' is the right token,
  everything else is wrong. Teacher distribution: '7' (0.85),
  '7.0' (0.10), '6.9' (0.04), 'cat' (1e-8). What information about
  the world does the teacher's distribution carry that the hard
  label throws away?" (Answer: similarity structure. '7.0' is *much*
  more like '7' than 'cat' is. The student learns the geometry of
  the vocabulary, not just the right answer.)

- **Why divide by T.** "If you softmax raw logits from a confident
  teacher, you get ~[0.999, 0.0001, ...]. The 'dark knowledge' about
  similarity collapses. What does `softmax(logits / T)` for T=4 do
  to that distribution?" (Spreads probability mass to the
  alternatives so they actually contribute to the loss.)

- **Why multiply by T**². "The gradient of `softmax(x/T)` with
  respect to x is scaled by `1/T`. When you compose with another
  `1/T` from the KL, gradients scale as `1/T²`. So if you change T,
  your effective learning rate changes. The `T²` prefactor cancels
  this so you can tune T independently of the optimizer." (This is
  the single most-missed detail in distillation implementations.)

- **Direction of the KL.** "`F.kl_div(input, target)` computes
  `KL(target || input)`. We want
  `KL(teacher_soft || student_soft)` — which goes in which slot?"
  (Teacher → `target`, student → `input`. PyTorch's argument naming
  reads as "input is what we're optimizing".)

- **After it passes.** "If T=1, this should equal an ordinary KL on
  the raw distributions — and the `T²` factor reduces to 1. Sanity
  check that — does the test confirm it?"

### Common pitfalls

1. **Wrong reduction.** `reduction="mean"` divides by `B*V`, off by
   a factor of V. Use `reduction="batchmean"` (or `"sum"` and divide
   manually). For 3D input `(B, T, V)`, the cleanest path is to
   flatten the first two dims or use `reduction="sum"` and divide
   by `B*T`.

2. **Forgetting `T**2`.** The loss still trains, but a change in T
   silently changes effective learning rate. The test catches this
   by comparing magnitudes at T=2 vs T=1.

3. **`log()` of `softmax()`.** Use `F.log_softmax(x / T, dim=-1)`.
   Composing `log` of `softmax` is the classic underflow trap.

4. **KL direction swapped.** `KL(student || teacher)` (called
   *reverse* KL) is a different loss with mode-seeking behavior —
   not what Hinton et al. did and not what this kata wants.

## On Completion

### Insight

You just wrote the loss that compressed BERT into DistilBERT,
GPT-style teachers into TinyLlama-style students, and ultimately the
loss DeepSeek used (in spirit; they used hard distillation) to
distill R1 down to its 7B/14B/32B variants.

The `T²` factor is doing real work. Without it, the optimizer is
sensitive to your temperature choice and you'd have to retune LR
every time. With it, T becomes a free knob: turn it up to expose
more dark knowledge, down to focus on the top prediction — and
gradients stay comparable.

### Bridge

Next kata, `combined-distillation-loss`: in practice you almost
never use **pure** soft distillation. You mix soft KL with a
**hard-label cross-entropy** so the student still has a grounded
signal when the teacher is wrong. You'll see why with one line:
`alpha * CE_hard + (1 - alpha) * T² * KL_soft`.
