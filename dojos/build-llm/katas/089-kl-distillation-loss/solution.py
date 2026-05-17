"""kl-distillation-loss

The Hinton et al. (2015) soft-label distillation loss:

    L_KD = T**2 * KL( softmax(teacher / T) || softmax(student / T) )

averaged over the batch. The temperature T softens both distributions
so the student learns the teacher's full opinion over the vocabulary
(its 'dark knowledge' about which wrong tokens are still plausible),
not just the top prediction. The T**2 prefactor cancels the 1/T**2
scaling that softening introduces in the gradient, so T is a free
knob that does not couple to the optimizer's learning rate.
"""

import torch
import torch.nn.functional as F  # noqa: F401  (you will need this)


def kl_loss(
    student_logits: torch.Tensor,
    teacher_logits: torch.Tensor,
    T: float,
) -> torch.Tensor:
    """Compute the soft-label distillation loss.

    Args:
        student_logits: shape (B, V) or (B, T, V). Raw logits.
        teacher_logits: same shape as student. Raw logits.
        T: temperature (a positive float).

    Returns:
        A scalar (0-dim) tensor:
            T**2 * mean_over_batch( KL( softmax(teacher/T) || softmax(student/T) ) )

    Notes:
        - Use F.kl_div with log_target=True for numerical stability.
        - PyTorch's F.kl_div(input, target) computes KL(target || input).
          So teacher goes in 'target', student in 'input'.
        - Use reduction='batchmean' for (B, V) inputs. For (B, T, V),
          flatten the leading two dims first (so 'batchmean' divides
          by B*T, which is what we want).
    """
    ...  # implement me
