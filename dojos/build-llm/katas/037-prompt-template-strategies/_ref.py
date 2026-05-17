"""Reference solution for prompt-template-strategies."""

ALPACA_PREAMBLE = (
    "Below is an instruction that describes a task. "
    "Write a response that appropriately completes the request."
)


def format_alpaca(instruction: str, response: str) -> str:
    return (
        f"{ALPACA_PREAMBLE}\n\n"
        f"### Instruction:\n{instruction}\n\n"
        f"### Response:\n{response}"
    )


def format_chatml(instruction: str, response: str) -> str:
    return (
        f"<|im_start|>user\n{instruction}<|im_end|>\n"
        f"<|im_start|>assistant\n{response}<|im_end|>"
    )


def format_llama2(instruction: str, response: str) -> str:
    return f"<s>[INST] {instruction} [/INST] {response} </s>"


def format_phi3(instruction: str, response: str) -> str:
    return (
        f"<|user|>\n{instruction}<|end|>\n"
        f"<|assistant|>\n{response}<|end|>"
    )
