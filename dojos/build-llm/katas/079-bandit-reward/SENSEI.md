# SENSEI — bandit-reward

## Briefing

### Goal

Build the simplest possible reinforcement learning environment: a
4-arm Bernoulli bandit. There are 4 actions; each one returns a
0 or 1 reward, with a fixed (but unknown to the agent) probability
of returning 1. This is the "environment" the next five katas will
train policies against.

### Tasks

1. Expose `TRUE_REWARDS = [0.1, 0.4, 0.7, 0.3]` at module scope.
2. Implement `sample_reward(arm: int) -> float` that returns `1.0`
   with probability `TRUE_REWARDS[arm]` and `0.0` otherwise.
3. Use `torch.manual_seed(0)` at the top of the file for reproducible
   tests (the tests rely on a deterministic stream).

### Hints

- `torch.rand(()).item() < p` is one line of Bernoulli sampling.
- Return Python `float`, not a tensor. The test does `==` on `1.0` /
  `0.0`.
- Don't validate the arm index — let it raise naturally.

## Prerequisites

None for the content. You should be comfortable with basic PyTorch
tensors.

## References

- Sutton & Barto, *Reinforcement Learning: An Introduction*, ch. 2
  (multi-armed bandits) — the canonical intro.
- Raschka build-reasoning ch. 6, sec 6.1 — RL framing for LLMs.

## Teaching Approach

### Method: worked example

The kata is mechanical on purpose. The point is to **set up** the
environment so the next five katas can focus on the learning
algorithm, not on inventing toy data.

### Socratic prompts

- "Arm 2 has the highest true reward. If you sampled it forever,
  what would your empirical mean converge to? How many samples
  before you'd be confident it beats arm 1 (`0.4`)?"
- "Why Bernoulli and not Gaussian rewards? What does Bernoulli
  give us that mirrors RLVR rewards in chapter 6?" (Hint: 0/1
  correctness checks.)
- After it works: "If you didn't know `TRUE_REWARDS`, how would
  you find the best arm? Write the algorithm in one English
  sentence. That's REINFORCE." (Bridge to kata 2.)

### Common pitfalls

1. **Returning a tensor instead of a float** — tests will compare
   with `==`. Use `.item()` or compute in Python directly.
2. **Re-seeding inside `sample_reward`** — only seed once at module
   import. Re-seeding per call gives the same reward every call.

## On Completion

### Insight

You built the environment. Notice that the agent has no
observation — it just chooses an arm. This is the simplest possible
"contextless" RL: no state, just actions and rewards. Every
ingredient of GRPO (policy, log-prob, advantage, gradient update)
will work on this toy. If your algorithm can't solve a 4-arm
bandit, it has no business training an LLM.

### Bridge

Next, kata `policy-gradient-reinforce` parameterizes a policy as
softmax over 4 logits and derives the REINFORCE gradient. You'll
see why "multiply log-prob by reward" is the gradient of expected
return.
