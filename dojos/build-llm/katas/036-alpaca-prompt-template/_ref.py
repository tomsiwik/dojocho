"""Reference solution for alpaca-prompt-template."""

from typing import Optional

PREAMBLE = (
    "Below is an instruction that describes a task. "
    "Write a response that appropriately completes the request."
)


def format_alpaca(
    instruction: str,
    input: str = "",
    response: Optional[str] = None,
) -> str:
    parts = [PREAMBLE, f"### Instruction:\n{instruction}"]
    if input != "":
        parts.append(f"### Input:\n{input}")
    body = "\n\n".join(parts)
    if response is None:
        return body + "\n\n### Response:\n"
    return body + f"\n\n### Response:\n{response}"
