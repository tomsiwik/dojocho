#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

KATA_DIR="$ROOT/katas"
PROGRESS_DIR="$ROOT/.kata"
PROGRESS_FILE="$PROGRESS_DIR/progress.json"
CONFIG_FILE="$PROGRESS_DIR/config.json"

if ! command -v jq &>/dev/null; then
  echo '{"error":"jq is required but not installed. Install via: brew install jq (macOS) or apt install jq (Linux)"}'
  exit 0
fi

mkdir -p "$PROGRESS_DIR"

# Read config
config='{"allowCommit":false}'
if [ -f "$CONFIG_FILE" ]; then
  config=$(cat "$CONFIG_FILE")
fi

# Run vitest with JSON reporter (exits non-zero when tests fail, but still outputs JSON)
vitest_output=$(pnpm vitest run --reporter=json 2>/dev/null || true)

# Validate JSON
if ! echo "$vitest_output" | jq empty 2>/dev/null; then
  echo "{\"error\":\"Failed to parse vitest output\",\"config\":$config}"
  exit 0
fi

# Discover kata directories
kata_dirs=$(ls -1 "$KATA_DIR" | grep -E '^[0-9]{3}-' | sort)
total=$(echo "$kata_dirs" | wc -l | tr -d ' ')

# Build initial katas object, then merge in vitest results, classify, detect transitions — all in one jq pass
progress=$(echo "$vitest_output" | jq \
  --arg kata_dirs "$kata_dirs" \
  --argjson config "$config" \
  --argjson prev "$(cat "$PROGRESS_FILE" 2>/dev/null || echo '{}')" \
  --arg now "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
'
  # Split kata dir names
  ($kata_dirs | split("\n") | map(select(length > 0))) as $dirs |

  # Initialize all katas
  (reduce $dirs[] as $d ({}; .[$d] = {status:"not-started",passed:0,failed:0,total:0,failedTests:[]})) as $init |

  # Merge vitest results into kata entries
  (reduce (.testResults // [])[] as $file ($init;
    ($file.name // "" | capture("katas/(?<dir>[0-9]{3}-[^/]+)/") // null) as $match |
    if $match and .[$match.dir] then
      reduce ($file.assertionResults // [])[] as $a (.;
        .[$match.dir].total += 1 |
        if $a.status == "passed" then
          .[$match.dir].passed += 1
        else
          .[$match.dir].failed += 1 |
          .[$match.dir].failedTests += [$a.fullName // $a.title // "unknown"]
        end
      )
    else . end
  )) as $katas |

  # Classify each kata
  ($katas | to_entries | map(
    .value.status = (
      if .value.total == 0 then "not-started"
      elif .value.failed == 0 then "completed"
      elif .value.passed > 0 then "in-progress"
      else "not-started"
      end
    ) | .
  ) | from_entries) as $classified |

  # Count completed
  ([$classified | to_entries[] | select(.value.status == "completed")] | length) as $completed |

  # Detect transitions from previous progress
  ([$classified | to_entries[] | select(
    .value.status == "completed" and
    ($prev.katas[.key].status // "not-started") != "completed"
  ) | .key]) as $transitions |

  # Output
  {
    completed: $completed,
    total: ($dirs | length),
    transitions: $transitions,
    katas: $classified,
    config: $config,
    lastUpdated: $now
  }
')

# Persist cache
echo "$progress" > "$PROGRESS_FILE"

# Output for the prompt
echo "$progress"
