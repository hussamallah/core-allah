# One-liner cleanup script for quiz project
# Removes cache files and rebuilds dependencies safely

Write-Host "🧹 Cleaning quiz project..." -ForegroundColor Green
Remove-Item -Recurse -Force .next, .turbo, .eslintcache, coverage, dist, out, node_modules, app\node_modules, core-engine\node_modules -ErrorAction SilentlyContinue
Get-ChildItem -Recurse -Include "*.log" | Remove-Item -Force -ErrorAction SilentlyContinue
Write-Host "📦 Rebuilding dependencies..." -ForegroundColor Cyan
pnpm install
Write-Host "✅ Cleanup complete! Run 'pnpm dev' to start development." -ForegroundColor Green

