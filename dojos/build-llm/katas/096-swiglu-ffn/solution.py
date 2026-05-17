"""swiglu-ffn — SwiGLU gated feed-forward block.

The classical transformer FFN is `down(activation(up(x)))` — two linears.
SwiGLU replaces that with three linears combined through a
multiplicative gate:

    hidden = SiLU(W_gate @ x) * (W_up @ x)
    out    = W_down @ hidden

Used in Llama, Qwen3, Mistral, PaLM, DeepSeek — the modern default.
"""

import torch
import torch.nn as nn


class SwiGLU(nn.Module):
    """SwiGLU feed-forward block.

    Args:
        d_model: input/output embedding dim.
        d_ff:    intermediate (gate/up) dim.
    """

    def __init__(self, d_model: int, d_ff: int):
        super().__init__()
        ...  # implement me: W_gate, W_up (d_model -> d_ff), W_down (d_ff -> d_model)
        #                    all with bias=False

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Run SwiGLU on x of shape (..., d_model)."""
        ...  # implement me
