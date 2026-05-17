"""Tests for decoding-strategies."""

import torch


def _rng(seed=0):
    g = torch.Generator()
    g.manual_seed(seed)
    return g


def test_greedy_returns_argmax(solution):
    logits = torch.tensor([0.1, 5.0, 2.0, 1.0, -1.0])
    out = solution.greedy(logits)
    assert out.item() == 1


def test_greedy_returns_scalar_long(solution):
    logits = torch.tensor([1.0, 2.0, 3.0])
    out = solution.greedy(logits)
    assert out.dim() == 0
    assert out.dtype == torch.long


def test_temperature_returns_valid_token(solution):
    logits = torch.randn(20)
    out = solution.temperature_sample(logits, temperature=1.0, rng=_rng())
    assert out.dim() == 0
    assert 0 <= out.item() < 20


def test_temperature_zero_equals_greedy(solution):
    """T=0 must be greedy (avoid the divide-by-zero blow-up)."""
    logits = torch.tensor([0.5, 3.0, 2.0, 0.1])
    out = solution.temperature_sample(logits, temperature=0.0, rng=_rng())
    assert out.item() == solution.greedy(logits).item()


def test_temperature_deterministic_with_rng(solution):
    """Same generator seed → same sample."""
    logits = torch.randn(50)
    a = solution.temperature_sample(logits, temperature=1.0, rng=_rng(42))
    b = solution.temperature_sample(logits, temperature=1.0, rng=_rng(42))
    assert a.item() == b.item()


def test_temperature_high_more_diverse(solution):
    """Higher T → flatter distribution → more unique samples observed."""
    torch.manual_seed(0)
    logits = torch.randn(100)
    # Skewed distribution: one very large logit
    logits[0] = 10.0
    low_t = {solution.temperature_sample(logits, 0.1, _rng(i)).item() for i in range(50)}
    high_t = {solution.temperature_sample(logits, 5.0, _rng(i)).item() for i in range(50)}
    assert len(high_t) > len(low_t)


def test_top_k_one_equals_greedy(solution):
    """top_k=1 must equal greedy."""
    logits = torch.tensor([0.5, 3.0, 2.0, 0.1, 4.0])
    out = solution.top_k_sample(logits, k=1, rng=_rng())
    assert out.item() == solution.greedy(logits).item()


def test_top_k_only_samples_from_top_k(solution):
    """Sampling with k=3 should never return a token outside the top-3."""
    logits = torch.tensor([0.0, 10.0, 0.0, 0.0, 5.0, 0.0, 7.0, 0.0])
    # Top 3 = indices [1, 6, 4]
    allowed = {1, 6, 4}
    samples = {solution.top_k_sample(logits, k=3, rng=_rng(i)).item() for i in range(60)}
    assert samples.issubset(allowed), f"sampled outside top-k: {samples - allowed}"


def test_top_p_zero_equals_greedy(solution):
    """top_p=0.0 with shift-right rule must equal greedy."""
    logits = torch.tensor([0.5, 3.0, 2.0, 0.1, 4.0])
    out = solution.top_p_sample(logits, p=0.0, rng=_rng())
    assert out.item() == solution.greedy(logits).item()


def test_top_p_high_includes_all_tokens(solution):
    """With p=0.999 and enough samples, every token should be reachable."""
    logits = torch.zeros(10)  # uniform
    samples = {solution.top_p_sample(logits, p=0.999, rng=_rng(i)).item() for i in range(500)}
    # Allow a couple of tokens to be unsampled by chance.
    assert len(samples) >= 8


def test_top_p_truncates_low_prob_tokens(solution):
    """When one token has overwhelming mass, top_p=0.5 should never sample others."""
    logits = torch.full((20,), -100.0)
    logits[7] = 100.0  # essentially p=1 on token 7
    samples = {solution.top_p_sample(logits, p=0.5, rng=_rng(i)).item() for i in range(30)}
    assert samples == {7}


def test_all_return_scalar_long_tensor(solution):
    logits = torch.randn(15)
    rng = _rng()
    for fn_name, fn_args in [
        ("greedy", (logits,)),
        ("temperature_sample", (logits, 1.0, rng)),
        ("top_k_sample", (logits, 5, rng)),
        ("top_p_sample", (logits, 0.9, rng)),
    ]:
        fn = getattr(solution, fn_name)
        out = fn(*fn_args)
        assert isinstance(out, torch.Tensor), fn_name
        assert out.dim() == 0, f"{fn_name} returned shape {out.shape}"
        assert out.dtype == torch.long, f"{fn_name} dtype {out.dtype}"
