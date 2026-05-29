$ErrorActionPreference = "Stop"

function Add-HerdPath {
    $herdBin = Join-Path $env:USERPROFILE ".config\herd\bin"

    if ((Test-Path $herdBin) -and ($env:Path -notlike "*$herdBin*")) {
        $env:Path = "$env:Path;$herdBin"
    }
}

function Get-CommandName {
    param(
        [string[]] $Candidates
    )

    foreach ($candidate in $Candidates) {
        if (Get-Command $candidate -ErrorAction SilentlyContinue) {
            return $candidate
        }
    }

    throw "None of these commands are available: $($Candidates -join ', ')"
}

function Run-IfExists {
    param(
        [string] $Description,
        [string] $Path,
        [scriptblock] $Command
    )

    if (Test-Path $Path) {
        Write-Host "==> $Description"
        & $Command
        if ($LASTEXITCODE -ne 0) {
            throw "$Description failed with exit code $LASTEXITCODE"
        }
    } else {
        Write-Host "==> Skipping $Description; missing $Path"
    }
}

Add-HerdPath

$composer = Get-CommandName @("composer", "composer.bat")
$php = Get-CommandName @("php", "php.exe")
$npm = Get-CommandName @("npm.cmd", "npm")
$npx = Get-CommandName @("npx.cmd", "npx")

Run-IfExists "PHP dependency check" "composer.json" { & $composer validate --strict }
Run-IfExists "Laravel tests" "artisan" { & $php artisan test }
Run-IfExists "Frontend build" "package.json" { & $npm run build }

if (Test-Path "playwright.config.ts") {
    Write-Host "==> Playwright tests"
    & $npx playwright test
} elseif (Test-Path "playwright.config.js") {
    Write-Host "==> Playwright tests"
    & $npx playwright test
} else {
    Write-Host "==> Skipping Playwright tests; missing playwright config"
}
