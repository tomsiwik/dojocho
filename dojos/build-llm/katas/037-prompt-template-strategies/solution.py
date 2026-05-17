"""Prompt Template Strategies

Four prompt templates — Alpaca, ChatML, Llama-2, Phi-3 — side by side.
Each is a contract between a fine-tuned model and its inference-time
prompt. Same (instruction, response) in, very different strings out.
"""


def format_alpaca(instruction: str, response: str) -> str:
    """Stanford Alpaca format.

        Below is an instruction that describes a task. Write a response that appropriately completes the request.

        ### Instruction:
        {instruction}

        ### Response:
        {response}
    """
    ...  # implement me


def format_chatml(instruction: str, response: str) -> str:
    """OpenAI ChatML format.

        <|im_start|>user
        {instruction}<|im_end|>
        <|im_start|>assistant
        {response}<|im_end|>
    """
    ...  # implement me


def format_llama2(instruction: str, response: str) -> str:
    """Llama-2 chat format.

        <s>[INST] {instruction} [/INST] {response} </s>
    """
    ...  # implement me


def format_phi3(instruction: str, response: str) -> str:
    """Microsoft Phi-3 format.

        <|user|>
        {instruction}<|end|>
        <|assistant|>
        {response}<|end|>
    """
    ...  # implement me
