# SENSEI — response-distillation-dataset

## Briefing

### Goal

Build the **hard-distillation dataset**: feed a list of prompts to the
teacher, greedy-generate its responses, and emit
`(prompt_ids, teacher_response_ids)` pairs you'd later use for plain
supervised fine-tuning of the student.

This is the DeepSeek-R1 distillation recipe (Raschka chapter 8 §8.2):

> *"Instead of sampling multiple student responses and computing
> rewards, we feed these problems to an existing reasoning model
> (the teacher) and collect its responses as training targets."*

No teacher logits required — just the generated text. That's why
this approach works even when the teacher is a closed API.

### Tasks

Implement in `solution.py`:

```python
def make_distill_dataset(
    teacher: torch.nn.Module,
    prompts: list[str],
    tokenizer,
    max_new_tokens: int = 16,
    seed: int = 0,
) -> list[tuple[torch.Tensor, torch.Tensor]]:
```

For each prompt:

1. Tokenize the prompt → `prompt_ids` (1D long tensor).
2. Greedy-generate `max_new_tokens` tokens from the teacher,
   conditioned on `prompt_ids`. Stop early if the teacher emits
   `tokenizer.eos_id` (if present).
3. Return the pair `(prompt_ids, response_ids)` where
   `response_ids` is **only the newly generated tokens** (not the
   prompt).

Set the seed at the start of the function (`torch.manual_seed(seed)`)
so the output is deterministic — greedy decoding alone is
deterministic, but argmax ties are broken consistently this way.

### The tokenizer contract

The test will pass you a small object with this surface:

```python
class TinyTokenizer:
    eos_id: int | None      # may be None
    vocab_size: int
    def encode(self, text: str) -> list[int]: ...
    def decode(self, ids: list[int]) -> str: ...
```

You only need `.encode` for the prompt. You do not need to decode
inside the function (the test will).

### The teacher contract

The teacher is an `nn.Module` whose `forward(x)` takes a long tensor
of shape `(B, T)` and returns logits of shape `(B, T, V)`. Greedy
generation pattern:

```
for _ in range(max_new_tokens):
    logits = teacher(seq.unsqueeze(0))     # (1, T, V)
    next_id = logits[0, -1].argmax()       # scalar
    if next_id == eos_id: break
    seq = torch.cat([seq, next_id.unsqueeze(0)])
```

### Hints

- `torch.no_grad()` around the teacher call. Saves memory; you're not
  training.
- `teacher.eval()` at the start.
- Greedy generation = `argmax` of the last-position logits.
- The response should be a 1D long tensor. Empty (length 0) is a
  valid return if the very first generated token is EOS.

## Prerequisites

- Kata: `autoregressive-generation` (the generation loop pattern).
- Kata: `train-student-distill` (the soft-distillation counterpart).

## References

- Raschka, *Build a Reasoning Model from Scratch*, chapter 8 §8.2
  *"Generating a dataset for reasoning distillation"* — this kata
  is the toy version of that pipeline.
- DeepSeek-R1 paper, section on distilled variants — same recipe at
  671B-parameter scale.
- Raschka's data-gen code:
  https://github.com/rasbt/reasoning-from-scratch/tree/main/ch08/02_generate_distillation_data

## Teaching Approach

**Worked example.** Mechanical pipeline — generation loop you've
already written, wrapped in a list comprehension. The teaching is
in the *why*, which lives in SENSEI's "On Completion":

### Socratic prompts

- **The big shift.** "What does this pipeline need from the teacher
  that `train-student-distill` did NOT?" (Answer: it does NOT need
  logits — only the generated tokens. So you can do this with a
  *closed-API* teacher like GPT-4 or Claude. The soft-distillation
  approach requires logit access, which most production teachers
  don't expose.)

- **Why greedy?** "Why argmax instead of sampling?" (Answer:
  determinism for reproducibility, and the teacher's most-likely
  continuation is the highest-quality signal. Real systems
  sometimes use temperature ~0.7 and generate multiple samples per
  prompt for diversity — see DeepSeek-R1's rejection-sampling
  phase.)

- **The EOS detail.** "What goes wrong if you never check for
  EOS?" (You generate `max_new_tokens` of post-EOS garbage. The
  model will mostly produce padding/repetition, which the student
  then has to learn to imitate. Disaster.)

### Common pitfalls

1. **Including the prompt in the response.** The pair is
   `(prompt_ids, response_ids)`. `response_ids` is the **new**
   tokens only, not the full concatenation. Easy to slice wrong.

2. **Forgetting `no_grad`.** Wastes memory; in a 1000-prompt
   dataset this gets expensive even for small models.

3. **Wrong logits indexing.** `logits[0, -1]` for the last
   position. `logits[0, 0]` is the first position's prediction —
   wrong direction.

4. **Argmax tie-breaking.** With a freshly-initialized tiny
   teacher, logits can be near-tied and PyTorch's argmax breaks
   ties by the first occurrence. The `seed` parameter doesn't fix
   this directly, but seeding before any random op keeps repeat
   calls bit-identical.

## On Completion

### Insight

You just built the data-prep half of the DeepSeek-R1 distillation
recipe — the same pipeline that distilled the 671B-parameter R1
into the Qwen-7B, Llama-8B, and Qwen-32B "distill" variants that
ship to consumers.

The cleanness of this approach is its real superpower: the output
is *just text*, indistinguishable from any other dataset. You can
cache it on disk, share it on HuggingFace, train any student
architecture or tokenizer family — the teacher is now decoupled
from the student. Raschka's chapter 8 dataset on HuggingFace
(`rasbt/math_distill`, 107 MB) is exactly this shape: prompt +
teacher response.

For closed-API teachers (GPT-4, Claude), this is the *only* form
of distillation legally and technically available — and even there,
provider ToS may restrict using outputs for training. (Raschka
flags this explicitly in §8.1.)

### Bridge

You now have a (prompt, teacher_response) dataset. Concatenate each
pair into a single sequence (with the prompt-vs-response split
recorded), build a DataLoader, and run a vanilla SFT training loop
on the student — which is exactly the loop you wrote in
`training-loop` / `instruction-train-step`. Hard distillation **is**
SFT-on-synthetic-data; nothing new from the optimizer's side.

This is the end of chapter 8 and of the build-reasoning book. The
katas after this jump into the appendices.
