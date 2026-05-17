# SENSEI — Instruction Dataset

## Briefing

### Goal

Build the dataset class that turns a list of
`{"instruction": ..., "response": ...}` dicts into PyTorch-ready
`(input_ids, target_ids, mask)` triples.

The mask is the new idea: it carries the location of the **prompt /
response seam** through to the loss function. `mask=0` on prompt
tokens (don't compute loss here), `mask=1` on response tokens (this
is what the model is being trained to predict).

### Tasks

Implement `InstructionDataset(examples, tokenizer, max_length)`:

1. `__init__(self, examples, tokenizer, max_length)` stores the
   examples and tokenizer; precomputes nothing required (you may
   precompute encoded prompts/responses if you like). `tokenizer` is
   any object with:
   - `tokenizer.encode(text: str) -> list[int]`
   - `tokenizer.pad_id: int`

2. `__len__(self)` → number of examples.

3. `__getitem__(self, idx) -> tuple[torch.Tensor, torch.Tensor, torch.Tensor]`
   returns `(input_ids, target_ids, mask)`, all 1-D `torch.long`
   tensors of identical length, padded/truncated to `max_length`.

   The construction:
   - `prompt_text = format_alpaca(instruction, response=None)` — ends
     in `### Response:\n`. (Use the helper `format_alpaca` provided in
     this module — same as the earlier kata.)
   - `full_text = format_alpaca(instruction, response=response)`.
   - `prompt_ids = tokenizer.encode(prompt_text)`.
   - `full_ids = tokenizer.encode(full_text)`.
   - `input_ids = full_ids[:-1]` (standard LM shift).
   - `target_ids = full_ids[1:]`.
   - `mask` is the same length as `target_ids`. It is 0 at every
     position whose target lives inside the prompt span; 1 at every
     position whose target lives inside the response span; 0 at every
     padding position.

4. Pad with `tokenizer.pad_id` to `max_length` (both `input_ids` and
   `target_ids`), with mask 0 on padding. Truncate if longer.

### Hints

- The prompt span length in `target_ids` is `len(prompt_ids) - 1`
  positions. After that, until the original sequence ends, those
  positions are response. After the original sequence ends, those
  positions are padding.
- Trace the shift carefully with a tiny example by hand
  (4 prompt tokens + 3 response tokens, `max_length=10`).
- Use `torch.zeros(max_length, dtype=torch.long)` then assign
  `mask[a:b] = 1` for the response slice.

## Prerequisites

- Katas `alpaca-prompt-template` and `prompt-template-strategies`.
- Comfortable with PyTorch `Dataset` (chapter 2 katas).
- Comfortable with the input/target shift from kata
  `004-training-pairs-from-text`.

## References

- Raschka chapter 7 §7.3 — Listing 7.4 (`InstructionDataset`),
  Listing 7.5 (`custom_collate_fn` — note: that listing applies the
  mask via `-100` in targets; this kata teaches the same idea via an
  explicit mask tensor, which is what most production code now does).
- Raschka chapter 7 §7.3 figure 7.13 — the prompt/response masking
  diagram.

## Teaching Approach

**Method:** Code-reading + Parsons-style (the seam is the puzzle).

### Socratic prompts

- "Show me, on paper, the exact byte offset (or token index) where
  the prompt ends and the response begins for one of your examples.
  Now — why does that *exact* offset matter for **(a) loss masking,
  (b) generation, (c) evaluation**?" (Answer: (a) loss skips prompt;
  (b) generation seeds with prompt and asks model to continue;
  (c) eval extracts text *after* the offset.)
- "You compute `prompt_ids` and `full_ids` separately. Could the
  prompt encode to one length when standalone and a different length
  as a prefix of the full text?" (Answer: with most BPE tokenizers,
  NO if the tokenizer is deterministic AND the boundary lands on
  whitespace. But subword tokenizers CAN merge across boundaries.
  The simple `WordTokenizer` in the test never does this — but
  Raschka uses tiktoken, where it's still safe because the boundary
  is a newline.)
- "Why is the mask the same length as `target_ids`, not `input_ids`?"
  (Answer: the mask masks the loss; the loss is computed at target
  positions. There's one target per logit, not one target per input.)

### Common pitfalls

1. **Off-by-one on the seam** — input is `full_ids[:-1]`, target is
   `full_ids[1:]`. The mask is over target positions. The mask flips
   0→1 at target-position `len(prompt_ids) - 1`, because by then the
   target *itself* is the first response token. Draw it out.
2. **Padding gets mask=1** — easy bug. Pad first, then set mask
   only on the response slice; padding stays 0.
3. **Off-by-one on truncation** — if `len(full_ids) > max_length+1`,
   you truncate first then shift, OR shift then truncate to
   `max_length` — be consistent.
4. **Returning Python lists instead of tensors** — `__getitem__` must
   return `torch.long` tensors (the test calls `.shape` and `.dtype`).

## On Completion

### Insight

You've moved the **prompt/response seam** from being a string concept
("where does `### Response:` end") to a tensor concept (a 0/1 mask
over target positions). This is the single most important data
structure in supervised fine-tuning — it's what makes the loss
function "train on responses, ignore prompts."

That same mask, repurposed slightly, is also:
- The **attention mask** during generation (1 where there are real
  tokens, 0 on padding).
- The **assistant/user role mask** in tool-calling fine-tunes.
- The **completion mask** in RLHF/DPO datasets.

You wrote one. You now know all of them.

### Bridge

The next kata (`masked-loss`) takes the mask you just emitted and
plugs it into cross-entropy. You'll verify your implementation
matches `F.cross_entropy(..., ignore_index=-100)` exactly when masked
positions in targets are replaced with `-100`. Two formulations of
the same idea — which is Raschka's choice, which is yours, and why
either works.
