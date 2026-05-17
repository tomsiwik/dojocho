"""Tests for train-student-distill.

The teacher is a 2-layer LM, the student is a 1-layer LM. Both have
the same vocab (50) and d_model (32). Inputs are synthetic random
token sequences; "hard targets" are the teacher's argmax (so the
teacher is, by construction, the ground truth that a CE-only
baseline could perfectly fit if it had enough capacity / steps).

We verify:
  1. The function runs and returns a sane list of step losses.
  2. After 150 steps, the distilled student's KL to the teacher is
     lower than a CE-only baseline trained for the same 150 steps
     on the same data. (Soft targets carry similarity information
     that hard labels throw away.)
"""

import copy

import torch
import torch.nn as nn
import torch.nn.functional as F


VOCAB = 50
D_MODEL = 32
SEQ_LEN = 8
N_EXAMPLES = 64


class Teacher(nn.Module):
    """2-layer: embed → linear → GELU → linear → vocab."""

    def __init__(self, vocab=VOCAB, d_model=D_MODEL):
        super().__init__()
        self.embed = nn.Embedding(vocab, d_model)
        self.h = nn.Linear(d_model, d_model)
        self.head = nn.Linear(d_model, vocab)

    def forward(self, x):
        h = F.gelu(self.h(self.embed(x)))
        return self.head(h)


class Student(nn.Module):
    """1-layer: embed → linear → vocab."""

    def __init__(self, vocab=VOCAB, d_model=D_MODEL):
        super().__init__()
        self.embed = nn.Embedding(vocab, d_model)
        self.head = nn.Linear(d_model, vocab)

    def forward(self, x):
        return self.head(self.embed(x))


def _make_setup(seed=0):
    """Construct a (teacher, inputs, hard_targets) triple."""
    torch.manual_seed(seed)
    teacher = Teacher()
    # Pre-train the teacher a bit so its distribution is non-uniform.
    pre_inputs = torch.randint(0, VOCAB, (128, SEQ_LEN))
    pre_targets = torch.randint(0, VOCAB, (128, SEQ_LEN))
    opt = torch.optim.AdamW(teacher.parameters(), lr=1e-2)
    for _ in range(50):
        logits = teacher(pre_inputs)
        loss = F.cross_entropy(logits.view(-1, VOCAB), pre_targets.view(-1))
        opt.zero_grad()
        loss.backward()
        opt.step()
    teacher.eval()

    # Now the "distillation dataset": fresh random inputs;
    # hard targets are the teacher's argmax (so the teacher is
    # by construction perfectly correct on the hard labels).
    inputs = torch.randint(0, VOCAB, (N_EXAMPLES, SEQ_LEN))
    with torch.no_grad():
        hard_targets = teacher(inputs).argmax(dim=-1)
    return teacher, inputs, hard_targets


def _kl_ref(student, teacher, inputs, T=1.0):
    """Reference KL(teacher || student) at temperature T."""
    student.eval()
    teacher.eval()
    with torch.no_grad():
        s = student(inputs).view(-1, VOCAB)
        t = teacher(inputs).view(-1, VOCAB)
    s_log = F.log_softmax(s / T, dim=-1)
    t_log = F.log_softmax(t / T, dim=-1)
    return F.kl_div(s_log, t_log, reduction="batchmean", log_target=True).item()


# ----- Tests --------------------------------------------------------


def test_returns_loss_list(solution):
    torch.manual_seed(0)
    teacher, inputs, hard = _make_setup(seed=0)
    student = Student()
    losses = solution.train_student(
        student, teacher, inputs, hard,
        num_steps=20, alpha=0.3, T=2.0, lr=1e-2, batch_size=16,
    )
    assert isinstance(losses, list)
    assert len(losses) == 20
    assert all(isinstance(l, float) for l in losses)
    assert all(l == l and l != float("inf") for l in losses)


def test_teacher_not_modified(solution):
    """The teacher must not be updated. Its weights must stay identical."""
    torch.manual_seed(0)
    teacher, inputs, hard = _make_setup(seed=0)
    student = Student()
    before = {k: v.detach().clone() for k, v in teacher.state_dict().items()}
    solution.train_student(
        student, teacher, inputs, hard,
        num_steps=30, alpha=0.3, T=2.0, lr=1e-2, batch_size=16,
    )
    after = teacher.state_dict()
    for k in before:
        assert torch.allclose(before[k], after[k]), (
            f"teacher param {k} was modified during distillation"
        )


def test_student_weights_change(solution):
    torch.manual_seed(0)
    teacher, inputs, hard = _make_setup(seed=0)
    student = Student()
    before = student.embed.weight.detach().clone()
    solution.train_student(
        student, teacher, inputs, hard,
        num_steps=30, alpha=0.3, T=2.0, lr=1e-2, batch_size=16,
    )
    after = student.embed.weight.detach()
    assert not torch.allclose(before, after), "student weights did not change"


def test_kl_to_teacher_decreases(solution):
    """Helper kl_to_teacher should drop after training."""
    torch.manual_seed(0)
    teacher, inputs, hard = _make_setup(seed=0)
    student = Student()
    kl_before = solution.kl_to_teacher(student, teacher, inputs, T=1.0)
    solution.train_student(
        student, teacher, inputs, hard,
        num_steps=150, alpha=0.3, T=2.0, lr=1e-2, batch_size=16,
    )
    kl_after = solution.kl_to_teacher(student, teacher, inputs, T=1.0)
    assert kl_after < kl_before, (
        f"KL(teacher||student) did not drop: before={kl_before:.3f} "
        f"after={kl_after:.3f}"
    )
    # And it should be reasonably low — under 1 nat per token.
    assert kl_after < 1.0, f"KL after distillation should be small, got {kl_after:.3f}"


def test_distill_beats_ce_only(solution):
    """The big test: with the same data, same model, same step budget,
    the distilled student should end up with lower KL to the teacher
    than a CE-only baseline.

    This is the central claim of soft distillation — the teacher's
    full distribution carries similarity information that the hard
    argmax does not.
    """
    torch.manual_seed(0)
    teacher, inputs, hard = _make_setup(seed=0)

    # Snapshot the student weights so both runs start identically.
    student_init = Student()
    student_distill = copy.deepcopy(student_init)
    student_ce = copy.deepcopy(student_init)

    # Distillation: combined hard + soft.
    solution.train_student(
        student_distill, teacher, inputs, hard,
        num_steps=150, alpha=0.3, T=2.0, lr=1e-2, batch_size=16,
    )
    kl_distill = solution.kl_to_teacher(student_distill, teacher, inputs, T=1.0)

    # Baseline: alpha=1 → pure hard CE on the same labels.
    solution.train_student(
        student_ce, teacher, inputs, hard,
        num_steps=150, alpha=1.0, T=2.0, lr=1e-2, batch_size=16,
    )
    kl_ce = solution.kl_to_teacher(student_ce, teacher, inputs, T=1.0)

    assert kl_distill < kl_ce, (
        f"Soft distillation did not beat CE-only baseline.\n"
        f"  KL(teacher||student) distill = {kl_distill:.4f}\n"
        f"  KL(teacher||student) CE-only = {kl_ce:.4f}\n"
        "Did you actually include the KL term in the loss?"
    )
