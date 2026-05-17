"""train-student-distill

End-to-end soft-distillation training loop.

A 2-layer teacher hands its full output distribution to a 1-layer
student. The student is trained with
    alpha * CE(student, hard_targets)
    + (1 - alpha) * T**2 * KL(softmax(teacher/T) || softmax(student/T))

After ~100-200 minibatch steps you should see the student's KL to
the teacher fall well below a CE-only baseline trained for the same
budget — same data, same architecture, only the soft signal differs.
"""

from __future__ import annotations

import torch
import torch.nn.functional as F


def _flat(logits: torch.Tensor) -> torch.Tensor:
    """(B, T, V) → (B*T, V). Pass-through for (N, V)."""
    if logits.dim() == 3:
        return logits.reshape(-1, logits.size(-1))
    return logits


def train_student(
    student: torch.nn.Module,
    teacher: torch.nn.Module,
    inputs: torch.Tensor,
    hard_targets: torch.Tensor,
    num_steps: int,
    alpha: float = 0.3,
    T: float = 2.0,
    lr: float = 1e-2,
    batch_size: int = 16,
) -> list[float]:
    """Distill `teacher` into `student` and return per-step losses.

    Sketch (you fill in):
      - teacher.eval(); freeze it (no_grad around its forward pass).
      - student.train(); optimizer = AdamW(student.parameters(), lr=lr).
      - For each step:
          - sample a random minibatch from `inputs` / `hard_targets`
          - s_logits = student(batch)   # (B, T, V)
          - with no_grad: t_logits = teacher(batch)
          - flatten to (B*T, V) and (B*T,)
          - loss = alpha * F.cross_entropy(s, y)
                 + (1 - alpha) * T**2 * KL(teacher_soft || student_soft)
          - zero_grad → backward → step
          - record loss.item()
    """
    ...  # implement me


def kl_to_teacher(
    student: torch.nn.Module,
    teacher: torch.nn.Module,
    inputs: torch.Tensor,
    T: float = 1.0,
) -> float:
    """Mean KL(teacher || student) over the full input set, at temp T.

    Used as the evaluation metric. Both models are put in eval mode
    and called under no_grad.

    Returns a plain Python float.
    """
    ...  # implement me
