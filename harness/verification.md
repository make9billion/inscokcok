# Bohumcc Verification

Use the strongest command available for the current stage.

## Stage Commands

- Harness only: `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1`
- Backend: `php artisan test`
- Frontend build: `npm run build`
- UI: `npx playwright test`
- Full project: `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1`

## Completion Rule

Do not call a task complete until the relevant verification command has passed or the blocker has been clearly reported.

## Manual Checks

For UI tasks, verify:

- desktop viewport
- mobile viewport
- navigation dropdowns
- form validation states
- Korean text wrapping
- no admin insurance product management entry
