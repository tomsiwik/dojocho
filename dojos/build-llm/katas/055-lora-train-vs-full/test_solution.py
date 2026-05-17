"""Tests for lora-train-vs-full."""


def test_full_returns_dict(solution):
    out = solution.train_full(steps=50, lr=0.05, seed=0)
    assert "final_loss" in out and "trainable_params" in out
    assert isinstance(out["final_loss"], float)
    assert isinstance(out["trainable_params"], int)


def test_lora_returns_dict(solution):
    out = solution.train_lora(steps=50, lr=0.05, seed=0)
    assert "final_loss" in out and "trainable_params" in out
    assert isinstance(out["final_loss"], float)
    assert isinstance(out["trainable_params"], int)


def test_lora_has_fewer_trainable_params(solution):
    """LoRA must reduce the trainable param count substantially."""
    full = solution.train_full(steps=10, lr=0.05, seed=0)
    lora = solution.train_lora(steps=10, lr=0.05, seed=0)
    assert lora["trainable_params"] < full["trainable_params"]
    # Should be a meaningful reduction (>2x) even on a tiny model.
    assert full["trainable_params"] / lora["trainable_params"] > 2


def test_full_converges(solution):
    """Full FT should drive loss low on y = 3x + 2."""
    out = solution.train_full(steps=400, lr=0.05, seed=0)
    assert out["final_loss"] < 0.01, f"full final_loss={out['final_loss']}"


def test_lora_converges(solution):
    """LoRA should also reach low loss on this simple task."""
    out = solution.train_lora(steps=400, lr=0.05, seed=0)
    assert out["final_loss"] < 0.01, f"lora final_loss={out['final_loss']}"
