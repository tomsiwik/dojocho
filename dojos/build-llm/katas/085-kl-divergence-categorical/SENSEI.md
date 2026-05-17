# SENSEI — kl-divergence-categorical

## Briefing

### Goal

Compute the KL divergence between two categorical distributions given
their logits. This is the building block of the KL penalty in RLHF
and GRPO — you cannot keep a fine-tuned policy "close to" a reference
policy without knowing how to measure "close".

### Tasks

1. Implement `kl_div(logits_p, logits_q) -> torch.Tensor`:
   - Inputs are unnormalized logits of shape `(..., V)` over the same
     support of size `V`.
   - Return `KL(p || q) = sum_i p_i * (log p_i - log q_i)`, summed
     over the last dim. If there are leading dims, mean over them so
     the result is a scalar.
   - Do **not** call `F.kl_div` — implement from `log_softmax` and
     `softmax` (or `exp(log_softmax)`).

### Hints

- `log_p = F.log_softmax(logits_p, dim=-1)`, similarly `log_q`.
- `p = log_p.exp()`. Then `kl = (p * (log_p - log_q)).sum(dim=-1)`.
- If you started from `logits.softmax()` and `logits.softmax().log()`,
  you'll get NaN on extreme logits — use `log_softmax`.

## Prerequisites

- `cross-entropy-from-logits` (you already know `log_softmax` + the
  shape of probability tensors).

## References

- Raschka build-reasoning chapter 7 §7.5 — "Controlling how much the
  model changes with a KL term".
- PyTorch: `torch.nn.functional.log_softmax`,
  `torch.nn.functional.kl_div` (read the docs, but don't call it).
- Schulman et al., PPO paper — https://arxiv.org/abs/1707.06347.

## Teaching Approach

**Worked example + Socratic.** KL is not hard to compute but the
*direction* matters, and the asymmetry is what gets students later.

### Socratic prompts

- "KL is asymmetric. Compute `KL(p || q)` and `KL(q || p)` for
  `p = [0.5, 0.5]`, `q = [0.99, 0.01]`. Which is larger? Why?"
  (Forward KL — `p || q` — blows up when `q` is small where `p`
  isn't; reverse KL is mode-seeking.)
- "In RLHF/GRPO, we penalize `KL(new || ref)`, not `KL(ref || new)`.
  Why that direction? What would happen if you used the other?"
  (`KL(new || ref)` punishes the new policy for putting probability
  mass where the reference said it should not — i.e., on garbage
  tokens. Reverse would let the new policy collapse onto a single
  high-reward mode the reference rarely touches.)
- "Why `log_softmax` instead of `softmax().log()`? Try
  `logits = torch.tensor([1000., 999., 1001.])`. What goes wrong?"
- "What does `KL(p || p) = 0` mean in plain English?"
- After it passes: "Estimate the KL between two GPT-sized
  distributions over 50k tokens. What's the memory cost of the
  `(p * (log_p - log_q))` tensor?" (It's just the vocab-size vector
  per token — fine. The expensive part is computing both
  log_softmaxes.)

### Common pitfalls

1. **Wrong direction of subtraction.** `p * (log_p - log_q)` is
   `KL(p || q)`. `p * (log_q - log_p)` would be the negative.
2. **Forgot to `.exp()` the log-probs.** You need `p` (probabilities)
   times `log_p - log_q`, not `log_p * (log_p - log_q)`.
3. **Summed over the wrong dim.** The support is the last dim. Sum
   over it, then mean over batch dims.
4. **Used `F.softmax` + `.log()`.** Numerically unstable. Use
   `log_softmax`.

## On Completion

### Insight

You just wrote the regularizer that keeps RLHF from destroying the
model. Without a KL penalty, the policy is free to drift arbitrarily
far from the pretrained distribution — and it *will*, because the
reward model is wrong outside the distribution it was trained on.
The KL term is what keeps the LLM speaking English while it learns
to follow instructions.

### Bridge

Next kata: **kl-penalized-grpo** — plug this KL term into a GRPO
loss and watch what `beta` (the KL coefficient) actually controls.
You'll see that `beta=0` recovers vanilla GRPO and `beta=large`
freezes the policy near the reference.
