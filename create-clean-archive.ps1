# PowerShell script to create a clean quiz canon archive
Write-Host "Creating clean quiz canon archive..." -ForegroundColor Green

# Create temporary directory for clean archive
$tempDir = "quiz-canon-temp"
$archiveName = "quiz-canon-$(Get-Date -Format 'yyyy-MM-dd').zip"

# Remove temp directory if it exists
if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}

# Create temp directory
New-Item -ItemType Directory -Path $tempDir | Out-Null

Write-Host "Copying essential files..." -ForegroundColor Yellow

# Copy essential directories and files
$essentialItems = @(
    "app/src",
    "app/package.json",
    "app/next.config.js",
    "app/tailwind.config.js",
    "app/tsconfig.json",
    "app/postcss.config.js",
    "core-engine/src",
    "core-engine/package.json",
    "core-engine/tsconfig.json",
    "sif-system",
    "archetype_core_questions_vgood.json",
    "questions_template.json",
    "phase d questions.txt",
    "pahse c quesitons.txt",
    "questions pahse a and b text.txt",
    "severt f quesitons.txt",
    "pnpm-workspace.yaml",
    "package.json",
    "tsconfig.json",
    "README.md",
    "vercel.json"
)

foreach ($item in $essentialItems) {
    if (Test-Path $item) {
        if ((Get-Item $item) -is [System.IO.DirectoryInfo]) {
            Copy-Item -Path $item -Destination $tempDir -Recurse
            Write-Host "  [OK] $item" -ForegroundColor Green
        } else {
            Copy-Item -Path $item -Destination $tempDir
            Write-Host "  [OK] $item" -ForegroundColor Green
        }
    } else {
        Write-Host "  [MISSING] $item" -ForegroundColor Red
    }
}

# Copy only essential image (core-1.png)
if (Test-Path "core-1.png") {
    Copy-Item -Path "core-1.png" -Destination $tempDir
    Write-Host "  [OK] core-1.png" -ForegroundColor Green
}

Write-Host ""
Write-Host "Calculating archive size..." -ForegroundColor Yellow

# Calculate size of clean archive
$cleanSize = (Get-ChildItem -Path $tempDir -Recurse -File | Measure-Object -Property Length -Sum).Sum
$cleanSizeMB = [math]::Round($cleanSize / 1MB, 2)

Write-Host "Clean archive size: $cleanSizeMB MB" -ForegroundColor Cyan

# Create the zip archive
Write-Host ""
Write-Host "Creating zip archive: $archiveName" -ForegroundColor Yellow
Compress-Archive -Path "$tempDir\*" -DestinationPath $archiveName -Force

# Get final archive size
$archiveSize = (Get-Item $archiveName).Length
$archiveSizeMB = [math]::Round($archiveSize / 1MB, 2)

Write-Host ""
Write-Host "Archive created successfully!" -ForegroundColor Green
Write-Host "Archive: $archiveName" -ForegroundColor White
Write-Host "Size: $archiveSizeMB MB" -ForegroundColor White
Write-Host ""
Write-Host "This is your clean quiz canon - no bloat, just the essentials!" -ForegroundColor Cyan

# Clean up temp directory
Remove-Item -Recurse -Force $tempDir

Write-Host ""
Write-Host "To restore this canon:" -ForegroundColor Yellow
Write-Host "1. Extract the zip" -ForegroundColor White
Write-Host "2. Run: pnpm install" -ForegroundColor White
Write-Host "3. Run: pnpm dev" -ForegroundColor White
