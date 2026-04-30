$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$outLog = Join-Path $repoRoot ".codex-runner.out.log"
$errLog = Join-Path $repoRoot ".codex-runner.err.log"

$existing = Get-CimInstance Win32_Process |
  Where-Object { $_.CommandLine -like "*scripts/codex-runner.ts*" -and $_.ProcessId -ne $PID }

if ($existing) {
  $existing | Select-Object ProcessId, Name, CommandLine
  Write-Host "Codex runner is already running."
  exit 0
}

$command = @"
Set-Location '$repoRoot'
npm run codex:runner
"@

$encoded = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($command))
Start-Process powershell `
  -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-EncodedCommand", $encoded) `
  -WorkingDirectory $repoRoot `
  -WindowStyle Hidden `
  -RedirectStandardOutput $outLog `
  -RedirectStandardError $errLog

Start-Sleep -Seconds 3
Get-Content $outLog -ErrorAction SilentlyContinue
