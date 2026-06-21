# Run this script from any machine with internet access
# to push the project to GitHub

$PROJECT_DIR = "C:\Users\ramna\Desktop\WORK\Web Dev Project\attandance-main\attandance-main"
$REPO_URL = "https://github.com/ramnath23112005/attandance.git"

# 1. Verify the repo exists
if (!(Test-Path "$PROJECT_DIR\.git")) {
    Write-Host "ERROR: Not a git repository at $PROJECT_DIR" -ForegroundColor Red
    exit 1
}

# 2. Set remote origin
Set-Location $PROJECT_DIR
git remote set-url origin $REPO_URL

# 3. Ensure we're on main branch
git branch -M main

# 4. Push
Write-Host "Pushing to $REPO_URL ..." -ForegroundColor Yellow
Write-Host "If prompted, use a GitHub Personal Access Token as password." -ForegroundColor Cyan
Write-Host "Create one at: https://github.com/settings/tokens" -ForegroundColor Cyan
Write-Host ""
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: Pushed to GitHub!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Alternative: Use a token directly:" -ForegroundColor Yellow
    Write-Host "  git remote set-url origin https://YOUR_TOKEN@github.com/ramnath23112005/attandance.git" -ForegroundColor Gray
    Write-Host "  git push -u origin main" -ForegroundColor Gray
}
