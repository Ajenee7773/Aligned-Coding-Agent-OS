from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
VERSION = json.loads((ROOT / "version.json").read_text(encoding="utf-8"))["application"]
OUTPUT = ROOT.parent / "outputs" / f"Aligned-Coding-Agent-OS-v{VERSION}.zip"
EXCLUDED_PARTS = {
    ".git",
    ".idea",
    ".venv",
    ".vscode",
    "__pycache__",
    "data",
    "logs",
    "node_modules",
    "sessions",
    "tmp",
    "venv",
    "work",
}
EXCLUDED_NAMES = {
    ".env",
    "auth.json",
    "config.json",
    "telegram.json",
    "npm-debug.log",
}
EXCLUDED_SUFFIXES = {".key", ".lock", ".log", ".pem", ".pid", ".pyc", ".pyo"}


def include(path: Path) -> bool:
    relative = path.relative_to(ROOT)
    if any(part in EXCLUDED_PARTS for part in relative.parts):
        return False
    if path.name in EXCLUDED_NAMES:
        return False
    if path.suffix.lower() in EXCLUDED_SUFFIXES:
        return False
    return True


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> int:
    audit = subprocess.run([sys.executable, str(ROOT / "scripts" / "security_audit.py")])
    if audit.returncode:
        print("Release stopped: resolve the privacy audit findings first.", file=sys.stderr)
        return audit.returncode

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="aligned-coding-agent-release-") as temporary:
        staging = Path(temporary) / "Aligned-Coding-Agent-OS"
        for source in ROOT.rglob("*"):
            if not source.is_file() or not include(source):
                continue
            relative = source.relative_to(ROOT)
            destination = staging / relative
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, destination)

        version = json.loads((staging / "version.json").read_text(encoding="utf-8"))
        files = sorted(
            path for path in staging.rglob("*")
            if path.is_file() and path.name not in {"MANIFEST.sha256", "BUILD-INFO.json"}
        )
        manifest_lines = [
            f"{sha256(path)}  {path.relative_to(staging).as_posix()}"
            for path in files
        ]
        (staging / "MANIFEST.sha256").write_text(
            "\n".join(manifest_lines) + "\n",
            encoding="utf-8",
        )
        (staging / "BUILD-INFO.json").write_text(
            json.dumps(
                {
                    "format": "aligned-coding-agent-release",
                    "version": version["application"],
                    "file_count": len(files),
                    "manifest": "MANIFEST.sha256",
                },
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )
        archive_base = OUTPUT.with_suffix("")
        created = Path(shutil.make_archive(str(archive_base), "zip", staging.parent, staging.name))
        if created != OUTPUT:
            shutil.move(created, OUTPUT)

    print(f"Created {OUTPUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
