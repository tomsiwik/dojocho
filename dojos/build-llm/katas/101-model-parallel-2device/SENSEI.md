# SENSEI — model-parallel-2device

## Briefing

### Goal

When a quantized model still doesn't fit on one GPU, you split the
*layers* across devices. This is called **model parallelism** (or
"pipeline parallelism" when batched). Hugging Face Accelerate's
`dispatch_model` does this automatically.

You will simulate the simplest possible case: a 2-layer MLP with one
layer per "device". Devices are just string labels; "transfer" is a
mock callback you must invoke exactly once on the intermediate
activation.

### Background

Conceptually:

```
x  on device 1
  → layer1 (on device 1)
  → activation (on device 1)
  → TRANSFER to device 2  ← the cost model-parallelism adds
  → layer2 (on device 2)
  → output (on device 2)
```

The transfer is the cost of model parallelism that quantization can't
fix. You'll see it once in your code.

### Tasks

1. Implement `forward_split(x, layer1, layer2, transfer_callback) -> y`:
   - `x` is a 1-D float tensor on "device 1".
   - `layer1` and `layer2` are `torch.nn.Linear` modules.
   - Between `layer1` and `layer2`, apply a ReLU.
   - Call `transfer_callback(activation)` exactly once with the
     post-activation tensor that moves from device 1 to device 2.
   - Return `layer2(activation)`.

### Hints

- `nn.Linear(in_features, out_features)` is callable: `y = layer(x)`.
- `torch.relu` is the activation between the two layers.
- The callback's role is just to mark the cross-device boundary; the
  tensor it receives is what would actually be transferred.
- Tests use `unittest.mock.MagicMock` or a closure-based counter to
  verify the callback was invoked exactly once.

## Prerequisites

- `tensor-basics`, `nn-module-subclass`, `feed-forward` — you'll use a
  2-layer MLP shape.

## References

- HF Accelerate `dispatch_model`:
  <https://github.com/huggingface/accelerate/blob/main/src/accelerate/big_modeling.py>
- HF Accelerate `infer_auto_device_map` — automated layer→device
  mapping.
- Raschka LLMs-from-scratch ch05/08 — memory-efficient weight loading.
- Appendix D §D.1 — memory budgets that motivate splitting.

## Teaching Approach

**Code-reading + Socratic.** The code is short (3 lines of forward
logic). The lesson is in the *conversation* about what would actually
happen on real hardware.

### Socratic prompts

- "Your model has 70B params and you have 4×24GB GPUs (96 GB total).
  In fp16 that's 140 GB — won't fit. In int8 it's 70 GB — fits across
  the four. Walk me through what gets put where. Which layers go on
  which device?"
- "The transfer between devices is the *only* cost model parallelism
  adds beyond memory savings. Why is it cheap for a single forward
  pass and expensive for training? (Hint: backward.)"
- "Pipeline parallelism extends this: split layers across devices AND
  pipeline batches through. What does that buy you over plain model
  parallelism?"
- "Why does `transfer_callback` get called *exactly* once in your
  2-layer split? When would it be called more times?"
- "What if `layer2` had to access weights from `layer1`'s device
  mid-computation (e.g. weight sharing)? How would you handle that?"

### Common pitfalls

1. **Forgetting the activation** — without ReLU, this is just one
   big linear map. The activation is what the transfer carries.
2. **Calling the callback zero or twice** — the test asserts exactly
   one call. Once after layer1+ReLU, never around layer2.
3. **Passing the wrong tensor to the callback** — it's the
   *post-activation* output of layer1, not the raw `x` or the final
   `y`.

## On Completion

### Insight

You just wrote the conceptual core of `dispatch_model`. Real Accelerate
attaches forward-hooks to each module that automatically `.to()` the
input to the module's device. Your `transfer_callback` is the
abstraction over `tensor.to(device_2)`.

The whole appendix D toolkit now in your hands:

- **Memory math** (kata 1) — predict what fits.
- **Quantization** (katas 2–3) — shrink the weights.
- **Model parallelism** (this kata) — split what's still too big.

In real serving stacks, all three are combined: an int4-quantized 70B
model dispatched across 4 GPUs with bitsandbytes weights and Accelerate
device map. You've built the mental model for every layer.

### Bridge

End of appendix D. Next appendix (E): **batching and throughput-oriented
execution** — how to actually get good tokens/sec out of a serving
setup.
