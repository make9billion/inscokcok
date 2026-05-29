# Bohumcc Project Rules

## Scope

This project builds a full-custom insurance agency website, admin CMS, and point mall.

## Fixed Decisions

- Point mall is self-built.
- Admin CMS excludes insurance product management.
- Insurance product/service/checkup/company intro pages are image-backed content pages.
- Event point amounts are editable in admin event management.
- Consultation receipt rolling data on the main page is fake display data.
- `DESIGN.MD` is the visual source of truth.

## Roles

- Full admin: all CMS permissions.
- Planner: assigned consultation handling, consultation completion, consultation cancellation.
- Consultation manager: insurance Q&A answer authority.
- Member: customer account, Q&A creation, point mall orders, point history.

## Point Rules

- Store point changes as ledger entries.
- Calculate current balance from ledger entries or from a verified projection.
- Never update a member point balance without a ledger entry.
- Prevent duplicate event grants.
- Refund cancelled point mall orders with a reversing ledger entry.

## CMS Rules

CMS includes:

- consultation management
- Q&A answers
- FAQ
- notices
- event management
- point mall product/order management
- point management
- role management

CMS excludes:

- insurance product management

## UI Rules

- Follow `DESIGN.MD` for color, typography, spacing, components, and motion.
- Do not use emojis in UI.
- Use one SVG icon library consistently.
- Use primary blue for interactive elements, not decoration.

## Verification Rules

- On Windows, run `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1`.
- Prefer `npm.cmd` and `npx.cmd` in PowerShell scripts.
- Tests must not require a running local PostgreSQL server unless a task explicitly covers database integration.
