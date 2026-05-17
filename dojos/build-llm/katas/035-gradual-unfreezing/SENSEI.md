# SENSEI — Gradual Unfreezing

## Briefing

### Goal

Fine-tuning the whole model from epoch 0 risks **catastrophic
forgetting**: the head is random, gradients flowing back are noise,
and your beautifully pretrained lower layers get scrambled.

The ULMFiT recipe (Howard & Ruder, 2018): **unfreeze from the top
down, one layer per epoch.** Epoch 0–1: just the head. Epoch 2: head
+ last block. Epoch 3: head + last two blocks. And so on, until the
whole model is fluid.

You're going to write the scheduler function that implements this
policy.

### Tasks

1. Implement `count_blocks(model)` — return `len(model.blocks)`.
2. Implement `unfreeze_for_epoch(model, epoch, head_only_epochs=2)`:
   - Always freeze the embedding (`tok_emb`).
   - The head (`out_head`) and `final_norm` are always trainable.
   - For `epoch < head_only_epochs`, everything else is frozen.
   - For `epoch >= head_only_epochs`, unfreeze the last
     `(epoch - head_only_epochs + 1)` blocks (clamped to the total
     block count). Earlier blocks stay frozen.
   - Idempotent: calling it twice with the same epoch gives the same
     state.
3. Implement `schedule_summary(model, n_blocks, n_epochs,
   head_only_epochs=2)`:
   - Return a `list[set[str]]` of length `n_epochs`. Entry `i` is the
     set of top-level module names that are trainable at epoch `i`
     (e.g. `{"out_head", "final_norm"}` for epoch 0, then
     `{"out_head", "final_norm", "blocks.N-1"}` later, etc.).
   - This is the function your tests use to verify the schedule.

### Hints

- "Top-level module name" for `blocks.2.attn.weight` is `"blocks.2"`.
  For `out_head.weight` it's `"out_head"`. Split on `.` and join the
  first one or two parts.
- `range(n_blocks - k, n_blocks)` gives the indices of the last `k`
  blocks.
- Re-freeze before re-unfreezing each epoch — that's what makes it
  idempotent and what lets `epoch=0` after `epoch=5` actually go
  back to head-only.
- `model.tok_emb`, `model.blocks`, `model.final_norm`, `model.out_head`
  are the four top-level modules in the tiny fixture.

## Prerequisites

- Kata `freeze-unfreeze-verify` (you wrote the underlying primitives).
- Kata `classification-train-step` (you know what the optimizer
  does with trainable params).

## References

- Howard & Ruder, "Universal Language Model Fine-tuning for Text
  Classification" (ULMFiT), 2018 — section 3.4 "Gradual unfreezing".
  https://arxiv.org/abs/1801.06146
- Raschka chapter 6 §6.5 — defaults to unfreezing the last block and
  final norm; gradual unfreezing is the natural generalization.

## Teaching Approach

Code-reading + Socratic on *why this order*.

### Socratic prompts

- "If you unfroze ALL layers from epoch 0 with a random head, what's
  the first gradient that flows into layer 0? Is it signal or noise?"
  (Answer: pure noise routed through a random head. You overwrite
  pretrained features.)
- "Why unfreeze top-down (last block first) rather than bottom-up?
  What do the bottom layers store vs the top layers?" (Bottom: token
  identity, syntax. Top: task-shaped semantics. The top is more
  task-specific, the bottom is more universal — so the top moves
  first, and the bottom is left alone the longest.)
- "If `head_only_epochs=0`, what does this become?" (Just unfreezes
  one more block per epoch starting epoch 0.)
- "Why never unfreeze `tok_emb`? When MIGHT you?" (Domain shift,
  e.g. fine-tuning on medical text. Rare for short classification
  jobs.)
- "Your scheduler clamps at `n_blocks`. What happens at epoch 100?"
  (All blocks unfrozen; behaves identically to epoch
  `head_only_epochs + n_blocks - 1` onward — full fine-tuning.)

### Common pitfalls

1. **Not refreezing first** — if epoch N had blocks.0–blocks.5
   unfrozen and epoch N+1 should unfreeze fewer (e.g. because of a
   bug or a non-monotonic schedule), forgetting to freeze first
   leaves them unfrozen. Always: `freeze_all → unfreeze chosen
   subset`.
2. **Off-by-one on which blocks are "last"** — for `n_blocks=4`
   and `k=2`, the last two are indices `[2, 3]`, not `[1, 2]`. Use
   `range(n_blocks - k, n_blocks)`.
3. **Unfreezing `tok_emb` by accident** — if you iterate
   `model.named_modules()` and unfreeze any module whose name starts
   with "" (the empty top-level), you'll unfreeze everything.
   Whitelist the targets, don't blacklist.
4. **`top_level_name`** — `out_head.weight` should map to
   `"out_head"`, not `""` and not `"out_head.weight"`.

## On Completion

### Insight

The schedule encodes a **prior over which knowledge is reusable**.
Bottom layers learned the alphabet and syntax — those generalize to
basically any text task, so you leave them alone. Top layers learned
"how to predict next token in pretraining-distribution text" — that's
the most task-specific, so it gets remade first. The middle is a
gradient.

This is also why parameter-efficient methods (LoRA, adapters, prefix
tuning) work so well: they encode the same prior — "only the top of
the stack needs to change" — but via low-rank updates instead of
unfreezing. The kata you just wrote is gradual unfreezing's *full
rank* counterpart.

### Bridge

You've completed chapter 6 of build-llm. You can:
- Swap a head for any number of classes.
- Pick a pooling strategy and defend it.
- Freeze, unfreeze, and verify gradients.
- Run one training step on classification data.
- Schedule layer unfreezing across epochs.

That's the entire pipeline. Chapter 7 (instruction fine-tuning)
keeps the loss function — still cross-entropy — but replaces the
classification head with the original LM head and trains on
(instruction → response) pairs. The freeze/unfreeze infrastructure
you built here carries straight over.
