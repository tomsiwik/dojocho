"""Reference solution for inference-vs-training-tradeoff."""

from collections import Counter


def inference_scaling(model, prompt, n_samples: int):
    counts = Counter()
    for _ in range(n_samples):
        counts[model(prompt)] += 1
    return counts.most_common(1)[0][0]


def training_loss(model, examples: list[tuple]) -> float:
    total = 0.0
    for prompt, expected in examples:
        out = model(prompt)
        loss = 0.0 if out == expected else 1.0
        total += loss
        # bump p toward 1.0 by lr on correct, else leave it
        if loss == 0.0:
            model.p = min(1.0, model.p + model.lr)
    return total / len(examples)
