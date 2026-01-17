# Quick Setup Script for StockAnalysis Pro
# Run this script from the Stock directory

Write-Host "🚀 Setting up StockAnalysis Pro..." -ForegroundColor Green

# Check if we're in the correct directory
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "❌ Please run this script from the Stock directory that contains 'backend' and 'frontend' folders" -ForegroundColor Red
    exit 1
}

# Setup Backend
Write-Host "🐍 Setting up Python backend..." -ForegroundColor Yellow
Set-Location backend

# Create virtual environment if it doesn't exist
if (-not (Test-Path "venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Cyan
    python -m venv venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
& ".\venv\Scripts\Activate.ps1"

# Install dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Cyan
pip install -r requirements.txt

# Start backend in new window
Write-Host "Starting Flask backend server..." -ForegroundColor Green
$backendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; .\venv\Scripts\Activate.ps1; python app.py" -PassThru

# Setup Frontend
Set-Location ..\frontend
Write-Host "⚛️ Setting up React frontend..." -ForegroundColor Yellow

# Install Node.js dependencies
Write-Host "Installing Node.js dependencies..." -ForegroundColor Cyan
npm install

# Wait a moment for backend to start
Write-Host "⏳ Waiting for backend to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Start frontend
Write-Host "🌐 Starting React development server..." -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host "✅ Backend running on https://api.pearto.com/api" -ForegroundColor Cyan
Write-Host "✅ Frontend will start on http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 Check the README.md for more information" -ForegroundColor Yellow

# Start frontend (this will open browser automatically)
npm start