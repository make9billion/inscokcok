# Bohumcc Custom Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-custom Korean insurance agency website with member accounts, consultation intake, admin CMS, point ledger, and self-built point mall.

**Architecture:** Start with one Laravel 12 application using React/Inertia for customer and admin screens. Split the domain into focused modules for auth, consultations, Q&A, points, events, point mall, CMS content, and audit logs. Keep insurance product pages as image-backed static content managed through project files, not through the admin CMS.

**Tech Stack:** Laravel 12, React, Inertia, PostgreSQL, Redis, Pest/PHPUnit, Playwright, Kakao/Naver social login.

---

## Source Requirements

The working requirements come from the revised Google Sheet reviewed on 2026-05-29:

- Main menu: service guide, insurance products, insurance checkup, insurance Q&A, events, point mall, customer center, my page.
- Insurance product and customer center menus need hover dropdowns.
- Main page must reference `C:\Project\bohumcc\배너+폼_예시\index.html`.
- Main page must include a large insurance checkup button near the product selection form.
- Live consultation receipt status is display-only fake rolling data.
- Point mall is self-built.
- Admin CMS excludes insurance product management.
- Insurance product/service/checkup/company intro pages are image-backed pages using assets placed in the project folder.
- Event point amounts are editable in admin event management.
- Roles: general member, planner, consultation manager, full admin.
- Planner can process consultation completion/cancellation.
- Consultation manager can answer insurance Q&A.

## Plan Decomposition

This project is too large for one implementation plan. Implement it as separate executable plans in this order:

1. `2026-05-29-bohumcc-harness-setup.md`
2. `2026-05-29-bohumcc-domain-models.md`
3. `2026-05-29-bohumcc-site-shell.md`
4. `2026-05-29-bohumcc-main-page.md`
5. `2026-05-29-bohumcc-auth-members.md`
6. `2026-05-29-bohumcc-consultations.md`
7. `2026-05-29-bohumcc-admin-consultations.md`
8. `2026-05-29-bohumcc-points-events.md`
9. `2026-05-29-bohumcc-knowledge-qna.md`
10. `2026-05-29-bohumcc-point-mall.md`
11. `2026-05-29-bohumcc-admin-cms.md`
12. `2026-05-29-bohumcc-static-image-pages.md`
13. `2026-05-29-bohumcc-qa-release.md`

## Files And Responsibilities

- `docs/superpowers/plans/*.md`: executable implementation plans, one subsystem per plan.
- `docs/superpowers/agents/implementer-prompt.md`: prompt template for implementation subagents.
- `docs/superpowers/agents/spec-reviewer-prompt.md`: prompt template for spec compliance reviewers.
- `docs/superpowers/agents/code-quality-reviewer-prompt.md`: prompt template for code quality reviewers.
- `docs/superpowers/agents/ui-verification-reviewer-prompt.md`: prompt template for browser/UI reviewers.
- `DESIGN.MD`: user-authored visual design system. Treat it as the source of truth for UI look and feel.
- `harness/project-rules.md`: local working rules for this project.
- `harness/verification.md`: canonical commands that must pass before work is called complete.
- `scripts/verify.ps1`: Windows verification entry point.
- `scripts/verify.sh`: Unix-like verification entry point.

## Subproject Scope

### 1. Harness Setup

Create the repository and baseline Laravel/Inertia application. Add verification scripts, test commands, lint commands, environment example, and Superpowers directory structure.

### 2. Domain Models

Create migrations, models, factories, policies, and seeders for:

- users
- roles and permissions
- consultations
- consultation assignments
- Q&A posts and answers
- point ledger entries
- events
- point mall categories
- point mall products
- carts
- orders
- order items
- admin audit logs

### 3. Site Shell

Build the public layout, navigation, responsive header, dropdown menus, footer, and shared page container.

### 4. Main Page

Build the main homepage using the example banner/form project as design reference. Add product selection, consultation form, large insurance checkup button, fake rolling consultation receipts, FAQ preview, point mall popular products, events, Q&A preview, notice preview, and ad banner behavior.

### 5. Auth And Members

Build self-registration, Kakao/Naver social login integration points, login/logout, password change, member profile editing, withdrawal, point history, and order history.

### 6. Consultations

Build customer-facing insurance product consultation and insurance checkup forms. Store privacy and third-party consent state. Validate all required fields.

### 7. Admin Consultation Management

Build admin consultation list/detail, status workflow, planner assignment, permission checks, and status change logs.

### 8. Points And Events

Build event configuration, membership signup point grant, consultation completion point grant, duplicate grant prevention, ledger calculation, admin adjustment, refund entries, and member-visible history.

### 9. Insurance Q&A

Build login-only question creation, title-only public listing, private body/answer visibility, consultation manager answer workflow, customer edit/delete rules, and answer immutability for planners/managers.

### 10. Point Mall

Build self-hosted categories, product list/detail, cart, point checkout, order history, stock check, insufficient point handling, cancellation, and point refund.

### 11. Admin CMS

Build admin tools for:

- Q&A answers
- FAQ create/update
- notice board
- event management
- point mall products and orders
- point management
- role management

Do not build insurance product management in admin CMS.

### 12. Static Image Pages

Build image-backed pages for:

- service guide
- cancer insurance
- dementia/care insurance
- disease/accident insurance
- dementia insurance
- pet insurance
- child insurance
- insurance checkup guide
- company intro
- Q&A top guide banner

### 13. QA And Release

Run backend tests, frontend build, Playwright checks, role access tests, point ledger consistency tests, and responsive checks.

## Execution Rules

- Use one implementation subagent per subproject task.
- UI work must follow `DESIGN.MD`.
- After each implementation task, run a spec compliance review.
- After spec compliance passes, run a code quality review.
- For UI-heavy tasks, run a UI verification review after code quality review.
- Do not proceed to the next task while any review has open issues.
- Commit after each task when the project is in a passing state.
- Do not add admin insurance product management unless the user explicitly re-adds it.

## Verification Baseline

Before any task is marked complete, run the verification command defined by the current stage:

- Harness stage: `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1`
- Laravel backend stage: `php artisan test`
- Frontend stage: `npm run build`
- UI stage: `npx playwright test`
- Full stage: `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1`

## First Implementation Plan To Write

Write and execute `docs/superpowers/plans/2026-05-29-bohumcc-harness-setup.md` first. That plan must create the repository baseline, scripts, harness docs, and project skeleton.
