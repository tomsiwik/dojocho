# SENSEI — Alpaca Prompt Template

## Briefing

### Goal

Implement the Alpaca prompt template — the formatting contract that
turns a `(instruction, input, response)` triple into the exact string
the model trains on.

This is the **first invisible thing about instruction tuning**: the
model never sees your dict. It sees a string. If the string at
inference time doesn't match the string at training time — down to
the whitespace — the model behaves like it forgot how to follow
instructions.

### Tasks

1. Implement `format_alpaca(instruction, input, response)` that
   produces this exact string:

   ```
   Below is an instruction that describes a task. Write a response that appropriately completes the request.

   ### Instruction:
   <instruction>

   ### Input:
   <input>

   ### Response:
   <response>
   ```

2. If `input` is an empty string, the `### Input:` section is omitted
   entirely (no blank header).

3. If `response` is `None`, omit the `### Response:` section AND its
   leading blank line — the prompt should end with `### Response:` on
   its own line followed by a trailing newline, so the model knows
   where to start generating. (See the inference test for exact shape.)

### Hints

- Use plain `f"..."` string composition, not `textwrap` or `dedent`.
- Two newlines (`\n\n`) separate each section from the next.
- The preamble ("Below is...") is fixed text — copy it verbatim.

## Prerequisites

- Comfortable with Python f-strings and conditional concatenation.
- Chapter 7 §7.2 (read it first — Listing 7.2 is what you're
  reimplementing, extended with a `response` argument).

## References

- Raschka chapter 7 §7.2 ("Preparing a dataset for supervised
  instruction fine-tuning") — Listing 7.2 (`format_input`).
- Original Alpaca repo:
  https://github.com/tatsu-lab/stanford_alpaca#data-release

## Teaching Approach

**Method:** Use-Modify-Create + Socratic.

### Socratic prompts

- "Read Raschka Listing 7.2. What does `format_input` return for an
  entry where `input == ''`? Now: what does your function need that
  `format_input` doesn't have?" (Answer: the `### Response:` section,
  which Raschka concatenates separately.)
- "A model fine-tuned on Alpaca format is given a ChatML-formatted
  prompt at inference. What happens to its output quality, and *why*?"
  (Answer: it degrades — the model has learned that responses come
  after `### Response:\n`, and that string is now missing.)
- "Why does `format_alpaca(..., response=None)` end with `### Response:`
  and a newline? What signal is that newline?" (Answer: it tells the
  model "your turn starts now.")

### Common pitfalls

1. **Wrong number of newlines** — `### Instruction:\n{instr}` is one
   newline; the section *separator* `\n\n` between sections is two.
   Mix them up and your training prompts won't match your inference
   prompts.
2. **Treating empty input as a missing field by checking falsy**
   — `if input:` is fine for `""` and `None`, but be explicit; the
   tests pass exactly `""`.
3. **Including `### Response:` when response is None but adding the
   value `None` underneath** — `f"### Response:\n{None}"` puts the
   string `"None"` in your prompt. The test catches this.

## On Completion

### Insight

You've written about 10 lines of code. Those 10 lines are the contract
between your dataset and your model. Every instruction-tuned model in
production has a function like this; every chat template
(`tokenizer.apply_chat_template` in HuggingFace) is doing the same
thing for ChatML, Llama, etc.

The number-one reason a fine-tune "doesn't work" in practice is a
mismatch between this function at training time and the prompt at
inference time. Treat it like an API contract, not a presentation
detail.

### Bridge

The next kata implements four templates side by side
(`format_alpaca`, `format_chatml`, `format_llama2`, `format_phi3`)
and forces you to confront *why* they're different — not stylistic
preference, but training-time decisions made by different teams.
