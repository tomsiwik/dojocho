"""model-memory-footprint — how many bytes does an LLM weigh?

Mechanical arithmetic on `n_params * bytes_per_param`. The trick is just
to memorize the bytes-per-dtype table from Appendix D (table D.2) and
remember that int4 packs two values per byte.
"""


def model_memory(n_params: int, dtype: str = "float16") -> int:
    """Return the number of bytes needed to store `n_params` weights
    in the given dtype.

    Supported dtypes: 'float32', 'float16', 'bfloat16', 'int8', 'int4'.
    int4 packs two values per byte (returns n_params // 2).
    """
    ...  # implement me


def cheapest_dtype_that_fits(n_params: int, available_bytes: int) -> str | None:
    """Return the highest-precision dtype whose weights fit in
    `available_bytes`, or None if even int4 does not fit.

    Precision order (high -> low): float32, bfloat16, float16, int8, int4.
    """
    ...  # implement me
