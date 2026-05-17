# SENSEI — Streaming Generation

## Briefing

### Goal

Same compute as greedy generation, but `yield` each token one at a
time. This is the difference between a chat UI that feels instant and
one that feels broken.

### Tasks

Implement `stream_generate(model, input_ids, n_tokens)` as a **generator
function** (uses `yield`, not `return`).

- `model.eval()` and `torch.inference_mode()` as before.
- Loop `n_tokens` times:
  - Forward the running sequence.
  - Argmax the last position.
  - `yield` the new token as a Python `int` (use `.item()`).
  - Append to the running sequence.

### Hints

- A function with even *one* `yield` becomes a generator function.
  Calling it returns a generator object — no code runs until you
  iterate.
- `int(tensor.item())` gets you a Python int from a 0-d or 1-element
  tensor.
- `torch.argmax(..., keepdim=True)` still makes appending to the
  running sequence easy (shape `(1, 1)`).

## Prerequisites

- `greedy-on-tiny-gpt` — the non-streaming version.

## References

- Raschka build-reasoning ch2 listing 2.2 — `generate_text_basic_stream`
  has *exactly* this shape (with one extra detail: an EOS-token early
  exit, which this kata skips).
- PEP 255 — generators: https://peps.python.org/pep-0255/

## Teaching Approach

**Worked example, then Socratic about why streaming matters.**

### Socratic prompts

- "If streaming and non-streaming generate identical token sequences in
  identical wall-clock time, why bother streaming?" (Latency to *first*
  token. Users perceive responsiveness at the byte level. 200 tokens
  generated over 5 seconds: instant-first-byte feels fast, all-at-once
  feels broken.)
- "What about compute scheduling on the server?" (Stream lets a router
  multiplex many simultaneous chats. If every request waited for its
  full response, throughput drops because of bursty memory pressure.
  Streaming smooths it.)
- "Generators in Python — what's the difference between
  `def f(): return [1, 2, 3]` and `def f(): yield 1; yield 2; yield 3`?
  Trace through what each one does *before* the caller iterates."
  (The first runs the function body and allocates a list. The second
  returns a generator object — no body code runs yet.)
- "Why does the `test_is_lazy` test patch `model.forward` and check
  the call count is 0 right after calling `stream_generate`?" (To prove
  laziness — the function body only runs when consumed.)

### Common pitfalls

1. **Forgetting `.item()`** — yielding a tensor passes a 1×1 tensor
   instead of an int. Test `test_yields_python_ints` catches this.
2. **Using `return [list]`** — kills the laziness; also the test for
   `inspect.isgeneratorfunction` fails.
3. **Yielding before incrementing the running sequence** — works for
   token 1 but token 2 will repeat token 1 if you forgot to append.
   The order should be: forward → argmax → yield → append.
4. **Off-by-one on `n_tokens`** — make sure exactly `n_tokens` values
   are yielded. `for _ in range(n_tokens)` is the clean way.

## On Completion

### Insight

Streaming changes nothing about *what* the model generates — only
*when* tokens reach the caller. This is the difference between a chat
UI that feels alive and one that feels broken. The OpenAI / Anthropic /
HuggingFace SSE chat APIs all do exactly this dance.

### Bridge

`kv-cache-attention` attacks the *next* perceived-latency problem:
even with streaming, every new token requires re-attention over the
entire previous context. For long prompts and long outputs that
quadratic cost is the dominant chat-latency contributor. The KV cache
makes the per-step cost constant in past-context size.
