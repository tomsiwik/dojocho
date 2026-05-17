"""Inference vs Training Tradeoff — build-reasoning ch1.

Two ways to make a model better:
  - `inference_scaling`: sample it N times, majority vote. Does NOT
    touch the model weights. (Stand-in for chapter 4 CoT/voting.)
  - `training_loss`: compute a loss on a batch of labeled examples and
    bump the model's internal parameters toward correct. (Stand-in for
    chapter 6 RL.)

Both raise accuracy. They cost differently. Feel the tradeoff in code.

The model is a callable with attributes `p` (correct-answer probability)
and `lr` (learning rate). The tests provide one; you don't need to
build it.
"""


def inference_scaling(model, prompt, n_samples: int):
    """Call `model(prompt)` `n_samples` times. Return the most-common
    output. Do NOT mutate the model.
    """
    ...  # implement me


def training_loss(model, examples: list[tuple]) -> float:
    """Compute mean 0/1 loss over `examples` (a list of
    `(prompt, expected_answer)` pairs).

    Side effect: for each example the model gets right, bump `model.p`
    toward 1.0 by `model.lr`. This is your fake gradient step.

    Returns the mean loss as a float in [0, 1].
    """
    ...  # implement me
