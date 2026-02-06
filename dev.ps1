# OpenClaw Web - 开发助手 (PowerShell)
# 编码: UTF-8 with BOM

function Show-Menu {
    Clear-Host
    Write-Host "========================================"  -ForegroundColor Cyan
    Write-Host "  OpenClaw Web - 开发助手"  -ForegroundColor Cyan
    Write-Host "========================================"  -ForegroundColor Cyan
    Write-Host ""
    Write-Host "[1] 启动所有服务（前端 + 后端）" -ForegroundColor White
    Write-Host "[2] 仅启动后端服务" -ForegroundColor White
    Write-Host "[3] 仅启动前端服务" -ForegroundColor White
    Write-Host "[4] 停止所有服务" -ForegroundColor White
    Write-Host "[5] 安装/更新依赖" -ForegroundColor White
    Write-Host "[6] 清理缓存" -ForegroundColor White
    Write-Host "[7] 查看服务状态" -ForegroundColor White
    Write-Host "[0] 退出" -ForegroundColor White
    Write-Host ""
    Write-Host "========================================"  -ForegroundColor Cyan
}

function Start-AllServices {
    Clear-Host
    Write-Host "[启动] 启动所有服务..." -ForegroundColor Green

    $backendScript = {
        Set-Location (Split-Path $PSScriptRoot -Parent)
        Set-Location backend
        & .\venv\Scripts\Activate.ps1
        uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    }

    Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript.ToString() -WindowStyle Normal
    Start-Sleep -Seconds 2

    $frontendScript = {
        Set-Location (Split-Path $PSScriptRoot -Parent)
        Set-Location frontend
        npm run dev
    }

    Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript.ToString() -WindowStyle Normal
    Write-Host "[完成] 服务已启动" -ForegroundColor Green
    Pause
}

function Start-Backend {
    Clear-Host
    Write-Host "[启动] 启动后端服务..." -ForegroundColor Green

    $backendScript = {
        Set-Location (Split-Path $PSScriptRoot -Parent)
        Set-Location backend
        & .\venv\Scripts\Activate.ps1
        uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    }

    Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript.ToString() -WindowStyle Normal
    Write-Host "[完成] 后端服务已启动" -ForegroundColor Green
    Pause
}

function Start-Frontend {
    Clear-Host
    Write-Host "[启动] 启动前端服务..." -ForegroundColor Green

    $frontendScript = {
        Set-Location (Split-Path $PSScriptRoot -Parent)
        Set-Location frontend
        npm run dev
    }

    Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript.ToString() -WindowStyle Normal
    Write-Host "[完成] 前端服务已启动" -ForegroundColor Green
    Pause
}

function Stop-AllServices {
    Clear-Host
    Write-Host "[停止] 正在停止后端服务..." -ForegroundColor Yellow
    Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "[停止] 正在停止前端服务..." -ForegroundColor Yellow
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "[完成] 所有服务已停止" -ForegroundColor Green
    Pause
}

function Install-Dependencies {
    Clear-Host
    Write-Host "[安装] 后端依赖..." -ForegroundColor Yellow
    Set-Location backend

    if (-not (Test-Path "venv")) {
        python -m venv venv
    }

    & .\venv\Scripts\Activate.ps1
    pip install -r requirements.txt

    Set-Location ..

    Write-Host ""
    Write-Host "[安装] 前端依赖..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..

    Write-Host "[完成] 依赖安装完成" -ForegroundColor Green
    Pause
}

function Clean-Cache {
    Clear-Host
    Write-Host "[清理] 清理前端缓存..." -ForegroundColor Yellow
    Set-Location frontend

    if (Test-Path "node_modules\.vite") {
        Remove-Item -Path "node_modules\.vite" -Recurse -Force
    }

    if (Test-Path "dist") {
        Remove-Item -Path "dist" -Recurse -Force
    }

    Set-Location ..
    Write-Host "[清理] 清理完成" -ForegroundColor Green
    Pause
}

function Check-Status {
    Clear-Host
    Write-Host "========================================"  -ForegroundColor Cyan
    Write-Host "  服务状态检查"  -ForegroundColor Cyan
    Write-Host "========================================"  -ForegroundColor Cyan
    Write-Host ""

    Write-Host "[后端服务] Python 进程:" -ForegroundColor Yellow
    $pythonProcesses = Get-Process python -ErrorAction SilentlyContinue
    if ($pythonProcesses) {
        $pythonProcesses | ForEach-Object { Write-Host "     PID $($_.Id) - 运行中" -ForegroundColor Green }
    } else {
        Write-Host "     未运行" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "[前端服务] Node 进程:" -ForegroundColor Yellow
    $nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        $nodeProcesses | ForEach-Object { Write-Host "     PID $($_.Id) - 运行中" -ForegroundColor Green }
    } else {
        Write-Host "     未运行" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "[端口检查] 端口占用情况:" -ForegroundColor Yellow

    $port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
    if ($port8000) {
        Write-Host "     8000 (后端) - 已占用" -ForegroundColor Green
    } else {
        Write-Host "     8000 (后端) - 空闲" -ForegroundColor Cyan
    }

    $port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
    if ($port5173) {
        Write-Host "     5173 (前端) - 已占用" -ForegroundColor Green
    } else {
        Write-Host "     5173 (前端) - 空闲" -ForegroundColor Cyan
    }

    Write-Host ""
    Pause
}

# 主循环
while ($true) {
    Show-Menu
    $choice = Read-Host "请选择操作 (0-7)"

    switch ($choice) {
        '1' { Start-AllServices }
        '2' { Start-Backend }
        '3' { Start-Frontend }
        '4' { Stop-AllServices }
        '5' { Install-Dependencies }
        '6' { Clean-Cache }
        '7' { Check-Status }
        '0' {
            Clear-Host
            Write-Host "再见！" -ForegroundColor Green
            Start-Sleep -Seconds 1
            exit
        }
        default {
            Write-Host ""
            Write-Host "[错误] 无效选择，请重试" -ForegroundColor Red
            Start-Sleep -Seconds 1
        }
    }
}
