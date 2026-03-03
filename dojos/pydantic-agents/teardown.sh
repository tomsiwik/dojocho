#!/usr/bin/env bash
set -euo pipefail

# Clean up root-level Python artifacts
rm -f "$PROJECT_ROOT/pyproject.toml"
rm -rf "$PROJECT_ROOT/.venv"
rm -f "$PROJECT_ROOT/uv.lock"
