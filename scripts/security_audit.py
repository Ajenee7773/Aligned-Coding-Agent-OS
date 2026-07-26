from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
SKIP_PARTS = {".git", "node_modules", ".venv", "venv", "__pycache__", "work"}
SKIP_NAMES = {"config.template.json"}
TEXT_SUFFIXES = {
    "",
    ".bat",
    ".css",
    ".html",
    ".js",
    ".json",
    ".md",
    ".ps1",
    ".py",
    ".sh",
    ".ts",
    ".txt",
    ".yaml",
    ".yml",
}
FORBIDDEN_FILES = {
    "config.json",
    "auth.json",
    "telegram.json",
    ".env",
}
PATTERNS = {
    "OpenAI-style API key": re.compile(r"\bsk-[A-Za-z0-9_-]{20,}\b"),
    "Telegram bot token": re.compile(r"\b\d{7,12}:[A-Za-z0-9_-]{30,}\b"),
    "Private key": re.compile(r"BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY"),
    "Windows user path": re.compile(r"[A-Za-z]:\\Users\\(?!YourName\b|<name>)[^\\\s]+", re.I),
    "Unix user path": re.compile(r"/home/(?!user\b)[^/\s]+", re.I),
}


def candidates():
    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue
        if path.resolve() == Path(__file__).resolve():
            continue
        relative = path.relative_to(ROOT)
        if any(part in SKIP_PARTS for part in relative.parts):
            continue
        yield path, relative


def main() -> int:
    findings: list[str] = []
    for path, relative in candidates():
        if path.name.lower() in FORBIDDEN_FILES:
            # Private runtime files may exist in a configured working copy.
            # The release builder excludes them and they must remain ignored.
            continue
        if path.suffix.lower() not in TEXT_SUFFIXES or path.name in SKIP_NAMES:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        for label, pattern in PATTERNS.items():
            if pattern.search(text):
                findings.append(f"{label}: {relative}")

    if findings:
        print("Security audit failed:")
        for finding in sorted(set(findings)):
            print(f"  - {finding}")
        return 1
    print("Security audit passed: no packaged secrets or personal paths detected.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
