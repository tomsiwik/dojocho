"""Tests for llm-judge-mock."""

import pytest


Q = "What is the capital of France?"
REF = "The capital of France is Paris."


def test_exact_match_scores_5(solution):
    assert solution.judge(Q, REF, REF) == 5


def test_paraphrase_high_overlap_scores_high(solution):
    """Near-identical content with one extra word — should be 4 or 5."""
    resp = "The capital of France is Paris, indeed."
    score = solution.judge(Q, resp, REF)
    assert score >= 4


def test_partial_overlap_scores_mid(solution):
    """Some shared tokens, some not — should land in the middle (2 or 3)."""
    resp = "Paris is a city in Europe."
    score = solution.judge(Q, resp, REF)
    assert 2 <= score <= 3


def test_completely_wrong_scores_low(solution):
    """No token overlap with reference — score 1 (no overlap at all)."""
    resp = "Bananas grow on trees."
    score = solution.judge(Q, resp, REF)
    assert score == 1


def test_punt_scores_1(solution):
    """Common refusal phrases score 1 regardless of overlap."""
    for resp in [
        "I don't know.",
        "I cannot answer that.",
        "I can't help with that.",
        "As an AI, I cannot speculate.",
        "I'm unable to answer.",
        "I am unable to provide an answer.",
    ]:
        assert solution.judge(Q, resp, REF) == 1, f"failed on {resp!r}"


def test_punt_is_case_insensitive(solution):
    assert solution.judge(Q, "I DON'T KNOW", REF) == 1
    assert solution.judge(Q, "As An AI assistant...", REF) == 1


def test_empty_response_scores_1(solution):
    assert solution.judge(Q, "", REF) == 1
    assert solution.judge(Q, "   \n  ", REF) == 1


def test_returns_int_in_range(solution):
    for resp in ["", REF, "Paris.", "Banana plant", "I don't know"]:
        score = solution.judge(Q, resp, REF)
        assert isinstance(score, int)
        assert 1 <= score <= 5


def test_question_argument_not_required_for_scoring(solution):
    """The mock ignores `question`; same response+reference should give the
    same score regardless of question text."""
    s1 = solution.judge("Q1?", REF, REF)
    s2 = solution.judge("totally different question?", REF, REF)
    assert s1 == s2
