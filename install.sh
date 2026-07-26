#!/usr/bin/env bash
set -euo pipefail

PI_PACKAGE="@mariozechner/pi-coding-agent@0.69.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="${ALIGNED_CODING_AGENT_REPO:-${ALIGNED_AGENT_REPO:-${RESONANT_REPO:-}}}"
REF="${ALIGNED_CODING_AGENT_REF:-${ALIGNED_AGENT_REF:-${RESONANT_REF:-main}}}"
ZIP_URL="${ALIGNED_CODING_AGENT_ZIP_URL:-${ALIGNED_AGENT_ZIP_URL:-${RESONANT_ZIP_URL:-}}}"
SKIP_PI_INSTALL=0

for argument in "$@"; do
  case "$argument" in
    --skip-pi-install) SKIP_PI_INSTALL=1 ;;
    *) printf 'Unknown installer option: %s\n' "$argument" >&2; exit 2 ;;
  esac
done

ALIGNED_HOME="${ALIGNED_CODING_AGENT_HOME:-${ALIGNED_AGENT_HOME:-${RESONANT_HOME:-$HOME/.aligned-coding-agent-os}}}"
ALIGNED_HOME="$(mkdir -p "$ALIGNED_HOME" && cd "$ALIGNED_HOME" && pwd)"
AGENT_DIR="$ALIGNED_HOME/agent"
WORKSPACE_DIR="$ALIGNED_HOME/workspace"
APP_DIR="$ALIGNED_HOME/app"
BIN_DIR="$ALIGNED_HOME/bin"

export ALIGNED_CODING_AGENT_HOME="$ALIGNED_HOME"
export ALIGNED_AGENT_HOME="$ALIGNED_HOME"
export RESONANT_HOME="$ALIGNED_HOME"
export PI_HOME="$ALIGNED_HOME"
export PI_CODING_AGENT_DIR="$AGENT_DIR"
export PI_WORKSPACE="$WORKSPACE_DIR"

log() { printf '%s\n' "$1"; }
die() { printf 'ERROR: %s\n' "$1" >&2; exit 1; }

copy_directory() {
  source_directory="$1"
  destination_directory="$2"
  [ -d "$source_directory" ] || return 0
  mkdir -p "$destination_directory"
  cp -R "$source_directory"/. "$destination_directory"/
}

resolve_source() {
  if [ -f "$SCRIPT_DIR/core/bootstrap.js" ] && [ -d "$SCRIPT_DIR/harness" ]; then
    return
  fi

  command -v curl >/dev/null 2>&1 || die "curl is required for a remote install."
  command -v unzip >/dev/null 2>&1 || die "unzip is required for a remote install."
  [ -n "$ZIP_URL" ] || [ -n "$REPO" ] \
    || die "No Coding Edition release source was provided. Use the complete release ZIP or set ALIGNED_CODING_AGENT_REPO."
  temporary_root="$(mktemp -d 2>/dev/null || mktemp -d -t aligned-coding-agent-os)"
  archive="$temporary_root/aligned-coding-agent-os.zip"
  if [ -z "$ZIP_URL" ]; then
    ZIP_URL="https://github.com/$REPO/archive/refs/heads/$REF.zip"
  fi
  log "Downloading Aligned Coding Agent OS from $REPO ($REF)..."
  curl -fsSL "$ZIP_URL" -o "$archive"
  unzip -q "$archive" -d "$temporary_root"
  bootstrap="$(find "$temporary_root" -maxdepth 4 -type f -path '*/core/bootstrap.js' -print -quit)"
  [ -n "$bootstrap" ] || die "The downloaded archive is not a valid Aligned Coding Agent OS release."
  SCRIPT_DIR="$(cd "$(dirname "$bootstrap")/.." && pwd)"
}

log ""
log "ALIGNED CODING AGENT OS"
log "Private local coding installation"
log ""

resolve_source
command -v node >/dev/null 2>&1 || die "Node.js 22 or newer is required. Install it from https://nodejs.org/en/download and run this installer again."
node -e "if (Number(process.versions.node.split('.')[0]) < 22) process.exit(1)" \
  || die "Node.js 22 or newer is required. Current version: $(node -v)"
command -v npm >/dev/null 2>&1 || die "npm was not found on PATH. Reinstall Node.js from https://nodejs.org/en/download and run this installer again."

if [ "$SKIP_PI_INSTALL" -ne 1 ]; then
  if command -v pi >/dev/null 2>&1 &&
     [ "${ALIGNED_FORCE_PI_INSTALL:-${RESONANT_FORCE_PI_INSTALL:-0}}" != "1" ]; then
    log "Pi runtime found; keeping the installed version."
  else
    log "Installing the pinned Pi runtime..."
    npm install -g "$PI_PACKAGE"
  fi
fi

log "Creating the private runtime..."
mkdir -p "$AGENT_DIR" "$WORKSPACE_DIR" "$APP_DIR" "$BIN_DIR"

if [ -f "$APP_DIR/package.json" ] &&
   [ "${ALIGNED_SKIP_PRE_UPGRADE_BACKUP:-0}" != "1" ]; then
  log "Creating a safe pre-upgrade backup..."
  node "$SCRIPT_DIR/scripts/create-pre-upgrade-backup.js" \
    || die "The pre-upgrade backup failed. Existing application files were not replaced."
fi

log "Installing application files..."
for directory in aligned_agent assets bridge coding core defaults harness heartbeat interfaces schemas scripts telegram ui; do
  copy_directory "$SCRIPT_DIR/$directory" "$APP_DIR/$directory"
done

for file in config.template.json LICENSE package.json QUICK_START.md README.md RELEASE.md run.py SECURITY.md soul.json THIRD_PARTY_NOTICES.md version.json start.sh ui.sh heartbeat-start.sh telegram-setup.sh telegram-disconnect.sh telegram-start.sh; do
  [ -f "$SCRIPT_DIR/$file" ] && cp "$SCRIPT_DIR/$file" "$APP_DIR/$file"
done
chmod +x "$APP_DIR"/*.sh 2>/dev/null || true

log "Initializing the buyer-owned entity and harness..."
node "$APP_DIR/core/bootstrap.js" --json >/dev/null

cat > "$BIN_DIR/aligned-coding-agent" <<EOF
#!/usr/bin/env bash
export ALIGNED_AGENT_HOME="$ALIGNED_HOME"
export ALIGNED_CODING_AGENT_HOME="$ALIGNED_HOME"
export RESONANT_HOME="$ALIGNED_HOME"
export PI_HOME="$ALIGNED_HOME"
export PI_CODING_AGENT_DIR="$AGENT_DIR"
export PI_WORKSPACE="$WORKSPACE_DIR"
exec "$APP_DIR/start.sh" "\$@"
EOF
chmod +x "$BIN_DIR/aligned-coding-agent"

log ""
log "Installation complete."
log "Private data: $ALIGNED_HOME"
log "Start: $BIN_DIR/aligned-coding-agent"
log ""

if [ "${ALIGNED_SKIP_START:-0}" != "1" ] && [ -r /dev/tty ]; then
  printf 'Open Aligned Coding Agent OS now? [Y/n] ' > /dev/tty
  read -r answer < /dev/tty || true
  if [ -z "${answer:-}" ] || [ "${answer,,}" != "n" ]; then
    "$APP_DIR/start.sh"
  fi
fi
