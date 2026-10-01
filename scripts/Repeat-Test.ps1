# Corre un test específico N veces seguidas, sin tener que recordar la
# sintaxis de -g/--repeat-each ni pelear con la ruta del proyecto (tiene un
# espacio, así que nunca se pasa una ruta de archivo como argumento).
#
# Uso:
#   scripts\Repeat-Test.ps1 -Pattern "CP-137" -Times 5
#   scripts\Repeat-Test.ps1 -Pattern "Orden Solo Suscripción - Germany" -Times 3 -ProjectName stage

param(
    [Parameter(Mandatory = $true)]
    [string]$Pattern,

    [int]$Times = 3,

    [string]$ProjectName = "stage"
)

Write-Host "Proyecto: $ProjectName"
Write-Host "Patrón: $Pattern"
Write-Host "Repeticiones: $Times"
Write-Host ""

npx playwright test --project=$ProjectName -g "$Pattern" --repeat-each=$Times
exit $LASTEXITCODE
