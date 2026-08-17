[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [uri]$Url,
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^[0-9a-fA-F]{64}$')]
  [string]$Sha256,
  [string]$DshHome = $(if ($env:DSH_HOME) { $env:DSH_HOME } else { Join-Path $HOME '.dsh' })
)

$ErrorActionPreference = 'Stop'
$modelDirectory = Join-Path $DshHome 'models\parakeet-tdt-0.6b-v3'
$target = Join-Path $modelDirectory 'parakeet-tdt-0.6b-v3.q8_0.gguf'
$temporary = "$target.download"

New-Item -ItemType Directory -Force -Path $modelDirectory | Out-Null
try {
  Invoke-WebRequest -Uri $Url -OutFile $temporary
  $actual = (Get-FileHash -LiteralPath $temporary -Algorithm SHA256).Hash
  if ($actual -ne $Sha256.ToUpperInvariant()) {
    throw "Model checksum mismatch. Expected $Sha256, got $actual."
  }
  Move-Item -LiteralPath $temporary -Destination $target -Force
  Write-Host "Installed and verified Parakeet model at $target"
} finally {
  if (Test-Path -LiteralPath $temporary) { Remove-Item -LiteralPath $temporary -Force }
}
