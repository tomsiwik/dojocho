# SENSEI — Greedy on Tiny GPT

## Briefing

### Goal

Lift the autoregressive generation loop you already know onto a real
(tiny) transformer LM. Same recipe as `002-autoregressive-generation`,
new context: a `TinyGPT` model with token embeddings, positional
embeddings, transformer blocks, and an LM head.

The model is provided. You just write the loop.

### Tasks

Implement `generate_greedy(model, input_ids, n_tokens)`:

1. Put the model in eval mode and disable gradients
   (`torch.inference_mode()`).
2. Loop `n_tokens` times. Each iteration:
   - Forward the running sequence through `model` → logits
     `(B, T, vocab)`.
   - Take the last position's logits: `logits[:, -1, :]`.
   - Argmax over vocab to get the next token ID, shape `(B, 1)`.
   - Concatenate onto the running sequence along dim=1.
3. Return the full `(B, T + n_tokens)` tensor.

### Hints

- `torch.argmax(x, dim=-1, keepdim=True)` keeps the trailing dim so the
  result has shape `(B, 1)` — perfect for `torch.cat([seq, next], dim=1)`.
- `n_tokens=0` should just return the prompt. No loop iterations,
  nothing fancy.
- Wrap the whole thing in `with torch.inference_mode():` — both for
  speed and because the test reference does the same.

## Prerequisites

- `002-autoregressive-generation` — same loop, dict-based "model."
- `full-gpt-model` — same architecture shape, more depth.

## References

- Raschka build-reasoning ch2 §2.6–2.7 — listing 2.2 is the exact
  function pattern. (Yours is the non-streaming variant: collect into
  one tensor instead of yielding.)
- `torch.inference_mode`:
  https://pytorch.org/docs/stable/generated/torch.inference_mode.html

## Teaching Approach

**Skip the Socratic — this is review.** The student already met
autoregressive generation in ch1 (build-llm) with a dict model. Here
the only new thing is "model is a Module, call `model(idx)` and slice
the last position." If they're stuck, point at `002`'s solution and
ask: "What's the same? What's different?"

### Common pitfalls

1. **Forgetting `keepdim=True`** — `argmax` then drops the vocab dim
   and you get shape `(B,)` instead of `(B, 1)`. `torch.cat` will
   either error or silently broadcast wrong.
2. **Using `logits[-1]` instead of `logits[:, -1, :]`** — the first
   indexes batch; you want the last *time* position.
3. **Slicing `logits` then re-running `argmax` over the wrong dim** —
   after `logits[:, -1, :]` the shape is `(B, V)`. Argmax over `dim=-1`
   gives `(B,)` (or `(B, 1)` with keepdim).

## On Completion

### Insight

You just wrote the inner loop of every chat model on the planet. The
remaining katas in this chapter are about making this loop:
1. **Stream** instead of returning a final tensor (kata 3).
2. **Stop recomputing** previous-token K/V (kata 4 — KV cache).
3. **Format inputs** so a chat-tuned model knows where the user message
   ends and the assistant message begins (kata 5).
4. **Use the architecture** real models actually use (GQA — kata 2).

### Bridge

`qwen-vs-vanilla-attention` peeks inside the model: real LLMs (Qwen3,
Llama 3, Mistral) don't use vanilla multi-head attention — they use
**Grouped-Query Attention** to shrink the KV cache. Build both
side-by-side and compare their parameter counts.
