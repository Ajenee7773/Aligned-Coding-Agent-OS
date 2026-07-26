$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "Aligned Coding Agent OS configuration now runs in the private local setup screen."
& (Join-Path $ScriptDir "start.ps1")
exit $LASTEXITCODE
