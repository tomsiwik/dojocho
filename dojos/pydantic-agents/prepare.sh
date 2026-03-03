#!/usr/bin/env bash
set -euo pipefail

# Create venv + install deps at project root for IDE resolution
if [ -f pyproject.toml ] && command -v uv &>/dev/null; then
  echo "Setting up Python environment..."
  cp pyproject.toml "$PROJECT_ROOT/pyproject.toml"
  uv sync --project "$PROJECT_ROOT"
fi
