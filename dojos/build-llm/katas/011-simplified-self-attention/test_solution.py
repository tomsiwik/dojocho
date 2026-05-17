"""Tests for Simplified Self-Attention."""

import torch


def _toy_input() -> torch.Tensor:
    torch.manual_seed(0)
    return torch.randn(4, 8)  # T=4, d=8


def test_scores_shape(solution):
    x = _toy_input()
    s = solution.attention_scores(x)
    assert s.shape == (4, 4)


def test_scores_are_dot_products(solution):
    x = _toy_input()
    s = solution.attention_scores(x)
    expected = x @ x.T
    torch.testing.assert_close(s, expected)


def test_scores_diagonal_is_self_dot(solution):
    """Diagonal must equal sum of squares of each row."""
    x = _toy_input()
    s = solution.attention_scores(x)
    diag = torch.tensor([(row * row).sum() for row in x])
    torch.testing.assert_close(s.diagonal(), diag)


def test_weights_rows_sum_to_one(solution):
    x = _toy_input()
    w = solution.attention_weights(solution.attention_scores(x))
    torch.testing.assert_close(w.sum(dim=-1), torch.ones(4))


def test_weights_are_nonnegative(solution):
    x = _toy_input()
    w = solution.attention_weights(solution.attention_scores(x))
    assert (w >= 0).all()


def test_weights_softmax_along_last_dim(solution):
    """If student softmaxes columns by mistake, this fails."""
    x = _toy_input()
    s = solution.attention_scores(x)
    w = solution.attention_weights(s)
    expected = torch.softmax(s, dim=-1)
    torch.testing.assert_close(w, expected)


def test_context_shape(solution):
    x = _toy_input()
    z = solution.simplified_self_attention(x)
    assert z.shape == x.shape


def test_context_matches_reference(solution):
    x = _toy_input()
    z = solution.simplified_self_attention(x)
    expected = torch.softmax(x @ x.T, dim=-1) @ x
    torch.testing.assert_close(z, expected)


def test_identical_rows_get_equal_attention(solution):
    """If two input rows are identical, they should attend to each other
    symmetrically (their score-pair is equal to either self-score)."""
    x = torch.randn(4, 8)
    x[3] = x[0].clone()  # row 0 == row 3
    s = solution.attention_scores(x)
    # Score(0, 3) must equal Score(0, 0) since x[3] == x[0].
    torch.testing.assert_close(s[0, 3], s[0, 0])
