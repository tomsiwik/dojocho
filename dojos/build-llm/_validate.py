"""Dev-only validator for build-llm katas.

For each kata directory under katas/ that has a `_ref.py`:
  1. Back up solution.py → solution.py.stub
  2. Copy _ref.py → solution.py
  3. Run pytest on test_solution.py via `uv run` so PEP-723-style deps resolve
  4. Restore the stub regardless of pass/fail
  5. Report per-kata pass/fail

Run:
    uv run --with pytest --no-project --python 3.12 python _validate.py

Optional: pass kata slug substrings as args to filter
    uv run --with pytest --no-project --python 3.12 python _validate.py 005 006
"""
from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
KATAS_DIR = HERE / "katas"

GREEN = "\033[32m"
RED = "\033[31m"
GRAY = "\033[90m"
BOLD = "\033[1m"
RESET = "\033[0m"


def _katas_with_refs(filters: list[str] | None = None) -> list[Path]:
    out: list[Path] = []
    for k in sorted(KATAS_DIR.iterdir()):
        if not k.is_dir():
            continue
        if not (k / "_ref.py").exists():
            continue
        if not (k / "test_solution.py").exists():
            continue
        if filters and not any(f in k.name for f in filters):
            continue
        out.append(k)
    return out


def _swap_in_reference(kata: Path) -> None:
    """Backup the stub, write the reference."""
    sol = kata / "solution.py"
    stub = sol.with_suffix(".py.stub")
    if sol.exists():
        sol.rename(stub)
    shutil.copy(kata / "_ref.py", sol)


def _restore_stub(kata: Path) -> None:
    sol = kata / "solution.py"
    stub = sol.with_suffix(".py.stub")
    if stub.exists():
        if sol.exists():
            sol.unlink()
        stub.rename(sol)


def _run_one(kata: Path) -> tuple[bool, str]:
    try:
        _swap_in_reference(kata)
        r = subprocess.run(
            [
                "uv", "run", "--with", "pytest",
                "--with", "torch", "--with", "tiktoken",
                "--no-project", "--python", "3.12",
                "pytest", "-q",
                str(kata / "test_solution.py"),
            ],
            cwd=HERE,
            capture_output=True,
            text=True,
            timeout=120,
        )
        if r.returncode == 0:
            return True, ""
        tail = "\n".join((r.stdout + r.stderr).strip().splitlines()[-10:])
        return False, tail
    except Exception as e:
        return False, f"exception: {e!r}"
    finally:
        _restore_stub(kata)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("filter", nargs="*", help="kata slug substrings to filter")
    args = ap.parse_args()

    katas = _katas_with_refs(args.filter or None)
    print(f"{BOLD}Validating {len(katas)} katas{RESET}\n")

    failed: list[tuple[str, str]] = []
    passed: list[str] = []
    for kata in katas:
        ok, tail = _run_one(kata)
        if ok:
            passed.append(kata.name)
            print(f"{GREEN}✓{RESET} {kata.name}")
        else:
            failed.append((kata.name, tail))
            print(f"{RED}✗{RESET} {kata.name}")
            print(f"{GRAY}    {tail}{RESET}".replace("\n", "\n    "))

    print()
    print(f"  passed:  {GREEN}{len(passed)}{RESET}")
    print(f"  failed:  {RED}{len(failed)}{RESET}" if failed else f"  failed:  {len(failed)}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
