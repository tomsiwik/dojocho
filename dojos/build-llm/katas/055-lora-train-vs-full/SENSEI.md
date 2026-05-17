# SENSEI — lora-train-vs-full

## Briefing

### Goal

Feel the trade-off in your hands. Train the **same tiny model** on
`y = 3x + 2` two ways:

1. **Full fine-tune** — every weight is trainable.
2. **LoRA fine-tune** — the original weights are frozen; a rank-`r`
   adapter is trained.

You'll observe two things:

- LoRA has dramatically **fewer trainable parameters**.
- Both still **converge** to low MSE on this simple task.

That's the LoRA pitch in 10 lines of training code.

### Tasks

Implement two functions, each taking `steps`, `lr`, and a `seed`, each
returning a dict with keys `final_loss` (float) and `trainable_params`
(int):

1. `train_full(steps=400, lr=0.05, seed=0) -> dict` — build a small
   MLP. **Hidden dim matters**: at `Linear(1, 8)` the model is so
   small that LoRA's `A + B` (per layer: `in*r + r*out`) exceeds the
   original `in*out` parameter count. Use something like
   `Linear(1, 64) -> ReLU -> Linear(64, 64) -> ReLU -> Linear(64, 1)`
   so the savings are actually visible. Train **all** parameters on
   `y = 3x + 2` (synthesize `x` from `torch.linspace(-1, 1, 64)`).
2. `train_lora(steps=400, lr=0.05, seed=0, rank=2, alpha=4) -> dict` —
   build the same model with the **same initial weights** (use the same
   seed), wrap every Linear with `LoRALinear(rank, alpha)`, then train.

Use MSE loss and Adam.

A `LoRALinear` and `replace_linear_with_lora` are provided.

### Hints

- Synthetic data:
  ```python
  x = torch.linspace(-1, 1, 64).unsqueeze(1)
  y = 3 * x + 2
  ```
- For both: `torch.manual_seed(seed)` BEFORE constructing the model
  so the initial random weights match. Then for the LoRA variant,
  wrap.
- `optim.Adam([p for p in model.parameters() if p.requires_grad], lr=lr)`
  filters to only the trainable params (the frozen ones have no
  gradient anyway, but this keeps Adam from allocating optimizer
  state for them).
- Use `count_trainable` style: `sum(p.numel() for p in model.parameters() if p.requires_grad)`.

## Prerequisites

- Previous four LoRA katas.
- A basic training loop (build-llm ch5 or any prior MSE-regression
  experience).

## References

- Raschka appendix E §E.4 listing E.7 — same training pattern,
  much bigger model and harder task.
- LoRA paper §4-5 — the actual experiments showing LoRA matches full
  fine-tuning on GLUE.

## Teaching Approach

### Demonstration + Socratic

Run, observe, discuss. The trade-off is the lesson, not the
implementation.

### Socratic prompts

- "How many trainable parameters in the full model? In the LoRA
  variant? What's the ratio?"
- "Both converge on `y = 3x + 2`. Does that mean LoRA is *always*
  enough? Construct a task where LoRA would fail." (Hint: think about
  what rank-r limits. If the optimal `ΔW` is full-rank, low-rank can
  only approximate.)
- "What if you set `rank` very small (e.g., 1)? Does it still
  converge on this task? Why? (Yes, because `y = 3x + 2` is itself
  a rank-1 transformation; one direction of adaptation suffices.)"
- "In production LLM fine-tuning, when do practitioners use full FT
  over LoRA?" (Answer: when the downstream task is far from the
  pretraining distribution — e.g., changing language, domain shift to
  highly specialized vocab. LoRA is "small nudge to a strong base"; if
  you need a *big* nudge, the low-rank assumption breaks down.)

### Common pitfalls

1. **Different initial weights** — if you don't `manual_seed` before
   constructing both models, you compare apples to oranges. The
   full-FT model has random init; the LoRA model has random init
   *plus* `B=0` so the base weights are also random. Same seed gives
   same base.
2. **Training the LoRA variant without filtering optimizer params** —
   technically works (frozen params get zero grad), but Adam will
   allocate state for them, defeating the memory win. Filter
   explicitly.
3. **Tolerance too tight** — `final_loss < 0.01` is reasonable;
   `< 1e-6` may not happen in 400 steps. The tests use a generous
   bound.
4. **Forgetting `.detach()` or `.item()`** — `final_loss` should be a
   Python float, not a 0-dim tensor with a graph attached.

## On Completion

### Insight

You just reproduced Raschka's headline result on a 200-line scale:
**LoRA converges with ~10× fewer trainable parameters**. On this
trivial task, both reach the same loss. On a real LLM, LoRA gets
within a fraction of a percent of full fine-tuning on most downstream
tasks — at a fraction of the cost.

The cost LoRA pays is **expressivity**. The update is constrained to a
rank-`r` subspace. For most adaptation tasks (sentiment, classification,
instruction-following), that subspace is more than enough. For domain
shifts that fundamentally rewire the model (e.g., a model that's
never seen Python learning Python from scratch), full FT — or a high
rank — is needed.

### Bridge

You've finished build-llm appendix E. You can now:
- Wrap any Linear in a LoRA adapter (`lora-linear-layer`).
- Count the savings (`lora-parameter-count`).
- LoRA-fy an entire model (`loraify-model`).
- Collapse a fine-tuned adapter into a single layer (`lora-merge`).
- Train a model both ways and compare (this kata).

Next stop (if you came from build-llm chapter 7): instruction
fine-tuning. LoRA composes naturally with the instruction-tuning
loss; the only thing that changes is the dataset.
