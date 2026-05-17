"""decoding-strategies

The four decoding strategies every LLM API exposes:

  1. greedy           — argmax. Deterministic. Repetitive.
  2. temperature      — sample from softmax(logits / T).
  3. top-k            — sample from top-k tokens only.
  4. top-p (nucleus)  — sample from smallest set whose cum-prob > p.

All functions take logits of shape (V,) and return a 0-dim long tensor.
Sampling functions accept an optional torch.Generator for determinism.
"""

import torch


def greedy(logits: torch.Tensor) -> torch.Tensor:
    """Argmax — pick the highest-logit token. 0-dim long tensor."""
    ...  # implement me


def temperature_sample(
    logits: torch.Tensor,
    temperature: float,
    rng: torch.Generator | None = None,
) -> torch.Tensor:
    """Sample from softmax(logits / temperature).

    - T → 0  : approaches greedy (special-case T==0 to call greedy).
    - T == 1 : sample from the model's raw distribution.
    - T > 1  : flatter distribution, more diverse samples.
    """
    ...  # implement me


def top_k_sample(
    logits: torch.Tensor,
    k: int,
    rng: torch.Generator | None = None,
) -> torch.Tensor:
    """Keep only the top-k logits, mask rest to -inf, then sample.

    k = 1 MUST be identical to greedy.
    """
    ...  # implement me


def top_p_sample(
    logits: torch.Tensor,
    p: float,
    rng: torch.Generator | None = None,
) -> torch.Tensor:
    """Nucleus sampling.

    Sort descending. Keep the smallest prefix whose cumulative
    probability exceeds `p`. Mask everything else to -inf. Sample.

    SHIFT the mask right by one so the top token is always kept (even
    if it alone exceeds p). Otherwise top_p=0.0 would mask everything.
    """
    ...  # implement me
