param(
  [string]$Repo = "",
  [string]$Ref = "",
  [string]$ZipUrl = "",
  [switch]$SkipPiInstall
)

$ErrorActionPreference = "Stop"

if (-not $Repo) {
  $Repo = if ($env:ALIGNED_CODING_AGENT_REPO) {
    $env:ALIGNED_CODING_AGENT_REPO
  } elseif ($env:ALIGNED_AGENT_REPO) {
    $env:ALIGNED_AGENT_REPO
  } elseif ($env:RESONANT_REPO) {
    $env:RESONANT_REPO
  } else {
    ""
  }
}
if (-not $Ref) {
  $Ref = if ($env:ALIGNED_CODING_AGENT_REF) {
    $env:ALIGNED_CODING_AGENT_REF
  } elseif ($env:ALIGNED_AGENT_REF) {
    $env:ALIGNED_AGENT_REF
  } elseif ($env:RESONANT_REF) {
    $env:RESONANT_REF
  } else {
    "main"
  }
}
if (-not $ZipUrl) {
  $ZipUrl = if ($env:ALIGNED_CODING_AGENT_ZIP_URL) {
    $env:ALIGNED_CODING_AGENT_ZIP_URL
  } elseif ($env:ALIGNED_AGENT_ZIP_URL) {
    $env:ALIGNED_AGENT_ZIP_URL
  } else {
    $env:RESONANT_ZIP_URL
  }
}

$PiPackage = "@mariozechner/pi-coding-agent@0.69.0"
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
$AgentDir = Join-Path $AlignedHome "agent"
$WorkspaceDir = Join-Path $AlignedHome "workspace"
$AppDir = Join-Path $AlignedHome "app"
$BinDir = Join-Path $AlignedHome "bin"

$env:ALIGNED_CODING_AGENT_HOME = $AlignedHome
$env:ALIGNED_AGENT_HOME = $AlignedHome
$env:RESONANT_HOME = $AlignedHome
$env:PI_HOME = $AlignedHome
$env:PI_CODING_AGENT_DIR = $AgentDir
$env:PI_WORKSPACE = $WorkspaceDir

function Write-Step($Message) {
  Write-Host $Message
}

function Fail($Message) {
  throw "ERROR: $Message"
}

function Copy-Directory($Source, $Destination) {
  if (-not (Test-Path -LiteralPath $Source -PathType Container)) {
    return
  }
  New-Item -ItemType Directory -Force -Path $Destination | Out-Null
  Get-ChildItem -LiteralPath $Source -Force |
    Copy-Item -Destination $Destination -Recurse -Force
}

function Resolve-Source {
  if ((Test-Path -LiteralPath (Join-Path $ScriptDir "core\bootstrap.js")) -and
      (Test-Path -LiteralPath (Join-Path $ScriptDir "harness"))) {
    return
  }

  Write-Step "Release files were not found beside the installer."
  if (-not $ZipUrl -and -not $Repo) {
    Fail "No Coding Edition release source was provided. Use the complete release ZIP or set ALIGNED_CODING_AGENT_REPO."
  }
  Write-Step "Downloading Aligned Coding Agent OS from $Repo ($Ref)..."
  $temporaryRoot = Join-Path ([IO.Path]::GetTempPath()) ("aligned-coding-agent-os-" + [guid]::NewGuid().ToString("N"))
  New-Item -ItemType Directory -Path $temporaryRoot | Out-Null
  $archive = Join-Path $temporaryRoot "aligned-coding-agent-os.zip"
  if (-not $ZipUrl) {
    $script:ZipUrl = "https://github.com/$Repo/archive/refs/heads/$Ref.zip"
  }
  Invoke-WebRequest -Uri $ZipUrl -OutFile $archive
  Expand-Archive -LiteralPath $archive -DestinationPath $temporaryRoot -Force
  $found = Get-ChildItem -LiteralPath $temporaryRoot -Directory -Recurse |
    Where-Object {
      (Test-Path -LiteralPath (Join-Path $_.FullName "core\bootstrap.js")) -and
      (Test-Path -LiteralPath (Join-Path $_.FullName "harness"))
    } |
    Select-Object -First 1
  if (-not $found) {
    Fail "The downloaded archive is not a valid Aligned Coding Agent OS release."
  }
  $script:ScriptDir = $found.FullName
}

function Check-Node {
  if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Fail "Node.js is required. Install Node.js 22 or newer from https://nodejs.org/en/download, then run this installer again."
  }
  $major = & node -e "process.stdout.write(process.versions.node.split('.')[0])"
  if ([int]$major -lt 22) {
    Fail "Node.js 22 or newer is required. Current version: $(node -v)"
  }
  if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Fail "npm was not found on PATH. Reinstall Node.js 22 or newer from https://nodejs.org/en/download, then run this installer again."
  }
}

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

Write-Step ""
Write-Step "ALIGNED CODING AGENT OS"
Write-Step "Private local coding installation"
Write-Step ""

Resolve-Source
Write-Step "Checking Node.js..."
Check-Node

