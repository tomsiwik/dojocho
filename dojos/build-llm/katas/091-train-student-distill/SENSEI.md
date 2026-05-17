# SENSEI — train-student-distill

## Briefing

### Goal

Run an end-to-end **soft-distillation training loop**. A small,
already-trained **teacher** (2-layer) hands its full output
distribution to a smaller **student** (1-layer). The student is
trained with the combined `alpha * CE + (1 - alpha) * T**2 * KL`
loss from kata `combined-distillation-loss`.

You will *see*, on a single test run, that the distilled student
ends up closer to the teacher than a CE-only baseline trained for
the same number of steps on the same data — using the same model
architecture. The only difference is the soft signal.

### Tasks

Implement in `solution.py`:

```python
def train_student(
    student: torch.nn.Module,
    teacher: torch.nn.Module,
    inputs: torch.Tensor,    # (N, T) long
    hard_targets: torch.Tensor,  # (N, T) long — the teacher's argmax
    num_steps: int,
    alpha: float = 0.3,
    T: float = 2.0,
    lr: float = 1e-2,
    batch_size: int = 16,
) -> list[float]:
```

- Set the teacher to `eval()` and freeze its parameters (no grad).
- Set the student to `train()`.
- For each of `num_steps` steps:
  1. Sample a random minibatch of rows from `inputs` / `hard_targets`.
  2. Forward pass on **both** student and teacher.
     (Teacher under `torch.no_grad()`.)
  3. Compute the combined loss
     `alpha * CE + (1 - alpha) * T**2 * KL`.
  4. Standard `zero_grad → backward → step` with `AdamW(lr=lr)`.
  5. Append `loss.item()` to a per-step loss list.
- Return the list of step losses.

You also need a helper that the tests will call:

```python
def kl_to_teacher(
    student: torch.nn.Module,
    teacher: torch.nn.Module,
    inputs: torch.Tensor,
    T: float = 1.0,
) -> float:
```

returning the mean KL between teacher and student over the whole
input set (use T=1, plain KL). This is the *evaluation* metric.

### Hints

- Reuse the loss formula from `combined-distillation-loss` (or
  reimplement inline).
- `torch.no_grad()` around the teacher forward pass — you don't want
  to track its gradients.
- `inputs` is shape `(N, T)`. Both teacher and student return
  `(N, T, V)` logits. Flatten to `(N*T, V)` before computing the
  loss; flatten `hard_targets` to `(N*T,)`.
- `torch.randperm(N)[:batch_size]` is the cleanest minibatch
  sampler.

## Prerequisites

- Kata: `combined-distillation-loss` (the loss function).
- Kata: `training-loop` (zero_grad → forward → backward → step).
- Kata: `kl-distillation-loss` (the KL math).

## References

- Hinton, Vinyals, Dean (2015): https://arxiv.org/abs/1503.02531
- Raschka, *Build a Reasoning Model from Scratch*, chapter 8 §8.4-8.6
  — the chapter's `train_distill` loop. (Raschka focuses on
  `alpha=1` hard distillation; this kata uses the combined recipe
  to demonstrate the soft signal explicitly.)

## Teaching Approach

**Worked example + Socratic.** This is mostly mechanical — you've
written training loops before. The Socratic punch comes after the
test passes:

### Socratic prompts

- **Before you write code.** "What does the teacher need to give
  the student that the hard labels don't? Look at one row of
  `teacher(inputs).softmax(-1)` and one row of one-hot
  `hard_targets` and contrast them."

- **After it passes.** "Why did distillation beat the CE-only
  baseline? You used the **same data**, the **same architecture**,
  the **same number of steps**. The only difference was the soft
  KL term." (Answer: the soft targets carry similarity information
  between vocab items. The student gets ~V floats of supervision
  per token instead of 1 bit. With a tiny model and a small budget
  of steps, that density matters.)

- **The teacher freeze.** "Why `teacher.eval()` and
  `torch.no_grad()`?" (Eval mode disables dropout/batchnorm; no_grad
  saves memory and prevents accidentally updating the teacher. We
  don't want the teacher to drift.)

- **The metric question.** "Why measure KL-to-teacher at T=1, not
  the training T?" (T=1 is the *deployment* distribution — what
  matters when the student is actually used. We trained with T>1 to
  expose more dark knowledge during optimization; at inference we
  evaluate on the real distributions.)

### Common pitfalls

1. **Teacher.train() instead of .eval()** — if your teacher has
   dropout (it doesn't, in this kata), it would behave
   stochastically. Always set teacher to eval.

2. **Forgetting `torch.no_grad()` around teacher** — wastes memory
   tracking gradients you'll never use. With tiny models in this
   kata it doesn't OOM, but it's a bad habit for real distillation
   runs.

3. **Flattening wrong** — for sequence outputs `(B, T, V)`, the CE
   needs `(B*T, V)` and `(B*T,)`. The KL needs the same flattening
   (or use `reduction="sum" / (B*T)`). Easy to forget one.

4. **Updating the teacher** — passing the teacher's parameters to
   the optimizer. `AdamW(student.parameters(), ...)`, never
   `model.parameters()`.

## On Completion

### Insight

You just ran the algorithm that produced DistilBERT, DistilGPT-2,
TinyLlama, and dozens of "tiny" variants in production. The student
matched the teacher's distribution closer than a same-size model
trained on the same hard labels alone.

In the real version, the teacher is a 30B+ model, the student is
1B-7B, the inputs are billions of tokens, and the training runs for
days on hundreds of GPUs. The loop you just wrote is the same loop.

### Bridge

You distilled with *soft* targets (full distributions). But the
production setup popularized by DeepSeek-R1 distillation uses
*hard* response distillation — just train on the teacher's
*generated text* (no logit access required, works with API-only
teachers). Next kata, `response-distillation-dataset`: greedy-sample
the teacher on a list of prompts and build the (prompt,
teacher-response) pairs you'd then SFT a student on.
