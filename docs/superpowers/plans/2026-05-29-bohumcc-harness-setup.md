# Bohumcc Harness Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the project repository baseline, Laravel/Inertia application skeleton, local harness rules, verification scripts, and agent workflow scaffolding for the Bohumcc insurance agency platform.

**Architecture:** This task creates the foundation only. The application will be a single Laravel 12 app with React/Inertia, PostgreSQL, Redis, and a project-local harness for agentic development and verification. Business features are not implemented in this plan.

**Tech Stack:** Git, Laravel 12, React, Inertia, PostgreSQL, Redis, Pest/PHPUnit, Playwright, PowerShell/Bash verification scripts.

---

## Files And Responsibilities

- `.gitignore`: Ignore framework build outputs, dependency folders, environment files, and local Superpowers brainstorm files.
- `.editorconfig`: Shared editor formatting defaults.
- `README.md`: Project overview, setup commands, and verification workflow.
- `composer.json`: Laravel PHP dependencies, created by Laravel installer or Composer.
- `package.json`: Frontend dependencies and scripts, created by Laravel starter kit.
- `.env.example`: Local environment template.
- `app/`, `bootstrap/`, `config/`, `database/`, `public/`, `resources/`, `routes/`, `tests/`: Laravel app skeleton.
- `docs/superpowers/plans/2026-05-29-bohumcc-master-plan.md`: Existing master plan; do not overwrite it.
- `docs/superpowers/agents/*.md`: Existing agent prompts; do not overwrite unless fixing obvious setup references.
- `harness/project-rules.md`: Existing project rules; preserve the "no admin insurance product management" rule.
- `harness/verification.md`: Existing verification rules; update only if commands change.
- `scripts/verify.ps1`: Windows verification entry point.
- `scripts/verify.sh`: Unix-like verification entry point.
- `tests/Feature/HarnessVerificationTest.php`: Minimal passing backend test proving the app boots.

## Preconditions

- Work from `C:\project\bohumcc`.
- The folder currently contains planning/harness files and `배너+폼_예시`.
- Do not delete or overwrite `배너+폼_예시`.
- Do not implement customer-facing business features in this plan.
- If Composer, PHP, Node, or internet access is unavailable, report `BLOCKED` with the exact missing tool or failed command.

## Task 1: Initialize Git And Local Ignore Rules

**Files:**
- Create/modify: `.gitignore`
- Create/modify: `.editorconfig`

- [ ] **Step 1: Check repository state**

Run:

```powershell
git status --short
```

Expected:

- If this is not a git repository, the command fails with `fatal: not a git repository`.
- If a repository already exists, inspect the output and preserve all existing files.

- [ ] **Step 2: Initialize git only if needed**

Run only if Step 1 reported no repository:

```powershell
git init
```

Expected:

- Git creates a new repository in `C:\project\bohumcc`.

- [ ] **Step 3: Add or update `.gitignore`**

Create or update `.gitignore` with these entries. Preserve any existing custom entries if the file already exists.

```gitignore
/vendor/
/node_modules/
/public/build/
/public/hot
/storage/*.key
/.env
/.env.*
!/.env.example
/.phpunit.cache/
/coverage/
/tests/.playwright/
/playwright-report/
/test-results/
/.superpowers/
/.idea/
/.vscode/
*.log
*.tmp
Thumbs.db
```

- [ ] **Step 4: Add `.editorconfig`**

Create `.editorconfig`:

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 4
trim_trailing_whitespace = true

[*.{js,jsx,ts,tsx,json,css,scss,md,yml,y.yaml}]
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

- [ ] **Step 5: Verify files exist**

Run:

```powershell
Test-Path .gitignore; Test-Path .editorconfig
```

Expected:

```text
True
True
```

- [ ] **Step 6: Commit**

Run:

```powershell
git add .gitignore .editorconfig
git commit -m "chore: initialize repository defaults"
```

Expected:

- Commit succeeds if git user identity is configured.
- If git user identity is missing, report `NEEDS_CONTEXT` and ask what user.name/user.email should be used.

## Task 2: Create Laravel/Inertia Application Skeleton

**Files:**
- Create: Laravel project skeleton files and folders
- Modify: `.env.example`
- Test: `tests/Feature/HarnessVerificationTest.php`

