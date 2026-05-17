"""002 — Autoregressive Generation

Wrap the bigram model in a generation loop. This is THE autoregressive
mechanism — feed each predicted token back as the next input — that
every modern LLM uses to write a paragraph.

Same shape as GPT generation:  predict → append → predict → append.
Only the "predict" step is replaced (Counter argmax here, a 175B-param
forward pass in GPT-3).
"""

import random
from collections import Counter


def sample_next(
    bigrams: dict[str, Counter],
    word: str,
    temperature: float = 0.0,
    rng: random.Random | None = None,
) -> str:
    """Pick the next word given the current `word`.

    temperature = 0.0   → argmax (greedy, deterministic). Ignore rng.
    temperature > 0.0   → sample proportional to `count ** (1/T)`.

    If `word` has no followers in `bigrams`, return "<end>".
    """
    ...  # implement me


def generate(
    bigrams: dict[str, Counter],
    seed: str,
    n_tokens: int,
    temperature: float = 0.0,
    rng_seed: int = 0,
) -> list[str]:
    """The autoregressive loop. Start with [seed], generate `n_tokens`
    tokens in total, stop early if `sample_next` returns "<end>".

    Use random.Random(rng_seed) so the same seed gives the same output.
    """
    ...  # implement me
