# SENSEI — Classification Head Swap

## Briefing

### Goal

You have a pretrained LM that outputs `(B, T, vocab_size)`. To turn it
into a classifier you need `(B, T, n_classes)`. The cheapest possible
change: rip off the language modeling head and bolt on a classification
head.

The point of this kata is to feel — in code — what stays and what gets
thrown away when you "fine-tune for classification". 99% of the model
survives. 1% (the head) is brand-new and random.

### Tasks

1. Implement `swap_head(model, n_classes)`:
   - Replace `model.out_head` (an `nn.Linear(d_model, vocab_size)`)
     with a new `nn.Linear(d_model, n_classes)`.
   - Read `d_model` from the existing head's `in_features`.
   - Return the modified model. The new head must be trainable
     (`requires_grad=True` on its params).
2. Implement `body_state_dict(model)`:
   - Return a dict of `{name: tensor.clone()}` for every parameter
     that is NOT in `model.out_head`. Used so the test can verify the
     body is byte-for-byte identical after the swap.
3. Implement `verify_body_unchanged(model, snapshot)`:
   - Return `True` iff every tensor in `snapshot` matches the
     corresponding current model param exactly (`torch.equal`).

### Hints

- `model.out_head.in_features` and `model.out_head.out_features` exist
  on any `nn.Linear`.
- `nn.Linear(in_features, out_features)` — the new layer's
  `requires_grad` is `True` by default.
- `model.named_parameters()` gives `(name, tensor)` pairs. Filter by
  whether `name.startswith("out_head")`.
- `torch.equal(a, b)` is strict (exact bytes); `torch.allclose` is
  tolerant. Use `equal` — you haven't trained yet, nothing should drift.

## Prerequisites

- Kata 003 (encoder-vs-decoder) — you've seen the GPT-style stack.
- Comfort with `nn.Module`, `nn.Linear`, `named_parameters`.

## References

- Raschka chapter 6 §6.5 — "Adding a classification head" (listing
  6.7).
- `torch.nn.Linear` — https://pytorch.org/docs/stable/generated/torch.nn.Linear.html

## Teaching Approach

Worked example + Socratic on what survives.

### Socratic prompts

- "Before the swap: how many parameters does the head have? After the
  swap (for a 2-class task)? Order-of-magnitude difference?"
- "After the swap, which weights still encode 'English'? Which weights
  encode 'is this spam'? Where in the model does each live?"
- "Why is replacing the head enough? Why can't we just `argmax` over
  the vocabulary and call class 0 = token id of 'ham'?"
  (Hint: the model was never trained to put 'ham' on the last
  position. The head is a linear *projection*; you can re-aim it.)
- "What does `requires_grad=True` on the new head, combined with the
  rest of the model still trainable, give you in a backward pass? What
  if the rest were frozen? You'll do both — this kata is the
  unfreezing baseline."

### Common pitfalls

1. **Hardcoding 768** — read `d_model` from `out_head.in_features`.
   Other model sizes will break a hardcoded constant.
2. **Forgetting `bias`** — the spam-classifier head in Raschka uses
   default bias=True. That's fine; the original LM head has
   `bias=False`. Don't try to preserve the old bias setting; the new
   head is a fresh layer.
3. **Cloning vs referencing in `body_state_dict`** — you MUST `.clone()`
   the tensors. Otherwise the "snapshot" is a live view of the model
   and any later mutation invalidates the test.
4. **Comparing all params including the head** — the head is supposed
   to change. Filter `out_head` out of the body snapshot.

## On Completion

### Insight

You just did 90% of "classification fine-tuning" structurally. The
remaining 10% is choosing which layers stay frozen, picking the loss,
and running the training loop. The pretrained weights — every
attention head, every FFN, every layernorm — are still there, holding
everything they learned about English.

This is also the structural pattern for ANY task head: regression
(linear to 1), token classification (linear to n_classes per token),
sequence-pair scoring (linear to 1 over a pooled representation). The
body stays. The head is task-specific.

### Bridge

Next kata: how do you *summarize* a `(B, T, d_model)` sequence down to
`(B, d_model)` before the head? Three options: take the last token,
mean-pool, attention-pool. Each encodes a different assumption about
where the "answer" lives.
