#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

changed=false

# 1. Resolve active ryu from .dojorc
DOJORC="$ROOT/.dojorc"
if [ ! -f "$DOJORC" ]; then
  cat > "$DOJORC" << 'CONF'
{
  "active": "effect-ts",
  "allowCommit": false,
  "tracking": {
    "enabled": false,
    "pushOnComplete": false,
    "remote": "origin"
  }
}
CONF
  changed=true
fi

ACTIVE=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$DOJORC','utf8')).active)")
RYU_DIR=".dojo/ryu/$ACTIVE"

# 2. Mirror skills + commands to .claude, .opencode, .codex
for dir in .claude .opencode .codex; do
  mkdir -p "$dir/skills" "$dir/commands"

  for ryu_skill in "$RYU_DIR/skills"/*/; do
    skill_name="$(basename "$ryu_skill")"
    link="$dir/skills/$skill_name"
    [ -e "$link" ] && continue
    ln -s "../../$RYU_DIR/skills/$skill_name" "$link"
    changed=true
  done

  if [ ! -e "$dir/commands/kata.md" ]; then
    ln -sf "../../$RYU_DIR/commands/kata.md" "$dir/commands/kata.md"
    changed=true
  fi
done

# 3. Dependencies (install from ryu directory)
if [ ! -d "$RYU_DIR/node_modules" ]; then
  echo "Installing dependencies..." >&2
  (cd "$RYU_DIR" && pnpm install) >&2
  changed=true
fi

if [ "$changed" = true ]; then
  echo "setup complete"
else
  echo "ready"
fi
