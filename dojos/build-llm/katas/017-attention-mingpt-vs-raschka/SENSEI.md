# SENSEI — Attention: minGPT vs Raschka

## Briefing

### Goal

Read two **different** real-world implementations of the same thing —
causal multi-head self-attention — and prove they compute the same
function. The point is **fluency at reading real attention code**, not
writing more of it. After this kata you should be able to walk into any
transformer codebase and locate the QKV projection, the mask, the
scale, and the head split within 30 seconds.

The two implementations:

- **Raschka** — `MultiHeadAttention` from
  `LLMs-from-scratch/ch03/01_main-chapter-code/mha.py` (also listing
  3.5 in chapter 3). You implemented an equivalent class in the
  previous kata.
- **Karpathy** — `CausalSelfAttention` from
  `minGPT/mingpt/model.py`.

### Tasks

1. **Read both classes** (URLs in References). For each one, locate
   and label these landmarks:
   - The Q, K, V projection(s).
   - The reshape that introduces the `num_heads` dimension.
   - The mask construction and where it is applied.
   - The softmax and the `1/sqrt(head_dim)` scale.
   - The output projection.
   - The dropout(s).

2. **Identify the three structural differences.** They produce the
   *same function* (given matching weights) but the code looks different
   because of:
   - **(a) Number of QKV linear layers.** Raschka has three separate
     `nn.Linear(d_in, d_out)`. Karpathy has one fused
     `nn.Linear(n_embd, 3 * n_embd)` (the `c_attn` layer), which is
     then split with `.split(n_embd, dim=2)`.
   - **(b) Mask source and storage.** Raschka uses
     `torch.triu(ones, diagonal=1)` (the cells to mask are 1).
     Karpathy uses `torch.tril(ones).view(1, 1, T, T)` (the cells to
     *keep* are 1) and masks where the kept-cells tensor *equals zero*.
     Same effect, opposite convention.
   - **(c) Attention dropout placement and presence.** Karpathy has an
     extra `self.attn_dropout(att)` between softmax and the value
     matmul that Raschka's `CausalAttention` also has (`self.dropout`)
     — but Karpathy *also* has a residual `resid_dropout` after the
     output projection. Two dropouts vs one.

3. Implement `same_function(d_in, num_heads, context_length, batch)`.
   This function:
   - Instantiates a Raschka-style class (`RaschkaMHA`, provided in
     `solution.py`) and a Karpathy-style class (`MinGPTCSA`, also
     provided).
   - Copies the weights from the Raschka instance into the Karpathy
     instance (fusing the three QKV `Linear`s into the one `c_attn`),
     and copies `out_proj.weight` / bias.
   - Sets both modules to `eval()` (disable dropout).
   - Returns `(raschka_out, mingpt_out, max_abs_diff)`.

4. Write your answer to "the three differences" as a short docstring
   on `same_function`. The tests will not grade the prose — but reading
   them back when you forget is the whole point.

### Hints

- `nn.Linear.weight` has shape `(out_features, in_features)`.
- Fusing three Linears `(d_in, d_out)` into one `(d_in, 3 * d_out)`:
  stack the weight matrices along `dim=0`. (Bias too, if any.)
- Copy weights with `torch.no_grad():` and `.copy_(other.data)`, or
  reassign `module.weight.data = ...`.
- Set both modules to `.eval()` before comparing.
- Use `torch.testing.assert_close` (or compare via `.max().item()`).

## Prerequisites

- `multihead-attention-efficient` — you wrote the Raschka version
  yourself.

## References

- Raschka, ch03 main-chapter code, `mha.py`:
  https://github.com/rasbt/LLMs-from-scratch/blob/main/ch03/01_main-chapter-code/mha.py
- minGPT, `CausalSelfAttention` in `model.py`:
  https://github.com/karpathy/minGPT/blob/master/mingpt/model.py
- Raschka chapter 3 §3.6.2 listing 3.5 — same class as `mha.py`.

## Teaching Approach

**Code-reading dominant. Socratic on the *why* of the differences.**
The "writing" part is just the equivalence test — small and
verification-oriented. Spend most of the time on the two source files.

### Socratic prompts

- "Karpathy's `c_attn = nn.Linear(n_embd, 3 * n_embd)` versus
  Raschka's three separate `W_q / W_k / W_v` of size `n_embd`. Same
  parameter count? Same gradient updates? When would you prefer one
  over the other?" (Same params; fused matmul is one CUDA kernel
  launch instead of three — small but real speedup at training time.
  Separate is clearer pedagogically.)
- "Karpathy stores the mask with `tril` (lower-triangular ones); the
  cells to *keep* are 1, so the masking step is `att.masked_fill(mask
  == 0, -inf)`. Raschka stores `triu` (upper-triangular ones); the
  cells to *mask* are 1. Same effect — but if you stare at the two,
  one is a 'mask-out list' and the other is a 'keep list.' Which is
  easier to think about for *causal* attention specifically?"
  (Subjective. The `tril` "keep list" matches the visual of figure
  3.19 where you see what each row attends to; the `triu` "mask list"
  matches the implementation step in figure 3.21.)
- "Karpathy has two dropouts (`attn_dropout` and `resid_dropout`).
  Raschka chapter 3's `CausalAttention` has one. The transformer paper
  has both. What does each one do?" (Attention dropout: regularizes
  the *attention pattern*. Residual dropout: regularizes the
  *contribution* of the whole sublayer when added back into the
  residual stream. Different regularizations of different things.)
- "We turned both modules to `.eval()` before comparing. Why?"
  (Dropout is stochastic during training; turning it off makes the
  output deterministic so we can compare exactly.)

### Common pitfalls

1. **Forgetting `.eval()`** — dropout fires, outputs disagree, you
   blame your weight-copy logic.
2. **Stacking QKV weights in the wrong order** — Karpathy's
   `c_attn(x).split(n_embd, dim=2)` splits in order *(q, k, v)*. If
   you stack as *(k, q, v)* the test fails and the diff looks random.
   Read the `split` line carefully.
3. **Copying `.weight` but not `.bias`** — Raschka's QKV layers have
   `bias=False`. Karpathy's `c_attn` has bias by default. Either turn
   bias off on `c_attn` or set its bias to zero before comparing.
4. **Forgetting Karpathy's `out_proj` / `c_proj` exists** — it does.
   Copy that one too.

## On Completion

### Insight

Two well-known implementations of the same thing, three named
differences, one identical mathematical function. You've now read two
real transformer attention codebases and can show their equivalence
numerically. Every other attention implementation you read for the
rest of your career (HuggingFace, Llama, PyTorch's built-in, Flash
Attention) will be one of these two patterns plus a fourth
optimization — usually a fused mask+softmax or a kernel-level
streaming computation.

### Bridge

Chapter 3 done. Chapter 4 (`gpt-model-from-scratch`) assembles your
`MultiHeadAttention` module into a full GPT block: attention →
LayerNorm → MLP → residual. You'll discover that the *attention is the
hard part*; the rest of the block is comparatively boring.
