"""Tests for Alpaca Prompt Template."""

PREAMBLE = (
    "Below is an instruction that describes a task. "
    "Write a response that appropriately completes the request."
)


def test_full_triple_exact_shape(solution):
    """With all three fields, the full Alpaca string is produced."""
    out = solution.format_alpaca(
        instruction="Translate to French.",
        input="Hello, world.",
        response="Bonjour, le monde.",
    )
    expected = (
        f"{PREAMBLE}\n\n"
        "### Instruction:\nTranslate to French.\n\n"
        "### Input:\nHello, world.\n\n"
        "### Response:\nBonjour, le monde."
    )
    assert out == expected


def test_empty_input_omits_input_section(solution):
    """Empty input means NO `### Input:` block at all."""
    out = solution.format_alpaca(
        instruction="Name a color.",
        input="",
        response="Blue.",
    )
    assert "### Input:" not in out
    assert "### Instruction:\nName a color." in out
    assert out.endswith("### Response:\nBlue.")


def test_inference_shape_when_response_is_none(solution):
    """When response=None, prompt ends with `### Response:` ready for generation."""
    out = solution.format_alpaca(
        instruction="Count to three.",
        input="",
        response=None,
    )
    # Must end with the response header and a trailing newline.
    assert out.endswith("### Response:\n"), repr(out[-30:])
    # Must NOT contain the literal "None".
    assert "None" not in out


def test_inference_shape_with_input_and_no_response(solution):
    out = solution.format_alpaca(
        instruction="Translate.",
        input="cat",
        response=None,
    )
    assert "### Input:\ncat" in out
    assert out.endswith("### Response:\n")


def test_preamble_is_verbatim(solution):
    """The first line must be exactly the canonical preamble."""
    out = solution.format_alpaca("x", "", "y")
    assert out.startswith(PREAMBLE + "\n\n")


def test_section_separator_is_double_newline(solution):
    """Sections are separated by `\\n\\n` (one blank line)."""
    out = solution.format_alpaca("instr", "inp", "resp")
    # Between preamble and Instruction, Instruction and Input, Input and Response.
    assert "\n\n### Instruction:" in out
    assert "\n\n### Input:" in out
    assert "\n\n### Response:" in out


def test_returns_string(solution):
    out = solution.format_alpaca("a", "", "b")
    assert isinstance(out, str)
