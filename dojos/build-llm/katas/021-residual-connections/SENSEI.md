# SENSEI — residual-connections

## Briefing

### Goal

**See** the vanishing gradient problem with your own eyes. Build a
12-layer MLP, run a forward + backward pass, and print the gradient
norm at each layer. Then add residual connections to the same
architecture and re-run. The numbers will be unmistakable.

Residual ("skip") connections are how transformers can be stacked 12,
24, 96, or 175 layers deep without gradients dying on the way back.

### Tasks

1. Implement `DeepMLP(layer_sizes, use_shortcut)` as an `nn.Module`:
   - One Linear + GELU per layer (use `torch.nn.GELU(approximate='tanh')`).
   - When `use_shortcut=True`, add the layer input to its output
     **only if the shapes match**.
2. Implement `gradient_norms(model, x, target)`:
   - Forward pass, MSE loss against `target`, backward.
   - Return a list of `param.grad.abs().mean().item()` for every
     `weight` parameter, in layer order.

### Hints

- Use `nn.ModuleList`, not a Python list, or PyTorch won't see the
  submodules. Iterate with `for layer in self.layers:`.
- Residual: `if self.use_shortcut and x.shape == layer_out.shape:
  x = x + layer_out` else `x = layer_out`.
- `model.named_parameters()` yields `(name, param)`; filter to those
  whose name contains `"weight"` (skip biases).
- `param.grad.abs().mean().item()` is the per-layer scalar you report.

## Prerequisites

- `feed-forward` (you have GELU and Linear sandwiched).
- Comfort with `.backward()` and `.grad`.

## References

- Raschka chapter 4 §4.4, Listing 4.5.
- He et al. (2016), "Deep Residual Learning for Image Recognition" —
  https://arxiv.org/abs/1512.03385

## Teaching Approach

Demonstration-first (run the test, *see* the numbers explode/collapse),
then Socratic.

### Socratic prompts

- "Without residuals, the early-layer gradients are roughly how many
  orders of magnitude smaller than the late-layer gradients in your
  test output? With residuals, what changes?"
- "Residuals don't change the function the network can represent.
  (Proof sketch: the no-shortcut net can learn `f(x) = g(x) - x` and
  produce the same output as `x + g(x)` from the shortcut net.) So if
  representational capacity is identical, what do residuals change?"
  (The **optimization landscape**. The shortcut path lets gradients
  flow back as identity; the model can be a stack of `x + small
  perturbation` early in training, and the loss surface is much
  smoother around that point.)
- "Why does the chapter use MSE against zero as the loss? That's a
  silly objective. Why is it fine for *this* demonstration?"
  (Any loss works for showing gradient magnitudes. The demo is about
  the backward pass, not learning a useful function.)
- "What if you scaled residuals — `x + α · layer(x)` for small α — at
  init? Does that ring any bells?"
  (Yes: it's literally what ReZero, LayerScale, DeepNorm do. All
  variants of "make the residual path even more dominant early in
  training".)

### Common pitfalls

1. **Python list instead of `nn.ModuleList`** — `self.layers =
   [Linear(...) for _ in ...]` makes the layers invisible to
   `.parameters()` and `.to(device)`. Tests will catch it via the
   gradient-list length.
2. **Adding shortcut when shapes don't match** — the last layer in
   Raschka's example goes 3→1, so the shortcut must be skipped there.
   Guard with `if x.shape == layer_out.shape`.
3. **Reporting `.grad.mean()` instead of `.grad.abs().mean()`** —
   gradients can be negative; the mean cancels and looks like
   "vanishing" even when it isn't.
4. **Not zeroing gradients between runs** — if you call the function
   twice on the same model, gradients accumulate. Fresh model per call,
   or call `model.zero_grad()`.

## On Completion

### Insight

This is one of the few moments in deep learning where the failure mode
is *visible*. Print the no-shortcut gradients: they shrink by ~4 orders
of magnitude from layer 4 back to layer 0. The earliest layers are
effectively untrained. Add the shortcut, re-run: the gradients are all
within ~1 order of magnitude of each other.

This is why transformers can be 96 layers deep. Without residuals, the
first 80 layers would never see a meaningful gradient. With them, the
network learns a *small correction* at each layer on top of the
identity — and the loss surface is gentle enough that SGD can navigate
it.

### Bridge

Next: `transformer-block`. You'll wrap your LayerNorm, FFN, and a
causal multi-head attention with **two** residual connections — one
around attention, one around FFN. The structure you just proved is
necessary becomes the structure you build.
