"""Tests for model-memory-footprint."""

import pytest

GB = 1024**3


def test_float32_is_4_bytes(solution):
    assert solution.model_memory(1, "float32") == 4
    assert solution.model_memory(1_000_000, "float32") == 4_000_000


def test_float16_is_2_bytes(solution):
    assert solution.model_memory(1, "float16") == 2
    assert solution.model_memory(1_000_000_000, "float16") == 2_000_000_000


def test_bfloat16_matches_float16(solution):
    assert solution.model_memory(12345, "bfloat16") == solution.model_memory(
        12345, "float16"
    )


def test_int8_is_1_byte(solution):
    assert solution.model_memory(1, "int8") == 1
    assert solution.model_memory(70_000_000_000, "int8") == 70_000_000_000


def test_int4_packs_two_per_byte(solution):
    assert solution.model_memory(2, "int4") == 1
    assert solution.model_memory(1000, "int4") == 500


def test_default_dtype_is_float16(solution):
    assert solution.model_memory(100) == solution.model_memory(100, "float16")


def test_returns_int(solution):
    out = solution.model_memory(1_000_000, "float16")
    assert isinstance(out, int)


def test_qwen3_4b_bf16_matches_appendix_d(solution):
    """Appendix D table D.2: 4B in bf16 is 'about 8 GB'."""
    bytes_ = solution.model_memory(4_000_000_000, "bfloat16")
    gigabytes = bytes_ / GB
    # ~7.45 GiB — within the 'about 8 GB' rounding in the book.
    assert 7.0 < gigabytes < 8.5


def test_cheapest_dtype_picks_float32_when_plenty(solution):
    # 1M params, give it 100 MB — float32 (4 MB) fits.
    assert solution.cheapest_dtype_that_fits(1_000_000, 100_000_000) == "float32"


def test_cheapest_dtype_drops_to_float16(solution):
    # 1M params: float32 needs 4_000_000 bytes; give it 2_500_000.
    dtype = solution.cheapest_dtype_that_fits(1_000_000, 2_500_000)
    assert dtype in ("float16", "bfloat16")  # tied precision; either is fine


def test_cheapest_dtype_drops_to_int8(solution):
    # 1M params: float16 needs 2_000_000; int8 needs 1_000_000. Give 1_500_000.
    assert solution.cheapest_dtype_that_fits(1_000_000, 1_500_000) == "int8"


def test_cheapest_dtype_drops_to_int4(solution):
    # 1M params: int8 needs 1_000_000; int4 needs 500_000. Give 600_000.
    assert solution.cheapest_dtype_that_fits(1_000_000, 600_000) == "int4"


def test_cheapest_dtype_returns_none_when_too_big(solution):
    # 1M params: int4 needs 500_000. Give it 100_000.
    assert solution.cheapest_dtype_that_fits(1_000_000, 100_000) is None


def test_cheapest_dtype_exact_fit_counts(solution):
    # int4 needs exactly 500_000 bytes for 1M params.
    assert solution.cheapest_dtype_that_fits(1_000_000, 500_000) == "int4"


@pytest.mark.parametrize(
    "n_params,available_gb,expected",
    [
        # 70B model on 4x24GB ≈ 96 GB — int8 fits (70 GB), float16 (140 GB) doesn't.
        (70_000_000_000, 96, "int8"),
        # 7B model on 24 GB — float16 (14 GB) fits.
        (7_000_000_000, 24, "float16"),
        # 14B model on 24 GB — float16 (28 GB) doesn't, int8 (14 GB) does.
        (14_000_000_000, 24, "int8"),
    ],
)
def test_serving_scenarios(solution, n_params, available_gb, expected):
    available = available_gb * GB
    result = solution.cheapest_dtype_that_fits(n_params, available)
    assert result in (expected, "bfloat16" if expected == "float16" else expected)
