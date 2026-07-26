#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
printf 'Aligned Coding Agent OS configuration now runs in the private local setup screen.\n'
exec "$SCRIPT_DIR/start.sh"
