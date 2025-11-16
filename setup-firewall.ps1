# JeevSarthi Firewall Setup Script
# Run this script as Administrator

Write-Host "🔥 Setting up Firewall Rules for JeevSarthi..." -ForegroundColor Yellow

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Remove existing rules if they exist
Write-Host "`n🧹 Cleaning up existing rules..." -ForegroundColor Cyan
Remove-NetFirewallRule -DisplayName "JeevSarthi - Vite Dev Server" -ErrorAction SilentlyContinue
Remove-NetFirewallRule -DisplayName "JeevSarthi - Node Server" -ErrorAction SilentlyContinue

# Add firewall rule for Vite (port 3000)
Write-Host "✅ Adding rule for Vite Dev Server (port 3000)..." -ForegroundColor Green
New-NetFirewallRule -DisplayName "JeevSarthi - Vite Dev Server" `
    -Direction Inbound `
    -LocalPort 3000 `
    -Protocol TCP `
    -Action Allow `
    -Profile Private, Domain `
    -Description "Allow Vite dev server for JeevSarthi frontend" | Out-Null

# Add firewall rule for Node.js (port 5000)
Write-Host "✅ Adding rule for Node.js Server (port 5000)..." -ForegroundColor Green
New-NetFirewallRule -DisplayName "JeevSarthi - Node Server" `
    -Direction Inbound `
    -LocalPort 5000 `
    -Protocol TCP `
    -Action Allow `
    -Profile Private, Domain `
    -Description "Allow Node.js server for JeevSarthi backend" | Out-Null

Write-Host "`n✅ Firewall rules added successfully!" -ForegroundColor Green
Write-Host "`n📱 Your servers should now be accessible from mobile devices on the same network." -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Find your network IP: ipconfig" -ForegroundColor White
Write-Host "2. Update .env files with your IP address" -ForegroundColor White
Write-Host "3. Restart both servers" -ForegroundColor White

