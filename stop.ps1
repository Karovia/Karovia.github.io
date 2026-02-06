# OpenClaw Web - 停止服务 (PowerShell)
# 编码: UTF-8 with BOM

Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "  OpenClaw Web - 停止服务"  -ForegroundColor Cyan
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host ""

Write-Host "[停止] 正在停止后端服务 (uvicorn)..." -ForegroundColor Yellow
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "[停止] 正在停止前端服务 (node/vite)..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host ""
Write-Host "========================================"  -ForegroundColor Green
Write-Host "  服务已停止"  -ForegroundColor Green
Write-Host "========================================"  -ForegroundColor Green
Write-Host ""

Start-Sleep -Seconds 2
