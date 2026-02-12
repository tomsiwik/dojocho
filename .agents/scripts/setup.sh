#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

changed=false

# 1. Mirror skills + commands to .claude, .opencode, .codex
for dir in .claude .opencode .codex; do
  mkdir -p "$dir/skills" "$dir/commands"

  for agent_skill in .agents/skills/*/; do
    skill_name="$(basename "$agent_skill")"
    link="$dir/skills/$skill_name"
    [ -e "$link" ] && continue
    ln -s "../../.agents/skills/$skill_name" "$link"
    changed=true
  done

  if [ ! -e "$dir/commands/kata.md" ]; then
    ln -sf "../../.agents/commands/kata.md" "$dir/commands/kata.md"
    changed=true
  fi
done

# 2. .kata config
if [ ! -f .kata/config.json ]; then
  mkdir -p .kata
  cat > .kata/config.json << 'CONF'
{
  "allowCommit": false
}
CONF
  changed=true
fi

# 3. Dependencies
if [ ! -d node_modules ]; then
  echo "Installing dependencies..." >&2
  pnpm install >&2
  changed=true
fi

if [ "$changed" = true ]; then
  echo "setup complete"
else
  echo "ready"
fi
