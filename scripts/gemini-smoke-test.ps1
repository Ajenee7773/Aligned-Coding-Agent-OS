$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$resultFile = Join-Path ([IO.Path]::GetTempPath()) "aligned-gemini-smoke-result.json"
Remove-Item -LiteralPath $resultFile -ErrorAction SilentlyContinue
$secureKey = Read-Host "Gemini API key (hidden)" -AsSecureString
$keyPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)

try {
    $env:GEMINI_API_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($keyPointer)
    Set-Location -LiteralPath $projectRoot
    $testOutput = @(& npm.cmd run smoke:gemini 2>&1)
    $testOutput | ForEach-Object { Write-Host ([string]$_) }
    if ($LASTEXITCODE -ne 0) {
        $detail = $testOutput |
            ForEach-Object { [string]$_ } |
            Where-Object { $_ -match "Gemini smoke test failed:" } |
            Select-Object -Last 1
        if (-not $detail) {
            $detail = "Gemini smoke test did not pass. Review the output above."
        }
        @{
            status = "failed"
            checked_at = (Get-Date).ToString("o")
            detail = $detail
        } | ConvertTo-Json | Set-Content -LiteralPath $resultFile -Encoding UTF8
        throw $detail
    }
    @{
        status = "passed"
        checked_at = (Get-Date).ToString("o")
        model = if ($env:ALIGNED_GEMINI_TEST_MODEL) {
            $env:ALIGNED_GEMINI_TEST_MODEL
        } else {
            "gemini-flash-latest"
        }
    } | ConvertTo-Json | Set-Content -LiteralPath $resultFile -Encoding UTF8
    Write-Host ""
    Write-Host "Gemini provider proof passed. You may close this window."
}
catch {
    Write-Host ""
    Write-Host $_.Exception.Message -ForegroundColor Red
    throw
}
finally {
    Remove-Item Env:GEMINI_API_KEY -ErrorAction SilentlyContinue
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($keyPointer)
}
