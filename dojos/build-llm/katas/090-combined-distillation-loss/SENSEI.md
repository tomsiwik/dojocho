# SENSEI — combined-distillation-loss

## Briefing

### Goal

In practice nobody trains a student on pure soft KL. You combine it
with hard-label cross-entropy:

```
loss = alpha * CE(student, hard_targets)
     + (1 - alpha) * T**2 * KL(softmax(teacher/T) || softmax(student/T))
```

- `alpha=1` → pure hard distillation (supervised fine-tuning).
- `alpha=0` → pure soft distillation (Hinton's KD).
- In between → "best of both worlds", the configuration used by
  DistilBERT, TinyBERT, and most production setups.

This is **Listing 8.X-ish** in Raschka's chapter 8 (the chapter
itself focuses on `alpha=1`, hard distillation — but the
*classic* knowledge-distillation recipe combines both).

### Tasks

Implement in `solution.py`:

```python
def distill_loss(
    student_logits: torch.Tensor,   # (B, V)
    teacher_logits: torch.Tensor,   # (B, V)
    hard_targets: torch.Tensor,     # (B,) long
    alpha: float,
    T: float,
) -> torch.Tensor:
```

Returns a scalar:
```
alpha * F.cross_entropy(student_logits, hard_targets)
+ (1 - alpha) * T**2 * KL( softmax(teacher/T) || softmax(student/T) )
```

The KL term is exactly the one from kata `kl-distillation-loss` — you
may import it, or re-implement.

### Hints

- `F.cross_entropy(logits, targets)` already takes raw logits and
  long targets — no manual softmax.
- The hard CE uses the *original* logits (no temperature scaling).
- Edge cases: `alpha=0.0` → drop the hard term so you don't even
  *compute* CE (slightly nicer, but not required for correctness).
  `alpha=1.0` → drop the soft term.

### Stub order (Parsons-style — fix the order)

The four ingredients of the formula:

```
soft = T**2 * kl_loss(student_logits, teacher_logits, T)
total = alpha * hard + (1 - alpha) * soft
hard = F.cross_entropy(student_logits, hard_targets)
return total
```

Put them in the right order in `distill_loss`.

## Prerequisites

- Kata: `kl-distillation-loss` (you'll reuse the same KL math).
- Kata: `cross-entropy-from-logits`.

## References

- Hinton, Vinyals, Dean (2015) — equation (1), the combined loss:
  https://arxiv.org/abs/1503.02531
- Raschka, *Build a Reasoning Model from Scratch*, chapter 8 §8.1
  — discusses hard, soft, and combined variants.
- Sanh et al. (2019) *DistilBERT* — used alpha ≈ 0.5 with T=2:
  https://arxiv.org/abs/1910.01108

## Teaching Approach

**Parsons + Socratic.** The function is short (3 lines). The
*interesting* learning is in the why.

### Socratic prompts

- **The asymmetry question.** "If `alpha=0` (pure soft) is so
  information-rich, why would you EVER use `alpha > 0`?"
  (Answer: the teacher is *not infallible*. When the teacher gets a
  token wrong, the hard label — which comes from ground truth, not
  the teacher — pulls the student back toward the correct answer.
  The hard loss is a *regularizer against teacher errors*.)

- **The opposite question.** "If hard labels are ground truth, why
  ever use `alpha < 1`?" (Answer: soft labels carry similarity
  structure between vocabulary items. A model trained on hard
  labels alone treats every wrong answer as equally wrong — a typo
  for the right answer is no better than gibberish. Soft labels
  encode that '7.0' is close to '7'. This is the
  'dark knowledge' point from `kl-distillation-loss`.)

- **The temperature interaction.** "Does T affect the hard-CE term?"
  (No — hard CE uses raw logits. Only the KL term sees T.)

- **DistilBERT's choice.** "Sanh et al. used `alpha ≈ 0.5, T = 2`.
  Why not `alpha = 0.01, T = 8` (overwhelmingly soft)?" (Empirics:
  too much teacher leaks teacher errors. Too much hard wastes the
  teacher's nuance. ~50/50 with mild temperature is robust.)

### Common pitfalls

1. **Applying T to the hard term.** The hard CE uses raw logits, not
   softened ones. Mixing this up makes the hard term weaker than it
   looks.

2. **Forgetting the `T**2` on the soft term.** Same trap as in
   `kl-distillation-loss`. If you reuse a `kl_loss` that already
   applies `T**2`, do not multiply again — pick one place.

3. **Weighting confusion.** Some papers use `alpha * soft +
   (1-alpha) * hard`. This kata uses `alpha * hard +
   (1-alpha) * soft` (matches the function signature: "as alpha
   grows, you trust the hard labels more"). The test fixes this
   convention.

## On Completion

### Insight

Three lines, one knob (`alpha`), and you have a recipe used to
compress every major language model from BERT down to its mobile
variants. The default ~`alpha=0.5, T=2` is a safe starting point
across modalities.

The deeper insight: **the student doesn't have to learn from one
source of supervision**. CE loss assumes the targets are correct.
Distillation breaks that monoculture — the student averages a
trusted-but-not-infallible teacher with the (potentially noisy)
ground truth. This generalizes far beyond LLMs to teacher-student
setups in vision, speech, and RL.

### Bridge

You can compute the loss. Next kata, `train-student-distill`, you'll
actually **run** the optimizer — train a 1-layer student to mimic a
2-layer teacher on synthetic data and watch the student's KL to the
teacher fall to near zero, beating a CE-only baseline trained for
the same number of steps on the same data.
