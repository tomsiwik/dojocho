"""Tests for Prompt Template Strategies."""

import pytest

INSTR = "Name a color."
RESP = "Blue."


# --- Per-template exact-shape tests ---

def test_alpaca_exact(solution):
    out = solution.format_alpaca(INSTR, RESP)
    expected = (
        "Below is an instruction that describes a task. "
        "Write a response that appropriately completes the request.\n\n"
        f"### Instruction:\n{INSTR}\n\n"
        f"### Response:\n{RESP}"
    )
    assert out == expected


def test_chatml_exact(solution):
    out = solution.format_chatml(INSTR, RESP)
    expected = (
        f"<|im_start|>user\n{INSTR}<|im_end|>\n"
        f"<|im_start|>assistant\n{RESP}<|im_end|>"
    )
    assert out == expected


def test_llama2_exact(solution):
    out = solution.format_llama2(INSTR, RESP)
    expected = f"<s>[INST] {INSTR} [/INST] {RESP} </s>"
    assert out == expected


def test_phi3_exact(solution):
    out = solution.format_phi3(INSTR, RESP)
    expected = (
        f"<|user|>\n{INSTR}<|end|>\n"
        f"<|assistant|>\n{RESP}<|end|>"
    )
    assert out == expected


# --- Property test: response is locatable by a known marker ---
# This is the heart of the kata: each template exposes a unique
# "where does the response start" marker. Find it.

TEMPLATE_MARKERS = [
    ("format_alpaca", "### Response:\n"),
    ("format_chatml", "<|im_start|>assistant\n"),
    ("format_llama2", "[/INST] "),
    ("format_phi3", "<|assistant|>\n"),
]


@pytest.mark.parametrize("fn_name,marker", TEMPLATE_MARKERS)
def test_response_locatable_by_marker(solution, fn_name, marker):
    """Each template lets you find the response by a unique marker."""
    fn = getattr(solution, fn_name)
    out = fn(INSTR, RESP)
    assert marker in out, f"{fn_name}: marker {marker!r} not in output"
    # The response text appears AFTER the marker.
    idx = out.index(marker) + len(marker)
    assert out[idx:].startswith(RESP), (
        f"{fn_name}: expected response immediately after marker, "
        f"got {out[idx:idx+len(RESP)+5]!r}"
    )


# --- The whole point: same inputs, different outputs ---

def test_all_four_produce_distinct_strings(solution):
    """Same (instruction, response) → four distinct outputs."""
    outputs = {
        solution.format_alpaca(INSTR, RESP),
        solution.format_chatml(INSTR, RESP),
        solution.format_llama2(INSTR, RESP),
        solution.format_phi3(INSTR, RESP),
    }
    assert len(outputs) == 4, "All four templates should produce different strings"


def test_each_template_contains_both_fields(solution):
    """No template silently drops the instruction or the response."""
    for fn_name in ("format_alpaca", "format_chatml", "format_llama2", "format_phi3"):
        fn = getattr(solution, fn_name)
        out = fn("CARROT", "POTATO")
        assert "CARROT" in out, f"{fn_name} dropped instruction"
        assert "POTATO" in out, f"{fn_name} dropped response"
