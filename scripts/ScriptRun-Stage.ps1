$ErrorActionPreference = "Stop"

$configPath = Join-Path $PSScriptRoot "run-config-stage.json"
if (-not (Test-Path $configPath)) {
    Write-Error "No se encontró el archivo de configuración: $configPath"
    exit 1
}

$config = Get-Content $configPath -Raw | ConvertFrom-Json

Remove-Item Env:\MARKETS -ErrorAction SilentlyContinue
Remove-Item Env:\CASES -ErrorAction SilentlyContinue

if ($config.markets -and $config.markets.Count -gt 0) {
    $env:MARKETS = ($config.markets -join ",")
}
if ($config.cases -and $config.cases.Count -gt 0) {
    $env:CASES = ($config.cases -join ",")
}

$specs = @()
if ($config.specs -and $config.specs.Count -gt 0) {
    $specs = $config.specs
}

$projectName = "stage"

$argsList = @()
$argsList += $specs
$argsList += "--project=$projectName"

# ✅ Carpeta de reporte única por corrida — nunca se sobrescribe la anterior,
# así se puede guardar/compartir el historial de reportes con el equipo.
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$env:REPORT_DIR = "playwright-report/$projectName-$timestamp"

Write-Host "Entorno: $projectName"
Write-Host "MARKETS=$($env:MARKETS)"
Write-Host "CASES=$($env:CASES)"
Write-Host "Comando: npx playwright test $($argsList -join ' ')"
Write-Host "Reporte: $($env:REPORT_DIR)"

$ErrorActionPreference = "Continue"
npx playwright test @argsList
$testExitCode = $LASTEXITCODE
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "Reporte guardado en: $($env:REPORT_DIR)"
Write-Host "Para verlo: npx playwright show-report `"$($env:REPORT_DIR)`""

exit $testExitCode
