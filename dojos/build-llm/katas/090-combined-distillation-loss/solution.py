"""combined-distillation-loss

The classic Hinton-style knowledge distillation loss combines a hard
cross-entropy against the ground-truth labels with a soft KL against
the teacher's full distribution:

    L = alpha * CE(student, hard_targets)
      + (1 - alpha) * T**2 * KL( softmax(teacher/T) || softmax(student/T) )

alpha=1 → pure SFT on the hard labels. alpha=0 → pure soft KD.
In between → the canonical recipe used by DistilBERT, TinyBERT, etc.
"""

import torch
import torch.nn.functional as F


def kl_loss(
    student_logits: torch.Tensor,
    teacher_logits: torch.Tensor,
    T: float,
) -> torch.Tensor:
    """T**2 * mean_over_batch KL(teacher_soft || student_soft).

    Provided for you — this is the function you implemented in the
    `kl-distillation-loss` kata. You can call it from `distill_loss`.
    """
    if student_logits.dim() > 2:
        V = student_logits.size(-1)
        student_logits = student_logits.reshape(-1, V)
        teacher_logits = teacher_logits.reshape(-1, V)
    s_log = F.log_softmax(student_logits / T, dim=-1)
    t_log = F.log_softmax(teacher_logits / T, dim=-1)
    kl = F.kl_div(s_log, t_log, reduction="batchmean", log_target=True)
    return (T**2) * kl


def distill_loss(
    student_logits: torch.Tensor,   # (B, V)
    teacher_logits: torch.Tensor,   # (B, V)
    hard_targets: torch.Tensor,     # (B,) long
    alpha: float,
    T: float,
) -> torch.Tensor:
    """Combined hard-CE + soft-KL distillation loss.

    Returns a scalar tensor:
        alpha * CE(student_logits, hard_targets)
        + (1 - alpha) * T**2 * KL(softmax(teacher/T) || softmax(student/T))

    Parsons-style hint — the lines you need (un-scramble them):

        soft = kl_loss(student_logits, teacher_logits, T)
        total = alpha * hard + (1 - alpha) * soft
        hard = F.cross_entropy(student_logits, hard_targets)
        return total

    (Note: `kl_loss` above already includes the T**2 factor — don't
    multiply again.)
    """
    ...  # implement me
