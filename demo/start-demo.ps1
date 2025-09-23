# 🚀 One-Click SIH Demo Launcher

Write-Host "🎯 SIH 2025 - NAMASTE Terminology System Demo" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Green

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Navigate to Backend directory
if (Test-Path "Backend") {
    Set-Location Backend
    Write-Host "📁 Changed to Backend directory" -ForegroundColor Yellow
} else {
    Write-Host "❌ Backend directory not found. Please run from project root." -ForegroundColor Red
    exit 1
}

# Check if terminology service exists
if (Test-Path "launch-terminology.js") {
    Write-Host "✅ Terminology service found" -ForegroundColor Green
} else {
    Write-Host "❌ launch-terminology.js not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🏥 Starting NAMASTE Terminology Service..." -ForegroundColor Cyan
Write-Host "   Port: 3001" -ForegroundColor White
Write-Host "   FHIR Compliance: R4" -ForegroundColor White
Write-Host "   Standards: India EHR 2016" -ForegroundColor White
Write-Host ""

# Start the service
Write-Host "⚡ Launching service (Press Ctrl+C to stop)..." -ForegroundColor Yellow
Write-Host ""

try {
    node launch-terminology.js
} catch {
    Write-Host "❌ Failed to start service" -ForegroundColor Red
    exit 1
}