$PiCommand = Resolve-PiCommand
if ($PiCommand -and
    -not $SkipPiInstall -and
    $env:ALIGNED_FORCE_PI_INSTALL -ne "1" -and
    $env:RESONANT_FORCE_PI_INSTALL -ne "1") {
  Write-Step "Pi runtime found; keeping the installed version."
} elseif (-not $SkipPiInstall) {
  Write-Step "Installing the pinned Pi runtime..."
  npm install -g $PiPackage
  if ($LASTEXITCODE -ne 0) {
    Fail "The Pi runtime installation failed."
  }
}

Write-Step "Creating the private runtime..."
foreach ($directory in @($AlignedHome, $AgentDir, $WorkspaceDir, $AppDir, $BinDir)) {
  New-Item -ItemType Directory -Force -Path $directory | Out-Null
}

if ((Test-Path -LiteralPath (Join-Path $AppDir "package.json") -PathType Leaf) -and
    $env:ALIGNED_SKIP_PRE_UPGRADE_BACKUP -ne "1") {
  Write-Step "Creating a safe pre-upgrade backup..."
  & node (Join-Path $ScriptDir "scripts\create-pre-upgrade-backup.js")
  if ($LASTEXITCODE -ne 0) {
    Fail "The pre-upgrade backup failed. Existing application files were not replaced."
  }
}

Write-Step "Installing application files..."
foreach ($directory in @(
  "aligned_agent",
  "assets",
  "bridge",
  "coding",
  "core",
  "defaults",
  "harness",
  "heartbeat",
  "interfaces",
  "schemas",
  "scripts",
  "telegram",
  "ui"
)) {
  Copy-Directory (Join-Path $ScriptDir $directory) (Join-Path $AppDir $directory)
}

foreach ($file in @(
  "config.template.json",
  "LICENSE",
  "package.json",
  "QUICK_START.md",
  "README.md",
  "RELEASE.md",
  "run.py",
  "SECURITY.md",
  "soul.json",
  "THIRD_PARTY_NOTICES.md",
  "version.json",
  "start.ps1",
  "start.bat",
  "ui.bat",
  "heartbeat-start.ps1",
  "heartbeat-start.bat",
  "telegram-setup.bat",
  "telegram-disconnect.bat",
  "telegram-start.bat"
)) {
  $source = Join-Path $ScriptDir $file
  if (Test-Path -LiteralPath $source -PathType Leaf) {
    Copy-Item -LiteralPath $source -Destination (Join-Path $AppDir $file) -Force
  }
}

Write-Step "Initializing the buyer-owned entity and harness..."
& node (Join-Path $AppDir "core\bootstrap.js") --json | Out-Null
if ($LASTEXITCODE -ne 0) {
  Fail "The private runtime could not be initialized."
}

$PowerShellLauncher = @"
`$env:ALIGNED_AGENT_HOME = "$AlignedHome"
`$env:ALIGNED_CODING_AGENT_HOME = "$AlignedHome"
`$env:RESONANT_HOME = "$AlignedHome"
`$env:PI_HOME = "$AlignedHome"
`$env:PI_CODING_AGENT_DIR = "$AgentDir"
`$env:PI_WORKSPACE = "$WorkspaceDir"
& "$AppDir\start.ps1" @args
"@
$PowerShellLauncher |
  Set-Content -LiteralPath (Join-Path $BinDir "aligned-coding-agent.ps1") -Encoding UTF8

$BatchLauncher = @"
@echo off
set "ALIGNED_AGENT_HOME=$AlignedHome"
set "ALIGNED_CODING_AGENT_HOME=$AlignedHome"
set "RESONANT_HOME=$AlignedHome"
set "PI_HOME=$AlignedHome"
set "PI_CODING_AGENT_DIR=$AgentDir"
set "PI_WORKSPACE=$WorkspaceDir"
powershell -NoProfile -ExecutionPolicy Bypass -File "$AppDir\start.ps1" %*
"@
$BatchLauncher |
  Set-Content -LiteralPath (Join-Path $BinDir "aligned-coding-agent.bat") -Encoding ASCII
$BatchLauncher |
  Set-Content -LiteralPath (Join-Path $AlignedHome "Start Aligned Coding Agent OS.bat") -Encoding ASCII

$ResidentAgentsRoot = Join-Path $env:USERPROFILE "AlignedAI\ResidentAgents"
Copy-Directory (Join-Path $ScriptDir "resident-agents") $ResidentAgentsRoot
& (Join-Path $ResidentAgentsRoot "register-resident-agent.ps1") `
  -Name "Aligned Coding Agent" `
  -WindowsLauncher (Join-Path $AlignedHome "Start Aligned Coding Agent OS.bat") `
  -Root $ResidentAgentsRoot `
  -InstallDesktopStarter

Write-Step ""
Write-Step "Installation complete."
Write-Step "Private data: $AlignedHome"
Write-Step "Start: $AlignedHome\Start Aligned Coding Agent OS.bat"
Write-Step "Start all resident agents: $ResidentAgentsRoot\Start Resident Agents.bat"
Write-Step ""

if ($env:ALIGNED_SKIP_START -ne "1") {
  $answer = Read-Host "Open Aligned Coding Agent OS now? [Y/n]"
  if (-not $answer -or $answer.ToLowerInvariant() -ne "n") {
    & (Join-Path $AppDir "start.ps1")
  }
}
