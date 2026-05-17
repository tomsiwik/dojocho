#!/usr/bin/env bash
set -euo pipefail

# Clean up root-level Python artifacts.
rm -f "$PROJECT_ROOT/pyproject.toml"
rm -rf "$PROJECT_ROOT/.venv"
rm -f "$PROJECT_ROOT/uv.lock"

# Leave $PROJECT_ROOT/upstream/ alone; the student may want to keep
# Raschka's repos for reference even after removing the dojo.
