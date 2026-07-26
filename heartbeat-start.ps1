$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $ScriptDir) {
  $ScriptDir = (Get-Location).Path
}

if ($env:ALIGNED_CODING_AGENT_HOME) {
  $env:PI_HOME = $env:ALIGNED_CODING_AGENT_HOME
} elseif ($env:ALIGNED_AGENT_HOME) {
  $env:PI_HOME = $env:ALIGNED_AGENT_HOME
} elseif ($env:RESONANT_HOME) {
  $env:PI_HOME = $env:RESONANT_HOME
} else {
  $env:PI_HOME = Join-Path $env:USERPROFILE ".aligned-coding-agent-os"
}
$env:ALIGNED_CODING_AGENT_HOME = $env:PI_HOME
$env:ALIGNED_AGENT_HOME = $env:PI_HOME
$env:RESONANT_HOME = $env:PI_HOME
$env:PI_CODING_AGENT_DIR = Join-Path $env:PI_HOME "agent"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js is required to run Aligned Coding Agent OS heartbeats."
  exit 1
}

& node "$ScriptDir\heartbeat\runner.js" @args
