"""Reference for train-student-distill."""

from __future__ import annotations

import torch
import torch.nn.functional as F


def _kl_term(student_logits, teacher_logits, T):
    s = F.log_softmax(student_logits / T, dim=-1)
    t = F.log_softmax(teacher_logits / T, dim=-1)
    return F.kl_div(s, t, reduction="batchmean", log_target=True) * (T**2)


def train_student(
    student,
    teacher,
    inputs,
    hard_targets,
    num_steps,
    alpha=0.3,
    T=2.0,
    lr=1e-2,
    batch_size=16,
):
    teacher.eval()
    for p in teacher.parameters():
        p.requires_grad_(False)
    student.train()
    opt = torch.optim.AdamW(student.parameters(), lr=lr)

    N = inputs.size(0)
    V = None
    losses: list[float] = []

    for _ in range(num_steps):
        idx = torch.randperm(N)[:batch_size]
        x = inputs[idx]
        y = hard_targets[idx]

        s_logits = student(x)
        with torch.no_grad():
            t_logits = teacher(x)

        if V is None:
            V = s_logits.size(-1)

        s_flat = s_logits.reshape(-1, V)
        t_flat = t_logits.reshape(-1, V)
        y_flat = y.reshape(-1)

        loss = alpha * F.cross_entropy(s_flat, y_flat)
        if alpha < 1.0:
            loss = loss + (1.0 - alpha) * _kl_term(s_flat, t_flat, T)

        opt.zero_grad()
        loss.backward()
        opt.step()
        losses.append(loss.item())

    return losses


def kl_to_teacher(student, teacher, inputs, T=1.0):
    student.eval()
    teacher.eval()
    with torch.no_grad():
        s = student(inputs)
        t = teacher(inputs)
    V = s.size(-1)
    s = s.reshape(-1, V)
    t = t.reshape(-1, V)
    s_log = F.log_softmax(s / T, dim=-1)
    t_log = F.log_softmax(t / T, dim=-1)
    kl = F.kl_div(s_log, t_log, reduction="batchmean", log_target=True)
    return kl.item()
