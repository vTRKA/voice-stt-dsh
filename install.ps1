[CmdletBinding()]
param(
  [string]$Profile = 'desktop',
  [string]$Repository = 'github:vTRKA/voice-stt-dsh'
)

$ErrorActionPreference = 'Stop'

function Invoke-Pnpm {
  param([string[]]$Arguments)
  & corepack pnpm @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "pnpm failed with exit code $LASTEXITCODE."
  }
}

if (Get-Command dsh -ErrorAction SilentlyContinue) {
  & dsh plugin --profile $Profile add $Repository
  if ($LASTEXITCODE -ne 0) {
    throw "dsh plugin installation failed with exit code $LASTEXITCODE."
  }
} else {
  $userHome = [Environment]::GetFolderPath('UserProfile')
  $profileDir = Join-Path $userHome ".dsh\profiles\$Profile"
  if (-not (Test-Path -LiteralPath $profileDir)) {
    throw "DSH profile '$Profile' was not found. Start DSH Desktop once, then run this installer again."
  }

  Invoke-Pnpm @('--dir', $profileDir, 'add', $Repository)

  $manifestPath = Join-Path $profileDir 'package.json'
  $manifest = Get-Content -Raw -LiteralPath $manifestPath | ConvertFrom-Json
  if (-not ($manifest.dsh.profile.bundles -contains '@local/dsh-parakeet-voice-input')) {
    $manifest.dsh.profile.bundles = @($manifest.dsh.profile.bundles) + '@local/dsh-parakeet-voice-input'
    $manifest | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $manifestPath -Encoding UTF8
  }

  $patchPath = Join-Path $profileDir 'cordis.patch.yml'
  $patch = if (Test-Path -LiteralPath $patchPath) { Get-Content -Raw -LiteralPath $patchPath } else { '' }
  if ($patch -notmatch "name: '@local/dsh-parakeet-voice-input'") {
    $patch = $patch.TrimEnd() + "`r`n`r`n- insert:`r`n    - id: parakeet-voice-input`r`n      name: '@local/dsh-parakeet-voice-input'`r`n"
  }
  if ($patch -notmatch '(?m)^- id: ui-voice-input\s*$') {
    $patch = $patch.TrimEnd() + "`r`n`r`n- id: ui-voice-input`r`n  disabled: true`r`n"
    Set-Content -LiteralPath $patchPath -Value $patch -Encoding UTF8
  }
}

Write-Host "Installed Parakeet voice input into profile '$Profile'. Restart DSH to load the microphone button."
