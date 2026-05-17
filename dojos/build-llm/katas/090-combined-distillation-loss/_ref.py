"""Reference for combined-distillation-loss."""

import torch
import torch.nn.functional as F


def kl_loss(
    student_logits: torch.Tensor,
    teacher_logits: torch.Tensor,
    T: float,
) -> torch.Tensor:
    if student_logits.dim() > 2:
        V = student_logits.size(-1)
        student_logits = student_logits.reshape(-1, V)
        teacher_logits = teacher_logits.reshape(-1, V)
    s_log = F.log_softmax(student_logits / T, dim=-1)
    t_log = F.log_softmax(teacher_logits / T, dim=-1)
    kl = F.kl_div(s_log, t_log, reduction="batchmean", log_target=True)
    return (T**2) * kl


def distill_loss(
    student_logits: torch.Tensor,
    teacher_logits: torch.Tensor,
    hard_targets: torch.Tensor,
    alpha: float,
    T: float,
) -> torch.Tensor:
    hard = F.cross_entropy(student_logits, hard_targets)
    soft = kl_loss(student_logits, teacher_logits, T)
    return alpha * hard + (1.0 - alpha) * soft