- [ ] **Step 1: Check that Laravel app files do not already exist**

Run:

```powershell
Test-Path artisan; Test-Path composer.json; Test-Path package.json
```

Expected before this task:

```text
False
False
False
```

If any output is `True`, inspect the existing app and adapt without overwriting user work.

- [ ] **Step 2: Create Laravel project skeleton**

Preferred command:

```powershell
composer create-project laravel/laravel .
```

Expected:

- Laravel project files are created in the current directory.
- Existing `docs`, `harness`, `scripts`, and `배너+폼_예시` are preserved.

If Composer refuses because the directory is not empty, use a temporary sibling directory and copy the generated Laravel skeleton into the current project without overwriting existing planning files:

```powershell
composer create-project laravel/laravel ..\bohumcc-laravel-tmp
```

Then move only Laravel-generated files into `C:\project\bohumcc`, preserving existing files. Do not move `.git` from the temporary folder.

- [ ] **Step 3: Install React/Inertia starter dependencies**

Use Laravel Breeze for the first scaffold because this project needs a simple React/Inertia baseline before custom domain work begins. Run:

```powershell
composer require laravel/breeze --dev
php artisan breeze:install react
```

Expected:

- React/Inertia files are created under `resources/js`.
- Auth routes and views are generated.

If this command fails because Laravel 12 has removed or renamed the Breeze installer, stop and report `BLOCKED` with the exact command output. Do not choose a replacement installer without an explicit plan update.

- [ ] **Step 4: Install frontend dependencies**

Run:

```powershell
npm install
```

Expected:

- `node_modules` and lockfile are created.

- [ ] **Step 5: Configure `.env.example` for PostgreSQL and Redis**

Update `.env.example` so these keys exist with these values:

```dotenv
APP_NAME=Bohumcc
APP_LOCALE=ko
APP_FALLBACK_LOCALE=ko
APP_FAKER_LOCALE=ko_KR

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=bohumcc
DB_USERNAME=bohumcc
DB_PASSWORD=

CACHE_STORE=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=database

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

Preserve other Laravel-generated keys.

- [ ] **Step 6: Add harness boot test**

Create `tests/Feature/HarnessVerificationTest.php`:

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;

class HarnessVerificationTest extends TestCase
{
    public function test_application_homepage_responds_successfully(): void
    {
        $response = $this->get('/');

        $response->assertSuccessful();
    }
}
```

- [ ] **Step 7: Run backend test**

Run:

```powershell
php artisan test --filter=HarnessVerificationTest
```

Expected:

- Test passes.

- [ ] **Step 8: Run frontend build**

Run:

```powershell
npm run build
```

Expected:

- Build succeeds.

- [ ] **Step 9: Commit**

Run:

```powershell
git add .
git commit -m "chore: scaffold Laravel Inertia app"
```

Expected:

- Commit succeeds.

## Task 3: Harden Verification Scripts

**Files:**
- Modify: `scripts/verify.ps1`
- Modify: `scripts/verify.sh`
- Modify: `harness/verification.md`

- [ ] **Step 1: Update `scripts/verify.ps1`**

Ensure `scripts/verify.ps1` contains this final content:

```powershell
$ErrorActionPreference = "Stop"

function Run-IfExists {
    param(
        [string] $Description,
        [string] $Path,
        [scriptblock] $Command
    )

    if (Test-Path $Path) {
        Write-Host "==> $Description"
        & $Command
    } else {
        Write-Host "==> Skipping $Description; missing $Path"
    }
}

Run-IfExists "PHP dependency check" "composer.json" { composer validate --strict }
Run-IfExists "Laravel tests" "artisan" { php artisan test }
Run-IfExists "Frontend build" "package.json" { npm run build }

if ((Test-Path "playwright.config.ts") -or (Test-Path "playwright.config.js")) {
    Write-Host "==> Playwright tests"
    npx playwright test
} else {
    Write-Host "==> Skipping Playwright tests; missing playwright config"
}
```

- [ ] **Step 2: Update `scripts/verify.sh`**

Ensure `scripts/verify.sh` contains this final content:

