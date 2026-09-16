$ErrorActionPreference = "Stop"

$configPath = Join-Path $PSScriptRoot "run-config-live-puerto2.json"
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

$projectName = "live-port-2"

$argsList = @()
$argsList += $specs
$argsList += "--project=$projectName"

Write-Host "Entorno: $projectName"
Write-Host "MARKETS=$($env:MARKETS)"
Write-Host "CASES=$($env:CASES)"
Write-Host "Comando: npx playwright test $($argsList -join ' ')"

# ⚠️ npx (y Node) pueden escribir warnings inofensivos a stderr (ej. "NO_COLOR
# ignored due to FORCE_COLOR"). Con $ErrorActionPreference = "Stop" a nivel de
# script, PowerShell 5.1 convierte CUALQUIER línea de stderr de un comando
# nativo en un error que aborta el script antes de reportar el resultado real
# de los tests. Se relaja a "Continue" solo para esta llamada y se valida el
# resultado real con $LASTEXITCODE.
$ErrorActionPreference = "Continue"
npx playwright test @argsList
$testExitCode = $LASTEXITCODE
$ErrorActionPreference = "Stop"

exit $testExitCode
