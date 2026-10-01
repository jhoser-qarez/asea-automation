# Comandos más usados

Referencia rápida para correr el suite desde PowerShell. El proyecto vive en
una ruta con espacio (`C:\ProyectoASEA - NUXT3`), por eso varios comandos
evitan pasar rutas de archivo directamente y usan `-g` (grep por nombre de
test) en su lugar.

## ⚠️ Antes de correr algo: revisar filtros activos

`MARKETS` y `CASES` son variables de entorno que, una vez seteadas en una
sesión de PowerShell, **quedan activas para todos los comandos siguientes**
hasta que se limpien explícitamente o se cierre la terminal — incluso si
corrés un comando distinto sin mencionar mercados. Esto ya causó confusión
real (una corrida "sin filtro" que en realidad seguía acotada a 3 mercados
de una prueba anterior, y otra donde solo un caso de pago aparecía de
docenas esperadas).

Ver qué queda seteado:

```powershell
Get-ChildItem Env: | Where-Object Name -match 'MARKETS|CASES'
```

Limpiar ambos:

```powershell
Remove-Item Env:\MARKETS -ErrorAction SilentlyContinue
Remove-Item Env:\CASES -ErrorAction SilentlyContinue
```

(o usar `scripts/Clear-Filters.ps1`, ver más abajo)

Nota: los scripts `ScriptRun-*.ps1` ya limpian y re-setean estas variables
según su `run-config-*.json` en cada corrida — el problema aparece solo
cuando se corre `npx playwright test` directo en la misma terminal.

## Correr todo el suite

```powershell
npx playwright test --project=stage
```

Otros projects disponibles: `live`, `live-port-1`, `live-port-2`.

## Correr por mercado

```powershell
$env:MARKETS = "Germany"
npx playwright test --project=stage
```

Varios mercados a la vez, separados por coma:

```powershell
$env:MARKETS = "Germany,Spain,United Kingdom"
```

No olvidar limpiarlo después (ver arriba) si la siguiente corrida no debe
quedar acotada.

## Correr un solo spec

Evitar pasar la ruta del archivo como argumento posicional (falla por el
espacio en la ruta del proyecto). Usar `-g` con un fragmento único del
nombre del describe/test en su lugar:

```powershell
npx playwright test --project=stage -g "Orden Solo Suscripción con Dist Logueado - Germany"
```

## Correr un test específico varias veces seguidas

```powershell
npx playwright test --project=stage -g "CP-137" --repeat-each=5
```

`-g` matchea el ID del caso (`CP-xxx`) o cualquier fragmento único del
título del test. `--repeat-each=N` lo repite N veces seguidas, útil para
confirmar si una falla es flaky o consistente.

O con el script (ver más abajo):

```powershell
scripts\Repeat-Test.ps1 -Pattern "CP-137" -Times 5
```

## Solo listar tests que matchean (sin ejecutar)

Útil para verificar que un filtro (`-g`, `MARKETS`, `CASES`) selecciona lo
que se espera antes de correr de verdad:

```powershell
npx playwright test --project=stage -g "Brand Partner" --list
```

## Ver el último reporte HTML

```powershell
npx playwright show-report
```

(o la carpeta específica que imprime cada corrida al final, ej.
`npx playwright show-report "playwright-report/run-..."`)

## Scripts de ayuda en esta carpeta

- `Clear-Filters.ps1` — limpia `MARKETS`/`CASES` y muestra qué quedaba
  seteado antes de limpiar.
- `Repeat-Test.ps1 -Pattern "<texto>" -Times <N>` — corre un test específico
  N veces (equivalente al comando manual de arriba, sin tener que
  recordar la sintaxis exacta).
- `ScriptRun-Stage.ps1` / `ScriptRun-Live.ps1` / `ScriptRun-LivePuerto1.ps1` /
  `ScriptRun-LivePuerto2.ps1` — corridas configuradas vía
  `run-config-*.json` (specs/mercados/casos fijos, ya limpian filtros antes
  de setear los suyos).
