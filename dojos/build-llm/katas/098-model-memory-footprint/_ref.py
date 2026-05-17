"""Reference solution for model-memory-footprint."""

_BYTES_PER_PARAM = {
    "float32": 4,
    "float16": 2,
    "bfloat16": 2,
    "int8": 1,
    "int4": 0.5,
}

# Highest precision first.
_PRECISION_ORDER = ["float32", "bfloat16", "float16", "int8", "int4"]


def model_memory(n_params: int, dtype: str = "float16") -> int:
    if dtype not in _BYTES_PER_PARAM:
        raise ValueError(f"Unknown dtype: {dtype}")
    if dtype == "int4":
        return n_params // 2
    return n_params * _BYTES_PER_PARAM[dtype]


def cheapest_dtype_that_fits(n_params: int, available_bytes: int) -> str | None:
    for dtype in _PRECISION_ORDER:
        if model_memory(n_params, dtype) <= available_bytes:
            return dtype
    return None
