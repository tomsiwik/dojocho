# SENSEI — gradient-clip-global-norm

## Briefing

### Goal

Implement gradient clipping by global L2 norm, the way PyTorch's
`torch.nn.utils.clip_grad_norm_` does it. Given a list of gradient
tensors (one per parameter) and a `max_norm`, compute the global L2
norm across *all* the tensors and, if it exceeds `max_norm`, scale
*every* tensor by the same factor.

You will also confirm two properties:
1. When the global norm is already ≤ `max_norm`, gradients are
   returned **unchanged** (no scaling).
2. When clipping fires, **direction is preserved** — each tensor is
   scaled by the *same* scalar, so the concatenated gradient vector
   keeps its direction and only loses magnitude.

### Tasks

1. Implement `global_grad_norm(grads: list[Tensor]) -> Tensor`.
   - Return the L2 norm of the *concatenation* of all the gradient
     tensors (a single 0-dim tensor).
2. Implement `clip_grads_by_global_norm(grads, max_norm) -> Tensor`.
   - Compute the global norm.
   - If `global_norm > max_norm`, multiply each tensor in `grads`
     **in place** by `max_norm / global_norm` (use a tiny epsilon
     in the denominator for numerical safety: `max_norm / (global_norm + 1e-6)`).
   - If `global_norm <= max_norm`, leave the gradients alone.
   - Return the (pre-clip) global norm.

### Hints

- `tensor.norm()` (or `torch.linalg.vector_norm`) computes L2 norm.
- For the global norm across a list of tensors, you can sum the
  squared norms and take the square root — no need to actually
  concatenate large tensors.
- `tensor.mul_(scalar)` multiplies in place.
- Look at PyTorch's `clip_grad_norm_` source for the canonical
  pattern: https://github.com/pytorch/pytorch/blob/main/torch/nn/utils/clip_grad.py

## Prerequisites

- Comfort with `torch.Tensor` arithmetic.
- Knowledge that `param.grad` is the gradient tensor attached to a
  parameter after `loss.backward()`.

## References

- Raschka Appendix D, §D.3 (Gradient clipping).
- PyTorch `clip_grad_norm_` source (linked above).
- Pascanu, Mikolov, Bengio, "On the difficulty of training recurrent
  neural networks" (2013) — the original case for global-norm
  clipping.

## Teaching Approach

Method: **Demo + Socratic.** The mechanics are short, but the
*why global vs per-tensor* is the entire kata.

### Demo before coding (do this on paper)

Suppose you have two gradient tensors:
- `g1 = [3, 4]`   (norm 5)
- `g2 = [1]`      (norm 1)

Global norm: `sqrt(3² + 4² + 1²) = sqrt(26) ≈ 5.099`.

With `max_norm = 1`:

**Global clipping** (this kata): scale every tensor by
`1 / 5.099 ≈ 0.196`. New tensors: `[0.588, 0.784]` and `[0.196]`.
Note `g1` and `g2` keep their relative magnitudes.

**Per-tensor clipping** (the wrong way): scale `g1` by `1/5 = 0.2`
and `g2` by `1/1 = 1.0`. New tensors: `[0.6, 0.8]` and `[1.0]`.
Now `g2` is relatively *much larger* than it was before — the
gradient vector's direction has changed.

### Socratic prompts

- "If the gradient is the steepest descent direction, what does
  changing its *direction* mean for the optimizer?"
- "Per-tensor clipping is cheaper and simpler. What does it cost
  you in terms of optimization correctness?"
- "Why is the no-op case (norm < max_norm) important? What would
  happen if you always scaled by `max_norm / norm`?"
- "Why the `+ 1e-6` in the denominator? What goes wrong without it?"

### Common pitfalls

1. **Modifying tensors when no clipping is needed.** If
   `global_norm <= max_norm`, the gradients should be byte-identical
   to what they were before. A `mul_(1.0)` is still a write — and
   floating-point `mul_(0.999999)` from a missing branch will
   silently shrink your gradients on every step.
2. **Per-tensor clipping by accident.** If you call `t.clamp_(...)`
   or `t.norm()` *per tensor* and scale each one independently, you
   have built the wrong thing. The scale factor must be a single
   scalar derived from the *global* norm.
3. **Computing norm by concatenation.** Works for the kata but
   wastes memory on real models. The professional pattern is
   `sqrt(sum(t.norm()**2 for t in grads))` — same answer, no copy.
4. **Returning the post-clip norm.** PyTorch (and these tests)
   return the *pre-clip* norm — that's the monitoring signal users
   care about.

## On Completion

### Insight

You just built one of the most boring-looking and most important
pieces of LLM training infrastructure. Without gradient clipping, a
single anomalous batch (rare token sequence, bad data, numerical
spike) can produce a gradient 100x larger than typical and that one
step can move the weights into a region the model can never recover
from. Clipping by global norm is the safety belt — it does nothing
99% of the time and then occasionally saves a multi-million-dollar
training run.

Combined with your warmup-then-cosine schedule, you now have the
full LR + safety machinery from Raschka §D.4's `train_model`.

### Bridge

You've completed Appendix D. Your training loop is now
production-grade. The next chapter (build-llm Chapter 6) is
classification fine-tuning, which will use this same training
machinery to specialize the pretrained model on a new task.
