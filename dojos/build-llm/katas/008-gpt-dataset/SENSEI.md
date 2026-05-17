# SENSEI — gpt-dataset

## Briefing

### Goal

Implement `GPTDatasetV1` and `create_dataloader_v1` from Raschka
listings 2.5 and 2.6 — a PyTorch `Dataset` over token ids with a
sliding-window indexing scheme, wrapped in a `DataLoader`.

You've already built the sliding-window logic in pure Python (kata
`004-training-pairs-from-text`). This kata is about (a) the
`Dataset`/`__getitem__` protocol, and (b) the operational implications
of `drop_last`, `stride`, `shuffle`.

### Tasks

1. `GPTDatasetV1.__init__(txt, tokenizer, max_length, stride)` —
   tokenize once, then pre-compute every (input, target) pair and
   store as a list of `torch.tensor`.
2. `__len__` and `__getitem__` — trivial once the lists exist.
3. `create_dataloader_v1(...)` — instantiate the dataset and wrap in a
   `DataLoader`.

### Hints

- `range(0, len(token_ids) - max_length, stride)` — note the upper
  bound. The classic off-by-one.
- `tokenizer.encode(txt)` — any tokenizer that quacks (the test uses a
  toy `IdentityTokenizer`, in real use you'd pass the tiktoken encoder
  from the previous kata).
- `torch.tensor(list_of_ints)` — defaults to int64, which is what
  `nn.Embedding` wants downstream.

## Prerequisites

- `bpe-via-tiktoken` — you've used the encode method that this dataset
  will call.
- `004-training-pairs-from-text` — you've built the same sliding-window
  logic in pure Python. This kata adds the PyTorch `Dataset` wrapper.

## References

- Raschka chapter 2 §2.6 — "Data sampling with a sliding window".
- Listings 2.5 and 2.6.
- PyTorch Dataset docs:
  https://pytorch.org/docs/stable/data.html#torch.utils.data.Dataset

## Teaching Approach

**Method: Parsons-style (partial structure given in the solution stub)
+ Socratic on the operational gotchas (`drop_last`, `stride`).**

### Socratic prompts

- "Why is `__init__` doing all the slicing, instead of `__getitem__`
  computing chunks lazily on demand? When would the lazy version be
  the right call?"
  (Answer: with very large corpora that don't fit in RAM as tensors.)
- "Why `drop_last=True` during training? What breaks if you leave the
  partial last batch in?"
  (Answer: variable batch size → noisy loss spikes; BatchNorm-style
  layers actually behave differently with different N.)
- "Why does `stride < max_length` cause the model to see some token
  positions multiple times? Is that a bug or a feature?"
  (Feature: more training pairs from a fixed corpus, at the cost of
  correlated samples.)
- "If you set `shuffle=True` during training, why is that ok despite
  the sliding window producing strongly correlated samples?"
  (Shuffling decorrelates within an epoch; without it, gradients
  would be biased by sample order.)

### Common pitfalls

1. **Off-by-one on the range.** `range(0, len(ids) - max_length + 1)`
   is WRONG — the last iteration's target_chunk would index past the
   end. Must be `range(0, len(ids) - max_length, stride)`.
2. **Forgetting to convert to `torch.tensor`.** `__getitem__`
   returning a list of ints means DataLoader can't stack into a
   batched tensor. Wrap in `torch.tensor(...)` in `__init__`.
3. **Calling tokenizer.encode per `__getitem__` call.** Tokenize ONCE
   in `__init__` and slice in `__getitem__`. Otherwise you re-tokenize
   the whole corpus for every sample.
4. **Returning a tuple of lists from `__getitem__`.** Must be tensors
   for DataLoader to batch them.

## On Completion

### Insight

You now have a working text → batches-of-tensors pipeline. Plug the
tiktoken encoder in, point it at a text file, and you can stream
(B, T) integer tensors into a model forever.

Note what's NOT here yet: the tokens are still just ids
(`torch.int64`). A neural network needs `torch.float32` vectors. The
next two katas (`embeddings-and-lookup`, `positional-embeddings`)
build that bridge.

### Bridge

Next: `embeddings-and-lookup`. You'll discover that `nn.Embedding`,
the layer that converts ids to vectors, is *literally* a row-lookup
into a learned weight matrix — equivalent to one-hot @ W but
massively cheaper.
