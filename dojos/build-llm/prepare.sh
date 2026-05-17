#!/usr/bin/env bash
set -euo pipefail

# Set up Python environment at project root for IDE resolution.
if [ -f pyproject.toml ] && command -v uv &>/dev/null; then
  echo "Setting up Python environment..."
  cp pyproject.toml "$PROJECT_ROOT/pyproject.toml"
  uv sync --project "$PROJECT_ROOT"
fi

# Clone Raschka's source repos as a code-reading reference for advanced katas.
# Some katas in this dojo use these as Use-Modify-Create starting points; others
# just reference them for spot-the-difference exercises. Cloned shallow.
UPSTREAM_DIR="$PROJECT_ROOT/upstream"
mkdir -p "$UPSTREAM_DIR"

clone_if_missing() {
  local name="$1"
  local url="$2"
  if [ ! -d "$UPSTREAM_DIR/$name" ]; then
    echo "Cloning $name..."
    git clone --depth 1 "$url" "$UPSTREAM_DIR/$name" >/dev/null 2>&1 || {
      echo "  (clone failed — that's OK; katas that don't need it will still work)"
      return 0
    }
  fi
}

clone_if_missing "LLMs-from-scratch"      "https://github.com/rasbt/LLMs-from-scratch"
clone_if_missing "reasoning-from-scratch" "https://github.com/rasbt/reasoning-from-scratch"

echo "Done. Start with katas/001 — see README.md for the full sequence."
