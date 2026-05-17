"""Alpaca Prompt Template

Format an (instruction, input, response) triple as the Alpaca prompt
string used by Stanford Alpaca and re-popularized by Raschka chapter 7.

When `response is None`, the prompt ends with `### Response:\\n` so the
model knows it should start generating — this is the inference-time
shape.
"""

from typing import Optional


def format_alpaca(
    instruction: str,
    input: str = "",
    response: Optional[str] = None,
) -> str:
    """Return the canonical Alpaca-formatted prompt string.

    Shape (with input and response):

        Below is an instruction that describes a task. Write a response that appropriately completes the request.

        ### Instruction:
        {instruction}

        ### Input:
        {input}

        ### Response:
        {response}

    If `input == ""`, the `### Input:` block is omitted.
    If `response is None`, the prompt ends with `### Response:\\n`
    (inference-ready: the model fills in the response).
    """
    ...  # implement me
