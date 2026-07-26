from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

from aligned_agent.config import (
    ROOT,
    ConfigurationError,
    ensure_local_config,
    load_config,
    load_soul,
    nested,
    runtime_environment,
    runtime_home,
)


BANNER = r"""
    _    _     ___ ____ _   _ _____ ____
   / \  | |   |_ _/ ___| \ | | ____|  _ \
  / _ \ | |    | | |  _|  \| |  _| | | | |
 / ___ \| |___ | | |_| | |\  | |___| |_| |
/_/   \_\_____|___\____|_| \_|_____|____/
        C O D I N G   A G E N T   O S
"""


def status(ok: bool, label: str, detail: str) -> None:
    mark = "OK" if ok else "--"
    print(f"[{mark}] {label:<22} {detail}")


def find_pi() -> str | None:
    found = shutil.which("pi") or shutil.which("pi.cmd")
    if found:
        return found
    if sys.platform == "win32":
        candidate = Path(os.environ.get("APPDATA", "")) / "npm" / "pi.cmd"
        try:
            if candidate.is_file():
                return str(candidate)
        except OSError:
            # Managed Windows environments can deny metadata reads here even
            # though the installed launcher is executable by the start script.
            return str(candidate)
    return None


def startup_check(config: dict, soul: dict) -> bool:
    print(BANNER)
    print("Startup checklist")
    node = shutil.which("node")
    pi = find_pi()
    provider = str(nested(config, "runtime", "provider", default="not configured"))
    model = str(nested(config, "runtime", "model", default="not configured"))
    model_ready = bool(provider.strip() and model.strip())
    voice = bool(nested(config, "interfaces", "terminal_voice", "enabled", default=False))
    telegram = bool(nested(config, "interfaces", "telegram", "enabled", default=False))

    status(True, "Private runtime", str(runtime_home(config)))
    status(bool(node), "Node.js engine", node or "install Node.js 22+")
    status(bool(pi), "Pi agent runtime", pi or "run the included installer")
    status(True, "Cognitive Harness", "memory rooms ready")
    status(True, "Alignment Core", f"{soul['framework']['name']} · {soul['version']}")
    status(model_ready, "Model", f"{provider or 'not configured'} / {model or 'not configured'}")
    status(voice, "Terminal Voice", "active" if voice else "disabled")
    status(telegram, "Telegram", "active" if telegram else "disabled")
    return bool(node and pi and model_ready)


def launch_terminal(config: dict) -> int:
    node = shutil.which("node")
    coding_cli = ROOT / "coding" / "cli.js"
    if not node or not coding_cli.is_file():
        print("The Coding Edition terminal is missing. Run the included installer first.", file=sys.stderr)
        return 1
    command = [node, str(coding_cli)]
    return subprocess.run(
        command,
        cwd=runtime_home(config) / "workspace",
        env=runtime_environment(config),
    ).returncode


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Boot Aligned Coding Agent OS.")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--check", action="store_true", help="Run checks without launching.")
    mode.add_argument("--voice", action="store_true", help="Launch terminal voice mode.")
    mode.add_argument("--telegram", action="store_true", help="Launch the Telegram bridge.")
    mode.add_argument("--terminal", action="store_true", help="Launch the Coding Edition terminal.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    ensure_local_config()
    config = load_config()
    soul = load_soul(config)
    ready = startup_check(config, soul)
    if args.check:
        return 0 if ready else 1
    if args.voice:
        from interfaces.terminal_voice import main as voice_main
        return voice_main()
    if args.telegram:
        from interfaces.telegram_bot import main as telegram_main
        return telegram_main()
    if not ready:
        print("\nSetup is incomplete. Follow QUICK_START.md, then run this command again.")
        return 1
    return launch_terminal(config)


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (ConfigurationError, KeyError, json.JSONDecodeError) as exc:
        print(f"Configuration error: {exc}", file=sys.stderr)
        raise SystemExit(2)
