#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ALIGNED_HOME="${ALIGNED_CODING_AGENT_HOME:-${ALIGNED_AGENT_HOME:-${RESONANT_HOME:-$HOME/.aligned-coding-agent-os}}}"
ALIGNED_HOME="$(mkdir -p "$ALIGNED_HOME" && cd "$ALIGNED_HOME" && pwd)"

export ALIGNED_CODING_AGENT_HOME="$ALIGNED_HOME"
export ALIGNED_AGENT_HOME="$ALIGNED_HOME"
export RESONANT_HOME="$ALIGNED_HOME"
export PI_HOME="$ALIGNED_HOME"
export PI_CODING_AGENT_DIR="$ALIGNED_HOME/agent"
export PI_WORKSPACE="$ALIGNED_HOME/workspace"

command -v node >/dev/null 2>&1 || {
  printf 'Node.js 22 or newer is required to start Aligned Coding Agent OS.\n' >&2
  exit 1
}

node "$SCRIPT_DIR/core/bootstrap.js" --json >/dev/null
if ! node "$SCRIPT_DIR/scripts/session-retention.js" --home "$ALIGNED_HOME" --max-age-days 15 >/dev/null; then
  printf 'Warning: old session cleanup could not finish. Aligned Coding Agent OS will still start.\n' >&2
fi

case "${1:-}" in
  --check)
    printf 'Aligned Coding Agent OS runtime is ready.\n'
    printf 'Home: %s\n' "$ALIGNED_HOME"
    if command -v pi >/dev/null 2>&1; then
      printf '[OK] Pi runtime\n'
    else
      printf '[MISSING] Pi runtime - rerun install.sh\n'
    fi
    ;;
  --terminal)
    exec node "$SCRIPT_DIR/coding/cli.js"
    ;;
  "")
    exec node "$SCRIPT_DIR/ui/server.js"
    ;;
  *)
    printf 'Usage: %s [--check|--terminal]\n' "$0" >&2
    exit 2
    ;;
esac
