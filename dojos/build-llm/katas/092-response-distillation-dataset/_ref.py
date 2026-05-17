"""Reference for response-distillation-dataset."""

from __future__ import annotations

import torch


def make_distill_dataset(
    teacher,
    prompts,
    tokenizer,
    max_new_tokens=16,
    seed=0,
):
    torch.manual_seed(seed)
    teacher.eval()
    eos_id = getattr(tokenizer, "eos_id", None)

    out = []
    for prompt in prompts:
        prompt_ids = torch.tensor(tokenizer.encode(prompt), dtype=torch.long)
        seq = prompt_ids.clone()
        generated: list[int] = []

        with torch.no_grad():
            for _ in range(max_new_tokens):
                logits = teacher(seq.unsqueeze(0))  # (1, T, V)
                next_id = int(logits[0, -1].argmax().item())
                if eos_id is not None and next_id == eos_id:
                    break
                generated.append(next_id)
                seq = torch.cat(
                    [seq, torch.tensor([next_id], dtype=torch.long)]
                )

        response_ids = torch.tensor(generated, dtype=torch.long)
        out.append((prompt_ids, response_ids))

    return out
