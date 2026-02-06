# OpenClaw Web - 一键启动服务 (PowerShell)
# 编码: UTF-8 with BOM

Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "  OpenClaw Web - 一键启动服务"  -ForegroundColor Cyan
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host ""

# 检查后端文件
if (-not (Test-Path "backend\app\main.py")) {
    Write-Host "[错误] 后端文件不存在，请检查项目结构" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}

# 检查前端文件
if (-not (Test-Path "frontend\package.json")) {
    Write-Host "[错误] 前端文件不存在，请检查项目结构" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}

# 检查 Python
Write-Host "[1/3] 检查环境依赖..." -ForegroundColor Yellow
$pythonExists = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonExists) {
    Write-Host "[错误] 未找到 Python，请先安装 Python 3.11+" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}

# 检查 Node.js
$nodeExists = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeExists) {
    Write-Host "[错误] 未找到 Node.js，请先安装 Node.js 18+" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}

Write-Host "[√] Python 和 Node.js 已安装" -ForegroundColor Green
Write-Host ""

# 检查后端依赖
Write-Host "[2/3] 检查后端依赖..." -ForegroundColor Yellow
Set-Location backend

if (-not (Test-Path "venv")) {
    Write-Host "[提示] 未找到虚拟环境，创建中..." -ForegroundColor Cyan
    python -m venv venv
}

# 检查 fastapi 是否安装
& .\venv\Scripts\Activate.ps1
$fastapiInstalled = pip show fastapi 2>$null
if (-not $fastapiInstalled) {
    Write-Host "[提示] 安装后端依赖..." -ForegroundColor Cyan
    pip install -r requirements.txt
} else {
    Write-Host "[√] 后端依赖已安装" -ForegroundColor Green
}

Set-Location ..

# 检查前端依赖
Write-Host ""
Write-Host "[3/3] 检查前端依赖..." -ForegroundColor Yellow
Set-Location frontend

if (-not (Test-Path "node_modules")) {
    Write-Host "[提示] 安装前端依赖..." -ForegroundColor Cyan
    npm install
} else {
    Write-Host "[√] 前端依赖已安装" -ForegroundColor Green
}

Set-Location ..

Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "  准备启动服务..."  -ForegroundColor Cyan
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host ""
Write-Host "后端服务: http://localhost:8000" -ForegroundColor White
Write-Host "前端服务: http://localhost:5173" -ForegroundColor White
Write-Host "API 文档: http://localhost:8000/api/docs" -ForegroundColor White
Write-Host ""
Read-Host "按回车键启动服务（Ctrl+C 可停止服务）"

Write-Host ""
Write-Host "[启动] 正在启动后端服务..." -ForegroundColor Green

$backendScript = {
    Set-Location (Split-Path $PSScriptRoot -Parent)
    Set-Location backend
    & .\venv\Scripts\Activate.ps1
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript.ToString() -WindowStyle Normal

Write-Host "[启动] 正在启动前端服务..." -ForegroundColor Green

$frontendScript = {
    Set-Location (Split-Path $PSScriptRoot -Parent)
    Set-Location frontend
    npm run dev
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript.ToString() -WindowStyle Normal

Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "  服务已启动！"  -ForegroundColor Green
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host ""
Write-Host "后端服务运行在: http://localhost:8000" -ForegroundColor White
Write-Host "前端服务运行在: http://localhost:5173" -ForegroundColor White
Write-Host "API 文档地址: http://localhost:8000/api/docs" -ForegroundColor White
Write-Host ""
Write-Host "关闭此窗口不会停止服务" -ForegroundColor Yellow
Write-Host "请分别关闭服务窗口来停止服务" -ForegroundColor Yellow
Write-Host ""

Start-Sleep -Seconds 3
