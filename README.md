# Bohumcc

Full-custom Korean insurance agency platform with a customer site, admin CMS, consultation intake, insurance Q&A, point ledger, and self-built point mall.

## Key Product Decisions

- Point mall is self-built.
- Admin CMS does not include insurance product management.
- Insurance product, service guide, insurance checkup, and company intro pages are image-backed project-file content.
- Main page references `배너+폼_예시` for the banner and form direction.
- `DESIGN.MD` is the visual design source of truth.
- Event point amounts are editable from admin event management.

## Local Requirements

- PHP 8.4 through Laravel Herd
- Composer 2.9+
- Node.js and npm
- PostgreSQL and Redis for app runtime development

Tests use in-memory SQLite through `phpunit.xml`, so the full test suite does not require a running PostgreSQL server.

## Local Setup

```powershell
composer install
npm install
copy .env.example .env
php artisan key:generate
php artisan migrate
npm.cmd run build
php artisan test
```

If PowerShell cannot find `php` or `composer`, open Laravel Herd once and confirm the Herd user bin path is available:

```powershell
php --version
composer --version
```

## Verification

Use the project verifier on Windows:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify.ps1
```

The verifier adds Laravel Herd's user bin path when present and prefers `npm.cmd` / `npx.cmd` to avoid PowerShell execution-policy issues.

On macOS/Linux/WSL:

```bash
bash scripts/verify.sh
```

## Agentic Workflow

Plans live in `docs/superpowers/plans`.

Agent prompts live in `docs/superpowers/agents`.

Start from the master plan:

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

## Current Harness Status

- Laravel 12 + React/Inertia scaffold is installed.
- Breeze auth/profile baseline is installed.
- Windows verifier passes.
- Playwright is not configured yet and is skipped by the verifier.

