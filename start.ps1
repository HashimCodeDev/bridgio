# Sign Language Translator - Windows Startup Script
# Run this with: powershell -ExecutionPolicy Bypass -File start.ps1

Write-Host "╔═══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🤟 Sign Language Translator Startup     ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Check if required commands exist
try {
    Get-Command pnpm -ErrorAction Stop | Out-Null
} catch {
    Write-Host "Error: pnpm is not installed. Install with: npm install -g pnpm" -ForegroundColor Red
    exit 1
}

try {
    Get-Command python -ErrorAction Stop | Out-Null
} catch {
    Write-Host "Error: python is not installed" -ForegroundColor Red
    exit 1
}

# 1. Start ML Server
Write-Host "[1/3] Starting ML Server (Python)..." -ForegroundColor Green
Set-Location "$ScriptDir\ML"

if (Test-Path "model.pt") {
    if (Get-Command uv -ErrorAction SilentlyContinue) {
        Write-Host "Using uv to run ML server..."
        Start-Process -NoNewWindow -FilePath "uv" -ArgumentList "run", "python", "app.py"
    } else {
        Write-Host "Using python to run ML server..."
        Start-Process -NoNewWindow -FilePath "python" -ArgumentList "app.py"
    }
    Write-Host "ML Server started" -ForegroundColor Green
} else {
    Write-Host "Warning: model.pt not found. ML server may not work correctly." -ForegroundColor Yellow
}

Start-Sleep -Seconds 3

# 2. Start Backend
Write-Host ""
Write-Host "[2/3] Starting Backend (Node.js)..." -ForegroundColor Green
Set-Location "$ScriptDir\backend"

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing backend dependencies..."
    pnpm install
}

Start-Process -NoNewWindow -FilePath "pnpm" -ArgumentList "dev"
Write-Host "Backend started" -ForegroundColor Green

Start-Sleep -Seconds 2

# 3. Start Frontend
Write-Host ""
Write-Host "[3/3] Starting Frontend (React)..." -ForegroundColor Green
Set-Location "$ScriptDir\frontend"

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..."
    pnpm install
}

Start-Process -NoNewWindow -FilePath "pnpm" -ArgumentList "dev"
Write-Host "Frontend started" -ForegroundColor Green

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "╔═══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  ✅ All Services Started Successfully!    ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services running:" -ForegroundColor Green
Write-Host "  🤖 ML Server:   http://localhost:8000"
Write-Host "  🔌 Backend:     http://localhost:3000"
Write-Host "  🌐 Frontend:    http://localhost:5173"
Write-Host ""
Write-Host "Open your browser to: " -NoNewline
Write-Host "http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C in each window to stop services" -ForegroundColor Yellow
