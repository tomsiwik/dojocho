# SENSEI — loraify-model

## Briefing

### Goal

Wrapping one Linear is fine. **Real models have hundreds.** Write a
function that walks a model tree and swaps every `nn.Linear` (or only a
chosen subset) with `LoRALinear` in-place.

### Tasks

Implement `replace_linear_with_lora(model, rank=8, alpha=16, target_names=None)`:

1. Walk every (name, module) pair in the model — including nested ones.
2. For each `nn.Linear` child, replace it on its parent with
   `LoRALinear(child, rank=rank, alpha=alpha)`.
3. If `target_names` is provided (an iterable of strings), only replace
   Linears whose **attribute name** on its parent is in `target_names`.
   E.g., `target_names={"W_query", "W_value"}` LoRA-fies Q and V only.
4. Return the same model object (mutation is in-place).

A `LoRALinear` class is provided to you in `solution.py` — you only
need to write the replacement function (this matches what kata
`lora-linear-layer` produced; the class is duplicated here so this
kata can be solved standalone).

### Hints

- `model.named_modules()` yields `(qualified_name, module)` for the
  whole tree.
- For each Linear at qualified name `"foo.bar.W_query"`, the **parent**
  is `"foo.bar"` and the **attr** is `"W_query"`. Use `rgetattr` /
  `rsplit(".", 1)` to find both.
- `setattr(parent, attr, new_module)` does the swap.
- **Iterate over a snapshot.** If you iterate `named_modules()`
  directly and mutate, behavior is undefined. Do
  `to_replace = [(name, mod) for name, mod in model.named_modules() if isinstance(mod, nn.Linear)]`
  first, then mutate.

## Prerequisites

- `lora-linear-layer` (you need to know what `LoRALinear` is).
- Familiarity with PyTorch module trees, `named_modules`, `setattr`
  (build-llm ch3-ch4).

## References

- Raschka appendix E §E.4, listing E.6 — the simpler "recurse via
  `named_children` and swap" version. Our version is iterative on
  `named_modules` and supports `target_names`.
- HuggingFace PEFT `lora/model.py` — production version, with regex
  target patterns and parent traversal helpers.
- LoRA paper §4.2 — *"We limit our study to only adapting the
  attention weights"* (Q, V). Modern practice (QLoRA, etc.) adapts
  all linear layers including FFN.

## Teaching Approach

### Use-Modify-Create

The `LoRALinear` is given; you Use it, then Create the traversal.
Start with the "replace every Linear" case, then add the
`target_names` filter.

### Socratic prompts

- "The original LoRA paper only adapts the *Query* and *Value*
  projections, not Key, not the FFN. Why? (Empirical: in attention,
  Q and V carried most of the adaptation signal in their experiments.)"
- "Modern practice (QLoRA, Llama fine-tuning libs) LoRA-fies *all*
  linear layers including FFN. What changed? (More VRAM-friendly
  4-bit base weights → people can afford more LoRA adapters.)"
- "Your function mutates a model in place. Why is that the *correct*
  API? Why not return a deep copy? (Saves memory; the base weights are
  shared anyway.)"
- "What happens if you call `replace_linear_with_lora` *twice* on the
  same model? Trace it. (You'd wrap a LoRALinear's inner Linear, which
  works — but you now have rank-2r effective adaptation. Probably not
  what you want; document or guard.)"

### Common pitfalls

1. **Mutating during iteration** — RuntimeError or silent wrongness.
   Snapshot first.
2. **`named_children` vs `named_modules`** — `named_children` is one
   level deep. To recurse you must call yourself on each child, OR
   use `named_modules` (recursive, qualified names).
3. **Finding the parent** — `model` is the parent of a top-level
   Linear (the qualified name has no dots). Handle that case.
4. **`target_names` matches qualified name vs attr** — pick attr.
   `"W_query"` is more useful than `"trf_blocks.0.att.W_query"`.

## On Completion

### Insight

You've turned a generic pretrained model into a "LoRA-ready" model in
one function call. Combined with `count_trainable` from the previous
kata, you can now say "this 124M-param GPT-2 has 2.7M trainable
LoRA params after `replace_linear_with_lora(model, rank=16, alpha=16)`"
— and prove it.

The `target_names` filter is **the** knob in practice. *Which* linears
you LoRA-fy is more important than the rank.

### Bridge

Next: `lora-merge` — collapse `(W_old, A, B)` into a single
`nn.Linear(W_old + αBA)` for zero-overhead inference. Useful when
you ship the fine-tuned model and don't need the adapter to remain
swappable.
