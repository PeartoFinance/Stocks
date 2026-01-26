# Start StockAnalysis Pro
# Run this script to start both backend and frontend servers

Write-Host "🚀 Starting StockAnalysis Pro..." -ForegroundColor Green

# Check if we're in the correct directory
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "❌ Please run this script from the Stock directory" -ForegroundColor Red
    exit 1
}

# Start Backend
Write-Host "🐍 Starting Flask backend..." -ForegroundColor Yellow
Set-Location backend

# Check if virtual environment exists
if (-not (Test-Path "venv\Scripts\Activate.ps1")) {
    Write-Host "❌ Virtual environment not found. Please run setup.ps1 first." -ForegroundColor Red
    exit 1
}

# Start backend in new window
$backendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; .\venv\Scripts\Activate.ps1; python app.py" -PassThru
Write-Host "✅ Backend started (PID: $($backendProcess.Id))" -ForegroundColor Green

# Start Frontend
Set-Location ..\frontend
Write-Host "⚛️ Starting React frontend..." -ForegroundColor Yellow

# Wait for backend to start
Start-Sleep -Seconds 3

# Start frontend
Write-Host ""
Write-Host "🎉 Starting application..." -ForegroundColor Green
Write-Host "🔗 Backend: https://api.pearto.com/api" -ForegroundColor Cyan
Write-Host "🔗 Frontend: https://test.pearto.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the frontend server" -ForegroundColor Yellow
Write-Host "The backend will continue running in a separate window" -ForegroundColor Yellow

npm start