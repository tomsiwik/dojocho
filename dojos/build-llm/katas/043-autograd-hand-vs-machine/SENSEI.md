# SENSEI — autograd-hand-vs-machine

## Briefing

### Goal

Compute `d/dx (x² + 3x)` **by hand**, then watch PyTorch's autograd
compute the same number via `.backward()`. The point: autograd is not
magic. It is a tape recorder that watched your forward pass and walked
back through it with the chain rule.

### Tasks

1. Implement `manual_derivative(x)` — return the value of the
   derivative of `f(x) = x² + 3x` at the point `x`. You derive this
   on paper (or in your head):
   `f'(x) = 2x + 3`. Return that, evaluated at `x`.
2. Implement `autograd_derivative(x)` — return the same number, but
   computed by:
   - making a leaf tensor `t = torch.tensor(x, requires_grad=True)`,
   - computing `y = t ** 2 + 3 * t`,
   - calling `y.backward()`,
   - reading `t.grad` and returning it as a Python float.
3. Implement `compare(x)` — return a tuple
   `(manual, autograd, difference)` where `difference` is
   `abs(manual - autograd)`. The test asserts this is essentially zero.

### Hints

- `.backward()` only works on a scalar output. Your `y` is already a
  scalar — no `.sum()` needed.
- `t.grad` is `None` until `.backward()` has run.
- To get a Python float out: `float(tensor)` or `tensor.item()`.

## Prerequisites

- `tensor-basics` (you've made scalar tensors before).
- High-school calculus: the power rule `d/dx x^n = n·x^(n-1)`.

## References

- Raschka appendix A §A.4 — "Automatic differentiation made easy".
- PyTorch autograd tutorial:
  https://pytorch.org/tutorials/beginner/basics/autogradqs_tutorial.html

## Teaching Approach

Hand-computation kata + Socratic. The student must derive `2x + 3`
themselves; the test does not give it away (the function name
`manual_derivative` and the docstring formula in the docstring are the
only hints).

### Socratic prompts

- Before any code: "On paper, what is `d/dx (x² + 3x)`? Use the power
  rule on each term."
- After `manual_derivative` works: "OK, your function returned 7 when
  x=2. Now we'll ask autograd. What do you expect autograd to return?"
- After both match: "Autograd just did exactly what you did on paper.
  So what's actually different about autograd? (Hint: what if your
  expression had 50,000 multiplications and additions?)"
- "When you wrote `y = t ** 2 + 3 * t`, PyTorch built something behind
  the scenes. What's its name? (Answer: the computation graph.) When
  does `.backward()` walk it — left to right or right to left? Why?"
- "What happens if you call `.backward()` twice on the same `y`?
  (Hint: try it. Read the error.)"

### Common pitfalls

1. **Forgetting `requires_grad=True`** — without it, `t.grad` stays
   `None` after `.backward()`.
2. **Calling `.backward()` on a non-scalar** — works in this kata
   (y is scalar), but you will hit it later. The fix is `.sum()`.
3. **Re-running `.backward()`** — the graph is freed after one call
   unless you pass `retain_graph=True`. For this kata, just don't do
   it twice.
4. **Returning a tensor instead of a float** — the test expects a
   number, not a 0-D tensor.

## On Completion

### Insight

Autograd does this: during the forward pass, every op records itself
plus its inputs into a graph. `.backward()` walks that graph from the
output backward, applying the chain rule at each node. For `x² + 3x`,
that's the same `2x + 3` you derived by hand. For a 12-layer
transformer with 12 million parameters, it's the same procedure — just
12 million chained partials.

You will never compute a derivative by hand for a neural net. But you
just confirmed that you *could*, in principle, derive every gradient
PyTorch produces. There is no magic, only bookkeeping.

### Bridge

Next: **nn-module-subclass**. You will implement the same MLP three
ways: `nn.Sequential`, `nn.Module` subclass, and a pure function with
explicit weights. All three rely on the autograd you just demystified.
