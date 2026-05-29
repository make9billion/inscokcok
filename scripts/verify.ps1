$ErrorActionPreference = "Stop"

function Run-IfExists {
    param(
        [string] $Description,
        [string] $Path,
        [string] $Command
    )

    if (Test-Path $Path) {
        Write-Host "==> $Description"
        Invoke-Expression $Command
    } else {
        Write-Host "==> Skipping $Description; missing $Path"
    }
}

Run-IfExists "PHP dependency check" "composer.json" "composer validate --strict"
Run-IfExists "Laravel tests" "artisan" "php artisan test"
Run-IfExists "Frontend build" "package.json" "npm run build"

if (Test-Path "playwright.config.ts") {
    Write-Host "==> Playwright tests"
    npx playwright test
} elseif (Test-Path "playwright.config.js") {
    Write-Host "==> Playwright tests"
    npx playwright test
} else {
    Write-Host "==> Skipping Playwright tests; missing playwright config"
}

