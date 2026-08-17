[CmdletBinding()]
param(
  [string]$Profile = 'desktop'
)

$ErrorActionPreference = 'Stop'

if (-not (Get-Command dsh -ErrorAction SilentlyContinue)) {
  throw 'The dsh command is not available on PATH. Install DeepSeek Harness first.'
}

& dsh plugin --profile $Profile add 'github:vTRKA/voice-dsh'
if ($LASTEXITCODE -ne 0) {
  throw "dsh plugin installation failed with exit code $LASTEXITCODE."
}

Write-Host "Installed Parakeet voice input into profile '$Profile'. Restart dsh to load it."