```bash
#!/usr/bin/env bash
set -euo pipefail

run_if_exists() {
  local description="$1"
  local path="$2"
  shift 2

  if [[ -e "$path" ]]; then
    echo "==> $description"
    "$@"
  else
    echo "==> Skipping $description; missing $path"
  fi
}

run_if_exists "PHP dependency check" "composer.json" composer validate --strict
run_if_exists "Laravel tests" "artisan" php artisan test
run_if_exists "Frontend build" "package.json" npm run build

if [[ -e "playwright.config.ts" || -e "playwright.config.js" ]]; then
  echo "==> Playwright tests"
  npx playwright test
else
  echo "==> Skipping Playwright tests; missing playwright config"
fi
```

- [ ] **Step 3: Update verification docs**

Ensure `harness/verification.md` says the Windows command is:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify.ps1
```

Ensure the document also lists:

```bash
bash scripts/verify.sh
```

- [ ] **Step 4: Run verification**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify.ps1
```

Expected:

- Composer validation passes.
- Laravel tests pass.
- Frontend build passes.
- Playwright is skipped unless a config exists.

- [ ] **Step 5: Commit**

Run:

```powershell
git add scripts/verify.ps1 scripts/verify.sh harness/verification.md
git commit -m "chore: harden verification scripts"
```

Expected:

- Commit succeeds.

## Task 4: Add Project README And Harness Usage

**Files:**
- Create/modify: `README.md`
- Modify: `harness/project-rules.md`

- [ ] **Step 1: Create `README.md`**

Create or update `README.md`:

````markdown
# Bohumcc

Full-custom Korean insurance agency platform with customer site, admin CMS, consultation intake, insurance Q&A, point ledger, and self-built point mall.

## Key Product Decisions

- Point mall is self-built.
- Admin CMS does not include insurance product management.
- Insurance product/service/checkup/company intro pages are image-backed project-file content.
- Main page references `배너+폼_예시` for the banner and form direction.
- Event point amounts are editable from admin event management.

## Local Setup

```powershell
composer install
npm install
copy .env.example .env
php artisan key:generate
php artisan migrate
npm run build
php artisan test
```

## Verification

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify.ps1
```

## Agentic Workflow

Plans live in `docs/superpowers/plans`.

Agent prompts live in `docs/superpowers/agents`.

Use the master plan first:

```text
docs/superpowers/plans/2026-05-29-bohumcc-master-plan.md
```

Implementation should follow:

1. Implement one plan task.
2. Run the relevant verification command.
3. Run spec compliance review.
4. Run code quality review.
5. Run UI verification for UI-heavy tasks.
6. Commit only when the task is passing.
````

- [ ] **Step 2: Ensure `harness/project-rules.md` includes fixed exclusions**

Confirm this exact line exists:

```markdown
- Admin CMS excludes insurance product management.
```

Confirm this exact line exists:

```markdown
- Never update a member point balance without a ledger entry.
```

- [ ] **Step 3: Commit**

Run:

```powershell
git add README.md harness/project-rules.md
git commit -m "docs: document project harness workflow"
```

Expected:

- Commit succeeds.

## Task 5: Final Harness Verification

**Files:**
- Inspect all files changed in Tasks 1-4.

- [ ] **Step 1: Run full verification**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify.ps1
```

Expected:

- Composer validation passes.
- Laravel tests pass.
- Frontend build passes.
- Playwright is skipped unless configured.

- [ ] **Step 2: Inspect git status**

Run:

```powershell
git status --short
```

Expected:

- No uncommitted changes, or only intentionally uncommitted local environment files ignored by `.gitignore`.

- [ ] **Step 3: Report completion**

Return:

```text
DONE

- Summary: Repository, Laravel/Inertia skeleton, verification scripts, README, and harness rules are ready.
- Files changed: list the main files and directories.
- Tests run: include exact verification commands and results.
- Commit: list commit SHAs created during this plan.
- Self-review notes: confirm that admin insurance product management was not added.
```

## Self-Review Checklist

- [ ] The plan does not implement business features.
- [ ] The plan preserves `배너+폼_예시`.
- [ ] The plan keeps admin insurance product management excluded.
- [ ] The plan creates a runnable Laravel/Inertia baseline.
- [ ] The plan includes exact verification commands.
- [ ] The plan has no placeholder steps.
