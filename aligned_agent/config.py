from __future__ import annotations

import json
import os
import shutil
import subprocess
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent.parent
CONFIG_PATH = ROOT / "config.json"
TEMPLATE_PATH = ROOT / "config.template.json"


class ConfigurationError(RuntimeError):
    """Raised when the local buyer configuration is missing or invalid."""


def read_json(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise ConfigurationError(f"Missing configuration file: {path.name}") from exc
    except json.JSONDecodeError as exc:
        raise ConfigurationError(
            f"{path.name} is not valid JSON (line {exc.lineno}, column {exc.colno})."
        ) from exc
    if not isinstance(value, dict):
        raise ConfigurationError(f"{path.name} must contain a JSON object.")
    return value


def runtime_home_from_environment() -> Path:
    configured = (
        os.environ.get("ALIGNED_CODING_AGENT_HOME")
        or os.environ.get("ALIGNED_AGENT_HOME")
        or os.environ.get("RESONANT_HOME")
        or ""
    ).strip()
    return Path(configured).expanduser() if configured else Path.home() / ".aligned-coding-agent-os"


def runtime_paths() -> dict[str, Path]:
    home = runtime_home_from_environment()
    return {
        "home": home,
        "profile": home / "config" / "profile.json",
        "settings": home / "config" / "settings.json",
        "credentials": home / "secrets" / "credentials.json",
        "soul": home / "agent" / "soul.json",
        "agent": home / "agent",
        "workspace": home / "workspace",
    }


def ensure_local_config() -> Path:
    paths = runtime_paths()
    bootstrap = ROOT / "core" / "bootstrap.js"
    try:
        subprocess.run(
            ["node", str(bootstrap), "--json"],
            cwd=ROOT,
            env=runtime_environment({}),
            check=True,
            capture_output=True,
            text=True,
        )
    except (OSError, subprocess.CalledProcessError) as exc:
        detail = getattr(exc, "stderr", "") or str(exc)
        raise ConfigurationError(f"Could not initialize the private runtime: {detail}") from exc
    return paths["settings"]


def load_config(create: bool = False) -> dict[str, Any]:
    paths = runtime_paths()
    if create or not paths["settings"].exists():
        ensure_local_config()
    if paths["settings"].exists():
        profile = read_json(paths["profile"])
        settings = read_json(paths["settings"])
        credentials = read_json(paths["credentials"])
        interfaces = settings.get("interfaces", {})
        voice = interfaces.get("voice", {})
        telegram = interfaces.get("telegram", {})
        return {
            "agent": {
                "name": profile.get("agent_name", "Aligned"),
                "operator_name": profile.get("operator_name", "Operator"),
                "mission": profile.get("mission", ""),
                "soul_file": str(paths["soul"]),
            },
            "runtime": {
                **settings.get("runtime", {}),
                "api_key": credentials.get("provider_api_key", ""),
            },
            "interfaces": {
                "terminal_voice": voice,
                "telegram": {
                    **telegram,
                    "bot_token": credentials.get("telegram_bot_token", ""),
                },
            },
            "storage": {"home": str(paths["home"])},
        }
    if CONFIG_PATH.exists():
        return read_json(CONFIG_PATH)
    raise ConfigurationError("Aligned Coding Agent OS has not been initialized.")


def load_soul(config: dict[str, Any]) -> dict[str, Any]:
    configured = config.get("agent", {}).get("soul_file", "")
    path = Path(configured).expanduser() if configured else runtime_paths()["soul"]
    path = path.resolve()
    allowed_roots = [ROOT.resolve(), runtime_home_from_environment().resolve()]
    if not any(path == root or root in path.parents for root in allowed_roots):
        raise ConfigurationError("The configured soul file must stay inside the installation or runtime home.")
    return read_json(path)


def runtime_home(config: dict[str, Any]) -> Path:
    configured = str(config.get("storage", {}).get("home", "")).strip()
    return Path(configured).expanduser() if configured else runtime_home_from_environment()


def runtime_environment(config: dict[str, Any]) -> dict[str, str]:
    env = os.environ.copy()
    env["RESONANT_HOME"] = str(runtime_home(config))
    env["ALIGNED_AGENT_HOME"] = str(runtime_home(config))
    env["ALIGNED_CODING_AGENT_HOME"] = str(runtime_home(config))
    env["PI_HOME"] = str(runtime_home(config))
    env["PI_CODING_AGENT_DIR"] = str(runtime_home(config) / "agent")
    env["PI_WORKSPACE"] = str(runtime_home(config) / "workspace")
    provider = str(config.get("runtime", {}).get("provider", "")).lower()
    api_key = str(config.get("runtime", {}).get("api_key", "")).strip()
    key_names = {
        "openai": "OPENAI_API_KEY",
        "anthropic": "ANTHROPIC_API_KEY",
        "google": "GEMINI_API_KEY",
        "gemini": "GEMINI_API_KEY",
        "openrouter": "OPENROUTER_API_KEY",
        "groq": "GROQ_API_KEY",
        "mistral": "MISTRAL_API_KEY",
        "xai": "XAI_API_KEY",
    }
    if api_key and provider in key_names:
        env[key_names[provider]] = api_key
    return env


def nested(config: dict[str, Any], *keys: str, default: Any = None) -> Any:
    value: Any = config
    for key in keys:
        if not isinstance(value, dict) or key not in value:
            return default
        value = value[key]
    return value
