# SENSEI — Prompt Template Strategies

## Briefing

### Goal

Implement four prompt templates side by side — Alpaca, ChatML,
Llama-2, and Phi-3 — and feel the difference.

Same `(instruction, response)` in, four very different strings out.
Each string is a **contract** between a model and its tokenizer, fixed
at training time. Use the wrong contract at inference time and the
model behaves like it forgot what fine-tuning was for.

### Tasks

Each function takes `(instruction, response)` (no separate `input`
field — keep this kata focused on the template differences) and
returns the formatted string in that style.

1. `format_alpaca(instruction, response)` — Stanford Alpaca format.
   Same preamble + `### Instruction:` / `### Response:` headers as the
   previous kata.

2. `format_chatml(instruction, response)` — OpenAI ChatML format:

   ```
   <|im_start|>user
   {instruction}<|im_end|>
   <|im_start|>assistant
   {response}<|im_end|>
   ```

3. `format_llama2(instruction, response)` — Llama-2 chat format:

   ```
   <s>[INST] {instruction} [/INST] {response} </s>
   ```

4. `format_phi3(instruction, response)` — Microsoft Phi-3 format:

   ```
   <|user|>
   {instruction}<|end|>
   <|assistant|>
   {response}<|end|>
   ```

### Hints

- All four are pure string formatting. No tokenizer involved (yet) —
  the tokenizer's job is to turn these strings into IDs. Here, you
  just produce the strings.
- Look at the exact whitespace in each template. Llama-2 uses spaces
  around `[INST]` and `[/INST]`; ChatML uses newlines after the role
  marker; the special tokens (`<|im_end|>`, `<|end|>`, `</s>`) sit
  flush against the response, no leading space.

## Prerequisites

- Kata `alpaca-prompt-template` — you've already seen one of these.

## References

- Alpaca: https://github.com/tatsu-lab/stanford_alpaca
- ChatML: https://github.com/openai/openai-python/blob/release-v0.28.1/chatml.md
- Llama-2 chat:
  https://huggingface.co/blog/llama2#how-to-prompt-llama-2
- Phi-3:
  https://huggingface.co/microsoft/Phi-3-mini-4k-instruct#chat-format
- Raschka chapter 7 §7.2, figure 7.4 (Alpaca vs Phi-3 comparison).

## Teaching Approach

**Method:** Constraint variation + Socratic.

### Socratic prompts

- "These four templates encode the same information. So why are there
  four? Why didn't Microsoft just use Alpaca's format?" (Answer: each
  was designed alongside a tokenizer that has special tokens like
  `<|im_end|>` or `<s>`. The template is half of a *contract* with the
  tokenizer.)
- "Three of these templates use special tokens (`<|im_end|>`, `<|end|>`,
  `</s>`). One uses only ordinary ASCII (Alpaca: `### Response:`).
  Which is more robust to prompt injection? Which is easier for a
  model to learn to terminate?" (Answer: special tokens are more
  robust because the model can learn that token-id-50267 always means
  "stop generating"; ASCII markers can appear inside a response by
  accident.)
- After all four pass: "Templates are not a presentation detail. What
  are they?" (Answer: contracts. Between dataset prep and the model;
  between the model and the inference server; between the model and
  the tokenizer's special-token vocabulary.)

### Common pitfalls

1. **Whitespace drift** — `[INST] x[/INST]` vs `[INST] x [/INST]`
   look the same; they tokenize differently and the model trained
   with one will fail the other.
2. **Newlines after role markers** — ChatML and Phi-3 BOTH put a
   newline after `assistant` / `user` and BEFORE the content. Don't
   forget either one.
3. **Trailing special token** — Llama-2 ends with ` </s>` (space
   then `</s>`); ChatML/Phi-3 end with `<|im_end|>` / `<|end|>` with
   no trailing whitespace. The tests check this exactly.

## On Completion

### Insight

You implemented four templates in <50 lines, but each one represents
hundreds of millions of dollars of training compute that **only
behaves correctly when given strings in this exact shape**.

This is why HuggingFace ships `tokenizer.apply_chat_template` — to
keep this contract from drifting. Read its source someday; it's a
big `if model_id.startswith(...)` tree under the hood, doing what you
just did.

### Bridge

The next kata (`instruction-dataset`) takes a list of
`(instruction, response)` entries, formats them with a template, and
turns them into `(input_ids, target_ids, mask)` tensors — the actual
shape your model sees during fine-tuning. The **mask** is the new
thing: it tells the loss function which positions are "the model's
job to predict" (response tokens) vs "given context" (prompt tokens).
