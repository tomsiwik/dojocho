# SENSEI — Chat Template (Qwen3)

## Briefing

### Goal

The model isn't trained on raw text — it's trained on text wrapped in
a specific **chat template**. The template tells the model where a
message starts, who said it, and where it ends. Send slightly different
text at inference and you get garbage output.

You will implement `format_qwen_chat(messages, add_generation_prompt)`
and its inverse `parse_qwen_chat(text)` for the Qwen3 template.

### Template

Each message is:

    <|im_start|>{role}\n{content}<|im_end|>\n

Roles: `system`, `user`, `assistant`. A `system` message, if present,
must come first.

When `add_generation_prompt=True`, append:

    <|im_start|>assistant\n

(without closing `<|im_end|>` — the model is supposed to *continue*
from there).

### Tasks

1. **`format_qwen_chat(messages, add_generation_prompt=False)`**
   - Validate roles. Validate that `system`, if present, is at index 0.
   - Concatenate the per-message wrap.
   - Optionally append the generation prompt header.

2. **`parse_qwen_chat(text)`**
   - Inverse of format (ignoring the trailing generation prompt, if any).
   - Return `[{"role": ..., "content": ...}, ...]`.
   - A regex like `r"<\|im_start\|>(system|user|assistant)\n(.*?)<\|im_end\|>\n"`
     with `re.DOTALL` is the natural tool.

### Hints

- Use raw strings or escape carefully. The literal token strings are
  `<|im_start|>` and `<|im_end|>`.
- `re.findall(pattern, text, re.DOTALL)` with two capture groups
  returns a list of `(role, content)` tuples — perfect for parsing.
- Content may contain newlines. The DOTALL flag makes `.` match `\n`,
  and `.*?` makes it non-greedy so it doesn't gobble across messages.

## Prerequisites

- `bpe-via-tiktoken` — to understand that the model sees *tokens*, not
  strings. The chat template is the string format the tokenizer turns
  into tokens.

## References

- Raschka build-reasoning ch2 — `Qwen3Tokenizer._wrap_chat` shows the
  exact string format.
- HuggingFace Qwen3 model card — the official chat template
  (Jinja2 form): https://huggingface.co/Qwen/Qwen3-0.6B
- HuggingFace chat-template docs:
  https://huggingface.co/docs/transformers/main/en/chat_templating

## Teaching Approach

**Worked example + Socratic about the contract.** Show the template
once, then ask:

### Socratic prompts

- "Why is the template what it is? What does the model gain from seeing
  `<|im_start|>user\\n` instead of just `user: `?" (Special tokens are
  *single* token IDs in the vocab, atomic and unambiguous. `user:` is
  multiple tokens and could appear inside user content — collisions
  ruin everything.)
- "The model was trained on this exact format. What if we send a
  slightly different one — say, `<|im_start|>USER\\n` (uppercase) or
  `<|im_start|>user: ` instead of `<|im_start|>user\\n`?" (Tokenizer
  doesn't have those as special tokens — they tokenize as ordinary text.
  The model has never seen this pattern; it produces nonsense or
  ignores the role distinction.)
- "What if you forget `add_generation_prompt=True` at the end?" (You
  feed a complete conversation including the assistant turn the model
  was supposed to write. The model continues — often by starting a new
  `<|im_start|>user\\n` turn and roleplaying both sides. Hilarious in
  isolation, broken in production.)
- "Why must `system` come first?" (The training format puts it first.
  A `system` message later isn't *broken*, but the model has never seen
  it there, so behavior is undefined. Treat the template as a strict
  contract.)
- "Some chat templates also include reasoning tokens like `<think>...
  </think>` (DeepSeek-R1, Qwen-Reasoning). What's the same? What's
  different?" (Same: deterministic string wrap with special tokens.
  Different: the *meaning* — these mark a CoT region the system can
  optionally strip before showing the user.)

### Common pitfalls

1. **Missing trailing newline on `<|im_end|>\\n`** — silently breaks
   tokenization for the *next* message. The newline isn't decorative.
2. **Greedy regex** — `<\|im_start\|>(\w+)\n(.*)<\|im_end\|>` with
   greedy `.*` will swallow multiple messages. Use `.*?` (non-greedy)
   with `re.DOTALL`.
3. **Validating `system` only at index 0 but not elsewhere** — a system
   message at index 2 should *raise*, not silently render.
4. **Not handling empty `messages=[]`** — should return `""` or just
   the generation prompt. Don't crash.
5. **Hardcoding `assistant` as the generation role** — fine for Qwen3
   specifically, but be aware the template is *role-specific*. Other
   templates differ.

## On Completion

### Insight

The chat template is the model's API contract. You don't get to
"format messages however you want" — the model was trained on one
exact text protocol, and inference must match. This is true for every
chat-tuned model in existence: Qwen, Llama-Chat, Mistral-Instruct,
Claude (via the API), GPT-4 (via system/user/assistant roles internally
mapped to ChatML). Different templates, same idea: a fixed string
format with special tokens demarcating roles.

When you see "this model gave a bad response" in production, this is
the first place to look. Wrong template → wrong outputs, every time.

### Bridge

This is the last kata of chapter 2. You can now: load a model, run
attention (vanilla or GQA), generate text greedily, stream the output,
cache the KV-state for fast incremental decoding, *and* format the
input correctly for a chat-tuned model. Chapter 3 (evaluation) builds
directly on top: you'll feed structured benchmarks through this same
pipeline to measure model quality.
