"""Reference implementation for kl-distillation-loss."""

import torch
import torch.nn.functional as F


def kl_loss(
    student_logits: torch.Tensor,
    teacher_logits: torch.Tensor,
    T: float,
) -> torch.Tensor:
    # Flatten any leading dims so 'batchmean' divides by B*T for 3D inputs.
    if student_logits.dim() > 2:
        V = student_logits.size(-1)
        student_logits = student_logits.reshape(-1, V)
        teacher_logits = teacher_logits.reshape(-1, V)

    student_log_probs = F.log_softmax(student_logits / T, dim=-1)
    teacher_log_probs = F.log_softmax(teacher_logits / T, dim=-1)

    # F.kl_div(input, target) computes KL(target || input).
    # We want KL(teacher || student): teacher is target, student is input.
    kl = F.kl_div(
        student_log_probs,
        teacher_log_probs,
        reduction="batchmean",
        log_target=True,
    )
    return (T**2) * kl
