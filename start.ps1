param(
  [switch]$Terminal,
  [switch]$Check
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $ScriptDir) {
  $ScriptDir = (Get-Location).Path
}

if ($env:ALIGNED_CODING_AGENT_HOME) {
  $AlignedHome = $env:ALIGNED_CODING_AGENT_HOME
} elseif ($env:ALIGNED_AGENT_HOME) {
  $AlignedHome = $env:ALIGNED_AGENT_HOME
} elseif ($env:RESONANT_HOME) {
  $AlignedHome = $env:RESONANT_HOME
} else {
  $AlignedHome = Join-Path $env:USERPROFILE ".aligned-coding-agent-os"
}
$AlignedHome = [IO.Path]::GetFullPath($AlignedHome)

$env:ALIGNED_CODING_AGENT_HOME = $AlignedHome
$env:ALIGNED_AGENT_HOME = $AlignedHome
$env:RESONANT_HOME = $AlignedHome
$env:PI_HOME = $AlignedHome
$env:PI_CODING_AGENT_DIR = Join-Path $AlignedHome "agent"
$env:PI_WORKSPACE = Join-Path $AlignedHome "workspace"

function Resolve-PiCommand {
  $command = Get-Command pi -ErrorAction SilentlyContinue
  if ($command) {
    return $command.Source
  }
  $candidate = Join-Path $env:APPDATA "npm\pi.cmd"
  if (Test-Path -LiteralPath $candidate -PathType Leaf) {
    return $candidate
  }
  return $null
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "Node.js 22 or newer is required. Install it from https://nodejs.org/en/download, then start Aligned Coding Agent OS again."
}

& node (Join-Path $ScriptDir "core\bootstrap.js") --json | Out-Null
if ($LASTEXITCODE -ne 0) {
  throw "Aligned Coding Agent OS could not initialize its private runtime."
}

if ($Check) {
  $PiCommand = Resolve-PiCommand
  Write-Host "Aligned Coding Agent OS runtime is ready."
  Write-Host "Home: $AlignedHome"
  if ($PiCommand) {
    Write-Host "[OK] Pi runtime"
  } else {
    Write-Host "[MISSING] Pi runtime - rerun install.ps1"
  }
  exit 0
}

if ($Terminal) {
  & node (Join-Path $ScriptDir "coding\cli.js")
  exit $LASTEXITCODE
}

& node (Join-Path $ScriptDir "ui\server.js")
exit $LASTEXITCODE
