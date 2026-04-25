# Sustabdo visus Node procesus, susietus su šiuo projektu (next dev ir pan.),
# ištrina .prisma cache ir paleidžia prisma generate — sprendžia EPERM Windows.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

# Projekto aplanko vardas (pvz. mano puslapiu webas) — atitinka kelią CommandLine
$folderName = Split-Path $root -Leaf
$marker = [regex]::Escape($folderName)
$killed = Get-CimInstance Win32_Process -Filter "name = 'node.exe'" |
  Where-Object { $_.CommandLine -match $marker }

foreach ($p in $killed) {
  Write-Host "Stopping PID $($p.ProcessId) (project node)..."
  Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
}

Start-Sleep -Seconds 2

$prismaDir = Join-Path $root "node_modules\.prisma"
if (Test-Path $prismaDir) {
  Write-Host "Removing node_modules\.prisma ..."
  Remove-Item -Recurse -Force $prismaDir
}

Write-Host "Running prisma generate..."
Set-Location $root
npx prisma generate
exit $LASTEXITCODE
