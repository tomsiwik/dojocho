"""response-distillation-dataset

Build a hard-distillation dataset by greedy-generating teacher
responses for a list of prompts. The output is a list of
`(prompt_ids, teacher_response_ids)` pairs ready to be concatenated
into a vanilla SFT training set for the student.

This is the toy version of the DeepSeek-R1 distillation pipeline
described in Raschka chapter 8 §8.2 — same shape, smaller scale.
"""

from __future__ import annotations

import torch


def make_distill_dataset(
    teacher: torch.nn.Module,
    prompts: list[str],
    tokenizer,
    max_new_tokens: int = 16,
    seed: int = 0,
) -> list[tuple[torch.Tensor, torch.Tensor]]:
    """For each prompt, greedy-generate the teacher's response.

    Args:
        teacher: nn.Module taking (B, T) long → (B, T, V) float.
        prompts: list of strings.
        tokenizer: has `.encode(str) -> list[int]` and
            `.eos_id: int | None`.
        max_new_tokens: cap on response length.
        seed: torch seed set at the start for deterministic ties.

    Returns:
        List of (prompt_ids, response_ids) tensor pairs, both 1D long.
        `response_ids` contains ONLY the newly generated tokens
        (not the prompt). May be empty if the very first generated
        token is EOS.

    Sketch:
        torch.manual_seed(seed)
        teacher.eval()
        out = []
        for prompt in prompts:
            prompt_ids = torch.tensor(tokenizer.encode(prompt), dtype=torch.long)
            seq = prompt_ids.clone()
            generated = []
            with torch.no_grad():
                for _ in range(max_new_tokens):
                    logits = teacher(seq.unsqueeze(0))   # (1, T, V)
                    next_id = logits[0, -1].argmax().item()
                    if next_id == tokenizer.eos_id:
                        break
                    generated.append(next_id)
                    seq = torch.cat([seq, torch.tensor([next_id], dtype=torch.long)])
            response_ids = torch.tensor(generated, dtype=torch.long)
            out.append((prompt_ids, response_ids))
        return out
    """
    ...  # implement me
