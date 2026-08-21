# Diagnostico de Bet366 para Windows PowerShell.
#   .\diagnostico.ps1
# Dice en que estado esta tu copia y que rutas responden.

Write-Host ""
Write-Host "== Tu copia del codigo ==" -ForegroundColor Cyan
$commit = git log --oneline -1
Write-Host "  commit: $commit"

$demo = Test-Path ".\src\app\demo\page.tsx"
if ($demo) {
  Write-Host "  /demo en disco: SI" -ForegroundColor Green
} else {
  Write-Host "  /demo en disco: NO  <-- te falta traer los cambios" -ForegroundColor Red
  Write-Host "     Solucion:  git pull ; npm install" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "== Cambios sin traer del repositorio ==" -ForegroundColor Cyan
git fetch origin claude/betting-app-points-ziuuqw 2>&1 | Out-Null
$detras = git rev-list --count HEAD..origin/claude/betting-app-points-ziuuqw
if ($detras -eq "0") {
  Write-Host "  Estas al dia." -ForegroundColor Green
} else {
  Write-Host "  Te faltan $detras commits.  <-- ejecuta: git pull" -ForegroundColor Red
}

Write-Host ""
Write-Host "== Rutas (arranca antes el servidor en otra ventana) ==" -ForegroundColor Cyan
$puerto = if ($args[0]) { $args[0] } else { "4000" }
foreach ($ruta in "/demo", "/demo/mias", "/demo/ranking", "/demo/perfil", "/demo/avisos", "/estilos") {
  try {
    $r = Invoke-WebRequest -Uri "http://localhost:$puerto$ruta" -UseBasicParsing -TimeoutSec 10
    Write-Host ("  {0,-16} {1}" -f $ruta, $r.StatusCode) -ForegroundColor Green
  } catch {
    $codigo = $_.Exception.Response.StatusCode.value__
    if (-not $codigo) { $codigo = "sin respuesta" }
    Write-Host ("  {0,-16} {1}" -f $ruta, $codigo) -ForegroundColor Red
  }
}
Write-Host ""
