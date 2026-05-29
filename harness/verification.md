# Bohumcc Verification

Use the strongest command available for the current stage.

## Stage Commands

- Harness only: `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1`
- Backend: `php artisan test`
- Frontend build on Windows: `npm.cmd run build`
- Frontend build on macOS/Linux/WSL: `npm run build`
- UI on Windows: `npx.cmd playwright test`
- UI on macOS/Linux/WSL: `npx playwright test`
- Full project: `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1`

## Completion Rule

Do not call a task complete until the relevant verification command has passed or the blocker has been clearly reported.

On Windows, run the full verifier through:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify.ps1
```

The PowerShell verifier adds Laravel Herd's user bin path when present and prefers `npm.cmd` / `npx.cmd` to avoid PowerShell script execution-policy failures.

On macOS/Linux/WSL, run:

```bash
bash scripts/verify.sh
```

## Manual Checks

For UI tasks, verify:

- desktop viewport
- mobile viewport
- navigation dropdowns
- form validation states
- Korean text wrapping
- no admin insurance product management entry
- consistency with `DESIGN.MD`
- no emoji usage in UI
