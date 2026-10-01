# Limpia los filtros MARKETS/CASES que pueden haber quedado seteados de una
# corrida manual anterior en esta misma sesión de PowerShell.
# Uso: scripts\Clear-Filters.ps1

$hadMarkets = Test-Path Env:\MARKETS
$hadCases = Test-Path Env:\CASES

if ($hadMarkets) {
    Write-Host "MARKETS estaba seteado a: $($env:MARKETS) -> limpiado"
} else {
    Write-Host "MARKETS no estaba seteado"
}

if ($hadCases) {
    Write-Host "CASES estaba seteado a: $($env:CASES) -> limpiado"
} else {
    Write-Host "CASES no estaba seteado"
}

Remove-Item Env:\MARKETS -ErrorAction SilentlyContinue
Remove-Item Env:\CASES -ErrorAction SilentlyContinue

Write-Host "Listo — la próxima corrida usará todos los mercados/casos sin filtrar."
