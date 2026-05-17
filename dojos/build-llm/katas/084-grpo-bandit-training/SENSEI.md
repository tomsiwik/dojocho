# SENSEI — grpo-bandit-training

## Briefing

### Goal

Wire it all together: train a softmax policy on the 4-arm bandit
using GRPO. After 100-500 SGD steps, the policy should concentrate
probability on **arm 2** (the best one, true reward = 0.7).

This is a tiny, runnable end-to-end RLVR loop. Everything you wrote
in the previous five katas now does its job.

### Tasks

Implement `train_grpo_bandit(steps: int, group_size: int, lr: float)
-> torch.Tensor`:

1. Define `TRUE_REWARDS = [0.1, 0.4, 0.7, 0.3]` and a Bernoulli
   `sample_reward(arm)` helper (or reuse the bandit kata pattern).
2. Initialize `logits = torch.zeros(4, requires_grad=True)`.
3. Use `torch.optim.SGD([logits], lr=lr)`.
4. For each of `steps` SGD steps:
   - Sample `group_size` actions from `softmax(logits)` (e.g. with
     `torch.multinomial`).
   - Get a reward for each via `sample_reward`.
   - Compute group-relative advantages
     (`(r - mean) / (std + 1e-8)`).
   - Compute the GRPO loss as the **mean** of
     `-A_i * log pi(a_i)` across the group. (Single-step
     update means `ratio == 1`, so the clip is inactive; you may
     either keep the clipped form with `logits_old = logits.detach()`
     or just use REINFORCE-with-advantage. The chapter's
     `compute_grpo_loss` does exactly the latter.)
   - `optimizer.zero_grad()`, `loss.backward()`, `optimizer.step()`.
5. Return the **final** `logits.detach()` (1D tensor, shape `(4,)`).

Also call `torch.manual_seed(0)` at the top of the file so tests
are reproducible.

### Hints

- `probs = torch.softmax(logits, dim=-1)` then
  `torch.multinomial(probs, num_samples=group_size, replacement=True)`.
- For sequence/iterate-friendly REINFORCE-with-advantage:
  `loss = -(advantages.detach() * log_pi_actions).mean()`.
- `group_size` of 8-16 works well for a 4-arm bandit.
- `lr` around `0.1` and `steps` around `300` is a reasonable
  starting point.

## Prerequisites

- All five previous katas (bandit-reward, policy-gradient-reinforce,
  advantage-normalization, group-relative-advantage, grpo-loss).

## References

- Raschka build-reasoning ch. 6, sec 6.10-6.11 — the
  `compute_grpo_loss` and `train_rlvr_grpo` functions. You're
  building a tiny version of these.

## Teaching Approach

### Method: worked example + Socratic

The implementation is mechanical (you wrote every piece). The
**discussion** is where the chapter's intuition pays off.

### Socratic prompts (during)

1. "What's the role of `group_size` here? What if you used
   `group_size = 1`?"
   → With 1 rollout per "group", the advantage is always 0 (your
   kata 4 returned zeros). No learning. GRPO needs `>= 2`.

2. "Why does this work with a constant learning rate and no
   value network?" → The per-group baseline gives you the
   variance-reduced REINFORCE estimator. The 4-arm bandit is
   stable enough that you don't need PPO's safety net.

### Socratic prompts (after)

1. "The test asserts that `softmax(logits)[2]` ends up the
   largest. Why arm 2 and not arm 1 (also high reward = 0.4)?"
   → Because 0.7 > 0.4. The Bernoulli noise is large, but
   averaged over many rollouts, arm 2 wins on average. The
   advantage signal pulls logit[2] up most often.

2. "Why doesn't the policy get stuck on arm 1 or arm 3, which
   also occasionally produce reward = 1?"
   → Exploration. Softmax sampling keeps every arm at
   non-zero probability until logits diverge sharply.
   Bernoulli noise also means even arm 0 (p=0.1) gets a
   "lucky" reward sometimes — that briefly boosts its logit,
   but on average arm 2's positive advantage dominates.

3. "How many steps until `softmax(logits)[2] > 0.5`? Try
   100, 300, 1000. What's the trade-off between `steps` and
   `lr`?"
   → Classic SGD trade-off. Higher lr → faster but more
   variance. Lower lr → smoother but slower. With group
   averaging variance is already low.

4. "If you change `TRUE_REWARDS` to `[0.49, 0.5, 0.5, 0.49]`,
   does GRPO still find arm 1 or 2?"
   → Much harder. The signal-to-noise ratio matters. This is
   the bandit analog of "GRPO struggles when all rollouts are
   correct or all are wrong" — small reward differences need
   many samples.

### Common pitfalls

1. **`requires_grad` on logits inside the loop** — define it
   once before the loop; don't recreate it. Otherwise the
   optimizer's parameter reference goes stale.
2. **Not detaching the advantages** — gradient flowing back
   through them is a kata-5 sin. In the bandit case the impact
   is silent (rewards are Python floats and have no graph), but
   the chapter requires `.detach()` and the test will check.
3. **Sampling without replacement** — for `group_size=8` and only
   4 arms, sampling without replacement caps at 4 distinct picks.
   Use `replacement=True`.
4. **Using `argmax` instead of sampling** — kills exploration.
   The policy will entrench on whatever it initialized toward.
5. **Test flakiness** — Bernoulli noise can occasionally
   produce a step where arm 1 or 3 wins. Use `manual_seed(0)`
   and at least 200-300 steps with `group_size >= 8` to be
   robust.

## On Completion

### Insight

You just trained a policy via RLVR on a toy environment. The same
algorithm — sample rollouts, score with a verifier, compute
group-relative advantages, take a clipped policy step — trained
DeepSeek-R1 to do competition mathematics. The differences are:

- Your "policy" is 4 logits; theirs is 671 billion parameters.
- Your "rollout" is one int; theirs is a 2048-token chain of
  thought.
- Your "verifier" is a Bernoulli draw; theirs is a math grader
  on MATH-500 problems.

But the algorithm is identical. Same loss formula. Same
group-relative advantage. Same `.detach()` discipline.

### Bridge

Chapter 7 (`kl-penalized-grpo` and friends in this dojo) adds
the KL divergence regularizer that prevents the policy from
straying too far from a reference. The chef analogy from chapter
6 calls this the "cookbook consultation step". You'll see why
the KL term matters more for LLMs than for bandits.
