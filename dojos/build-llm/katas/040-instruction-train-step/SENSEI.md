# SENSEI — Instruction Train Step

## Briefing

### Goal

Wire the pieces from the previous four katas together: dataset →
model → masked loss → optimizer step. Verify the loss drops.

This is the entire instruction fine-tuning loop in one function.
By the end of this kata, you have the whole stack — and the only
thing different from pretraining is the dataset (instruction-formatted
with a mask) and the masked loss reduction.

### Tasks

Implement `train_one_step(model, batch, optimizer) -> float`:

1. `batch` is a 3-tuple `(input_ids, target_ids, mask)`, each of
   shape `(B, T)`.
2. Forward pass: `logits = model(input_ids)` → shape `(B, T, V)`.
3. Compute masked cross-entropy loss using the response-only mask.
4. Backprop and step the optimizer (in that order; remember
   `optimizer.zero_grad()`).
5. Return the scalar Python float of the loss.

Also implement `train_until(model, batches, optimizer, steps=50)`:

1. Cycle through `batches` for `steps` iterations.
2. Return the list of per-step loss values.

### Hints

- Use `torch.nn.functional.cross_entropy(..., reduction='none')` and
  weight per-position losses by `mask.float()`, then average over
  positions where `mask == 1`. (Or import from a previous kata —
  but copy-pasting the few lines keeps this kata self-contained.)
- `optimizer.zero_grad()` before the backward, not after — otherwise
  gradients accumulate from previous batches.
- Don't `torch.no_grad()` here; you need gradients.

## Prerequisites

- Kata `instruction-dataset` (you have the batch shape).
- Kata `masked-loss` (you have the loss).
- Any prior training-step kata (the pattern is identical).

## References

- Raschka chapter 7 §7.6 — "Fine-tuning the LLM on instruction data".
- Raschka chapter 5 — `train_model_simple` (this is the same loop;
  the function literally doesn't need to change between pretraining
  and instruction fine-tuning if you handle the mask via -100 in
  targets).

## Teaching Approach

**Method:** Socratic (brief).

### Socratic prompts

After your test passes:

- "Compare this training loop to your pretraining train-step kata.
  List what's different." (Hopeful answer: nothing structural — same
  `forward, loss, backward, step` sequence. Different: the data
  shape contains a mask; the loss respects it.)
- "What did *not* change between pretraining and instruction tuning?"
  (Answer: the model, the optimizer, the loop, the loss function
  (cross-entropy). The whole machinery.)
- "If `train_one_step` returns a flat loss curve (no improvement
  after 50 steps), what are the three most likely bugs?"
  (Answer: (1) `optimizer.zero_grad()` missing; (2) mask is all 0 →
  loss is always 0 → no gradient; (3) `model.eval()` left on from
  earlier code → dropout not behaving as expected, sometimes masks
  gradient flow.)

### Common pitfalls

1. **Forgetting `optimizer.zero_grad()`** — gradients accumulate;
   the second step uses gradient from steps 1+2 combined. Loss
   may still drop, but unstably.
2. **Returning `loss` instead of `loss.item()`** — leaks the
   computation graph; the test calls `assert isinstance(loss, float)`.
3. **Calling `.item()` inside an inference loop without `no_grad()`** —
   not an issue here (you want gradients), but a thing to know.

## On Completion

### Insight

You have, in totally working code:

- A prompt-template contract (`format_alpaca`, plus three others).
- A dataset that emits `(input_ids, target_ids, mask)`.
- A masked loss equivalent to PyTorch's `ignore_index=-100`.
- A training step that uses all of the above.

Hook a real GPT-2 (kata-set 060-ish) and a real instruction dataset
(1,100 entries from Raschka's repo) into this exact loop and you
have everything you need to instruction-tune a 124M-parameter model
on your laptop in under an hour.

That's chapter 7. You're done.

### Bridge

The next chapters cover **evaluation** — once you can train a model
to follow instructions, how do you decide if it's any good?
LLM-as-a-judge, BLEU/ROUGE for completions, etc. None of that is in
this dojo (Raschka covers it at the end of chapter 7); the dojo
moves on to the **reasoning** half of the curriculum after this.

If you want to dig deeper into the instruction-tuning side:
- Read Shi et al. 2024 (https://arxiv.org/abs/2405.14394) — the
  "actually, don't mask the instructions" paper Raschka cites.
- Read `LLMs-from-scratch/ch07/01_main-chapter-code/` end to end and
  compare its loop to yours. Confirm: same structure, same loss.
