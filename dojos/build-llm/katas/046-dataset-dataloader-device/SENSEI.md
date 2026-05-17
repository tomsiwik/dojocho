# SENSEI — dataset-dataloader-device

## Briefing

### Goal

Wrap a tiny in-memory dataset in PyTorch's `Dataset` / `DataLoader`
abstraction and add a defensive `get_device()` that picks the best
available accelerator without crashing on machines that lack one.

You will discover the seam: `Dataset` describes **how to load one
example**; `DataLoader` describes **how to batch, shuffle, and queue
them**. They are deliberately separate concerns.

### Tasks

1. Implement `ToyDataset(torch.utils.data.Dataset)`:
   - `__init__(self, X, y)` — store the inputs and labels.
   - `__len__(self)` — return the number of examples.
   - `__getitem__(self, idx)` — return ONE `(x, y)` pair as
     `(torch.Tensor, torch.Tensor)`.
2. Implement `make_dataloader(dataset, batch_size=2)` —
   return a `DataLoader` with `batch_size=batch_size`, `shuffle=False`.
3. Implement `get_device()` — return a `torch.device` chosen in this
   priority order:
   - `"mps"` if `torch.backends.mps.is_available()` AND
     `torch.backends.mps.is_built()`,
   - else `"cuda"` if `torch.cuda.is_available()`,
   - else `"cpu"`.

### Hints

- `torch.utils.data.Dataset` is an abstract base — subclass it and
  implement `__len__` and `__getitem__`. Don't forget `super().__init__()`.
- `__getitem__` returns ONE example. DataLoader handles batching by
  calling `__getitem__` once per index in the batch and stacking.
- `torch.device("cpu")` is always safe. The other two need feature
  checks.
- The test runs on CI without CUDA/MPS — your `get_device()` must
  never raise.

## Prerequisites

- `tensor-basics`.
- (Helpful) `train-xor-mlp` — you have seen a hand-built batch; this
  formalizes it.

## References

- Raschka appendix A §A.6 — "Setting up efficient data loaders".
- `torch.utils.data.Dataset`:
  https://pytorch.org/docs/stable/data.html#torch.utils.data.Dataset
- `torch.utils.data.DataLoader`:
  https://pytorch.org/docs/stable/data.html#torch.utils.data.DataLoader

## Teaching Approach

Kata for the mechanics + Socratic on the seam.

### Socratic prompts

- "Why does `Dataset.__getitem__` always load ONE example? Why not a
  batch?" (Answer: separation of concerns. The DataLoader is the
  *batching layer*; Dataset is the *I/O layer*. This lets you swap
  one without touching the other — e.g., put your Dataset behind a
  worker pool with `num_workers>0`, or replace DataLoader with a
  custom sampler.)
- "If `__getitem__` returned a batch directly, what couldn't you do
  any more?" (Answer: you couldn't shuffle, couldn't change batch
  size at runtime, couldn't use multiple workers cleanly, couldn't
  combine datasets with `ConcatDataset`.)
- "What does `get_device()` need to handle that a one-liner like
  `torch.device('cuda')` does not?" (Answer: every laptop, every CI
  runner, every Apple Silicon box. Production code never assumes a
  device.)
- "On Apple Silicon, why is MPS preferred over CPU even though both
  work? What about for tiny tensors?" (Answer: throughput. For tiny
  tensors the kernel-launch overhead can make CPU faster — but
  defaults should prefer accelerators.)

### Common pitfalls

1. **Returning a list instead of a tensor pair** — DataLoader stacks
   tensors automatically; if you return Python lists you'll get
   surprising types after collation.
2. **Forgetting `__len__`** — DataLoader needs it to know when to
   stop. Iteration will be broken or infinite without it.
3. **Hard-coding `cuda`** — `torch.device("cuda")` does not raise on
   construction; it raises later when you try to move a tensor.
   Always check `is_available()` first.
4. **MPS check is brittle on older PyTorch** — guard with both
   `is_available()` AND `is_built()`. Some builds report one but
   not the other.

## On Completion

### Insight

`Dataset` is the I/O layer. `DataLoader` is the batching layer. The
seam between them is the reason a 100-line training loop scales to
ImageNet without rewriting your data code.

`get_device()` looks trivial, but it is the line that lets the same
script run unchanged on your laptop (mps), your workstation (cuda),
and your CI server (cpu). Every serious PyTorch codebase has some
flavor of this helper.

### Bridge

Appendix A complete. You have tensors, broadcasting, autograd,
modules, a training loop, and the data pipeline. The next chapter
(Working with text data) reuses all six of these to turn raw text into
training batches for your first real language model.
