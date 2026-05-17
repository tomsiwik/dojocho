"""Tests for continuous-batching-sim."""


def test_single_request_completes(solution):
    """One request, 3 tokens, plenty of budget and steps."""
    # Arrives at step 0, needs 3 tokens. Completes at step 2.
    # Latency = 2 - 0 + 1 = 3.
    result = solution.simulate(
        arrivals=[(0, 3)], budget=4, n_steps=10
    )
    assert result["total_completed"] == 1
    assert result["mean_latency"] == 3.0
    assert result["max_active"] == 1


def test_two_concurrent_requests(solution):
    """Two requests arrive together; both fit in budget."""
    # Both arrive at step 0, need 2 tokens each. Both complete at
    # step 1. Latency each = 1 - 0 + 1 = 2.
    result = solution.simulate(
        arrivals=[(0, 2), (0, 2)], budget=4, n_steps=5
    )
    assert result["total_completed"] == 2
    assert result["mean_latency"] == 2.0
    assert result["max_active"] == 2


def test_budget_caps_active_set(solution):
    """Budget=1: requests serialize."""
    # Three 2-token requests, budget=1.
    # Step 0: admit req0. Process. req0 has 1/2.
    # Step 1: budget full (1 active). Process. req0 done (lat=2).
    # Step 2: admit req1. Process. req1 has 1/2.
    # Step 3: process. req1 done (lat=3-0+1=4).
    # Step 4: admit req2. Process. req2 has 1/2.
    # Step 5: process. req2 done (lat=5-0+1=6).
    result = solution.simulate(
        arrivals=[(0, 2), (0, 2), (0, 2)], budget=1, n_steps=10
    )
    assert result["total_completed"] == 3
    assert result["max_active"] == 1
    # Latencies: 2, 4, 6 -> mean = 4.0.
    assert result["mean_latency"] == 4.0


def test_staggered_arrivals(solution):
    """Requests arrive at different times."""
    # req0 arrives step 0, 2 tokens. req1 arrives step 5, 2 tokens.
    # req0: completes step 1, latency 2.
    # req1: arrives step 5, admitted step 5, completes step 6, lat 2.
    result = solution.simulate(
        arrivals=[(0, 2), (5, 2)], budget=4, n_steps=10
    )
    assert result["total_completed"] == 2
    assert result["mean_latency"] == 2.0
    assert result["max_active"] == 1  # never overlapped


def test_request_not_yet_arrived(solution):
    """A request that arrives after n_steps is not admitted."""
    result = solution.simulate(
        arrivals=[(0, 2), (100, 2)], budget=4, n_steps=10
    )
    assert result["total_completed"] == 1


def test_no_completions_zero_latency(solution):
    """Insufficient steps -> no completions, mean_latency = 0.0."""
    result = solution.simulate(
        arrivals=[(0, 100)], budget=4, n_steps=5
    )
    assert result["total_completed"] == 0
    assert result["mean_latency"] == 0.0


def test_returns_dict_with_expected_keys(solution):
    result = solution.simulate(arrivals=[(0, 1)], budget=1, n_steps=2)
    assert isinstance(result, dict)
    assert set(result.keys()) == {"total_completed", "mean_latency", "max_active"}


def test_continuous_admission(solution):
    """The hallmark: when a request finishes, a waiting one is
    admitted the next step, not at the end of a batch."""
    # budget=2. req0(0, 1tok), req1(0, 1tok), req2(0, 5tok),
    # req3(0, 1tok).
    # Step 0: admit req0, req1 (budget full at 2). Process. Both done.
    # Step 1: admit req2, req3. Process. req3 done (lat=1-0+1=2),
    #         req2 has 1/5.
    # ... req2 continues to completion at step 5.
    result = solution.simulate(
        arrivals=[(0, 1), (0, 1), (0, 5), (0, 1)],
        budget=2, n_steps=20
    )
    assert result["total_completed"] == 4
    # The point: req3 latency is 2, NOT 6. Continuous batching admits
    # it the moment a slot frees, not after the whole batch finishes.
    # Latencies: 1, 1, 6, 2 -> mean = 2.5.
    assert result["mean_latency"] == 2.5
    assert result["max_active"] == 2
