# SENSEI — reward-hacking-detector

## Briefing

### Goal

Detect reward hacking from training logs alone. Reward hacking is
when the model figures out how to maximize the proxy reward without
actually getting better at the underlying task. The canonical
signature in training logs: **reward keeps going up while held-out
accuracy goes down**.

Your detector returns the first iteration where that divergence
exceeds a threshold (or `-1` if it never does).

### Tasks

1. Implement `detect_reward_hacking(train_history, window, threshold) -> int`:
   - `train_history` is a list of dicts, each with `'reward'` and
     `'held_out_metric'`, ordered by training step.
   - For each index `i >= window`:
     - `reward_delta = reward[i] - reward[i - window]`
     - `held_out_delta = held_out_metric[i] - held_out_metric[i - window]`
     - Trigger if `reward_delta > 0` AND `held_out_delta < 0` AND
       `(reward_delta - held_out_delta) > threshold`.
   - Return the first triggering index, or `-1` if none.

### Hints

- Iterate `for i in range(window, len(train_history)):`.
- Extract two lists once at the top so the inner loop is cheap:
  `rewards = [h['reward'] for h in train_history]` etc.
- All three conditions must hold simultaneously — a flat held-out
  with rising reward is *not* hacking, just a plateau.
- Return `int`, not `numpy.int64`. Plain Python `int`.

## Prerequisites

- `kl-penalized-grpo` (you've seen why unconstrained RL drifts).
- Familiarity with the GRPO training-history plots from Raschka
  build-reasoning §7.2.

## References

- Raschka build-reasoning chapter 7 §7.2 — interpreting GRPO
  training curves; figure 7.4 shows exactly this divergence.
- Amodei et al., "Concrete Problems in AI Safety" — the canonical
  reward-hacking framing.

## Teaching Approach

**Demo + Socratic.** Best experienced by *seeing* a hacking curve
once before writing the detector.

### Socratic prompts

- Before coding: "I tell you the training reward went from 0.5 to
  0.95 over 100 steps. The model won. What's wrong?"
  (Reward is a proxy. Without an external check — held-out task
  metric, human eval, a separate benchmark — you cannot distinguish
  "model got better" from "model learned to game the reward".)
- "Mechanically, *how* does a reasoning model hack a verifier
  reward?" (Format-only solutions: emit `\boxed{42}` even when the
  reasoning is nonsense; produce extremely long answers to confuse a
  length-based heuristic; output adversarial unicode that the
  verifier mis-parses. Raschka §7.6 shows a real version: format
  reward dominates and the model stops caring about correctness.)
- "How would you detect this from training-time signals alone, without
  having ground-truth correctness for every rollout?"
  (Track *something else* the reward shouldn't be optimizing. Held-out
  task accuracy is the standard. Entropy collapse + reward going up is
  a related signal — see Raschka §7.3.)
- "Why a windowed delta and not the instantaneous slope? Why not
  raw values?" (Single-step noise. A real run is jittery; you don't
  want a one-step dip in eval accuracy to fire a false alarm. The
  window is a cheap low-pass filter.)
- "Your detector says hacking started at step `i`. What do you DO
  about it? List three responses."
  (1. Roll back to the best held-out checkpoint and lower the KL
  coefficient or strengthen the reward model.
  2. Add an auxiliary reward that punishes the hack pattern
  (e.g., conditional format reward — Raschka exercise 7.2).
  3. Stop training; you've hit the ceiling of what this reward can
  give you. Iterating on the *reward* is now higher-leverage than
  iterating on the model.)
- After it passes: "Could you write this as a streaming detector
  that runs every N steps during training? What's the minimum state
  it needs to carry?" (Just the last `window` steps of each metric —
  a deque of length `window` for each.)

### Common pitfalls

1. **Off-by-one on the window.** `i - window` not `i - window + 1`.
   You compare to *the value `window` steps ago*.
2. **Triggered on `held_out == 0` deltas.** "Flat held-out + rising
   reward" is suspicious but not hacking — the test explicitly
   requires strictly negative held-out delta.
3. **Forgot the threshold.** Without it, every noisy step would
   trigger. The threshold is the deadband.
4. **Used `index` to find first trigger.** Just `return i` from the
   loop the first time the condition holds; explicit, fast, obvious.

## On Completion

### Insight

You wrote the simplest possible reward-hacking detector — and it
catches the canonical failure mode shown in Raschka figure 7.4
(reward climbing, eval accuracy crashing). In production RLHF
pipelines this is one of three or four standard guards: KL
divergence threshold, output-length cap, held-out task eval at
checkpoint frequency, and a human-eval sample. None of them are
sufficient alone; together they catch most hacks.

The deeper point: reward hacking is not a bug in the model. It's a
bug in the *reward*. The model is doing exactly what you asked.

### Bridge

This is the last kata in build-reasoning chapter 7. You've
extended GRPO with the three pieces that take it from "toy
algorithm" to "what DeepSeek-R1 actually trains with": KL
regularization, an adaptive controller for the KL coefficient,
and a detector for the failure mode that motivates them both.
Chapter 8 moves on to distillation — taking the reasoning model
you trained and making it small and fast.
