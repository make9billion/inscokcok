# Bohumcc Consultations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build customer-facing insurance consultation intake so visitors and members can submit product consultation or insurance checkup requests.

**Architecture:** Add a focused Laravel controller and form request for consultation creation, then connect the public homepage form and the insurance checkup page to the same endpoint. The endpoint stores consent timestamps, links authenticated users when present, and redirects back with a success flash message for Inertia UI feedback.

**Tech Stack:** Laravel 12, React, Inertia, Tailwind CSS, PHPUnit, Vite.

---

## Scope

This plan implements:

- Product consultation submission from the homepage preview form.
- Insurance checkup submission from `/insurance-checkup`.
- Guest and authenticated member submissions.
- Required privacy consent and optional third-party consent storage.
- Backend validation for applicant name, phone, consultation type, product, premium, preferred contact time, and memo.
- Success flash rendering on public pages.

This plan does not implement:

- Admin assignment workflow.
- Planner notifications.
- Point grants.
- External CRM integration.

## Files

- Create: `app/Http/Requests/StoreConsultationRequest.php`
- Create: `app/Http/Controllers/ConsultationController.php`
- Modify: `routes/web.php`
- Modify: `resources/js/Pages/Welcome.jsx`
- Create: `resources/js/Pages/InsuranceCheckup.jsx`
- Create: `tests/Feature/ConsultationSubmissionTest.php`

## Task 1: Consultation Submission Backend

**Files:**

- Create: `app/Http/Requests/StoreConsultationRequest.php`
- Create: `app/Http/Controllers/ConsultationController.php`
- Modify: `routes/web.php`
- Create: `tests/Feature/ConsultationSubmissionTest.php`

- [ ] **Step 1: Write consultation feature tests**

Create tests that prove guests can create a product consultation, authenticated users are linked to their consultation, privacy consent is required, and checkup consultation type is stored.

- [ ] **Step 2: Add request validation**

Create a form request that accepts `type`, `applicant_name`, `phone`, `birth_date`, `current_monthly_premium`, `interested_product`, `preferred_contact_time`, `memo`, `privacy_agreement`, and `third_party_agreement`.

- [ ] **Step 3: Add controller store action**

Create a consultation with `status` set to `received`, `user_id` set from the authenticated user when present, and consent timestamps from the submitted checkboxes.

- [ ] **Step 4: Register routes**

Add:

```php
Route::post('/consultations', [ConsultationController::class, 'store'])->name('consultations.store');
Route::get('/insurance-checkup', fn () => Inertia::render('InsuranceCheckup'))->name('insurance-checkup');
```

- [ ] **Step 5: Verify backend**

Run:

```powershell
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan test tests/Feature/ConsultationSubmissionTest.php
```

## Task 2: Public Consultation Forms

**Files:**

- Modify: `resources/js/Pages/Welcome.jsx`
- Create: `resources/js/Pages/InsuranceCheckup.jsx`

- [ ] **Step 1: Connect homepage form to Inertia submit**

Replace the non-functional preview form with a `useForm` form that posts to `/consultations` with `type: product`.

- [ ] **Step 2: Add success and error states**

Show success flash text after submission and inline validation messages under relevant fields.

- [ ] **Step 3: Create insurance checkup page**

Create a public page at `/insurance-checkup` with a fuller form that posts to `/consultations` with `type: checkup`, includes current monthly premium and memo fields, and follows the existing Toss-style UI.

- [ ] **Step 4: Verify frontend build**

Run:

```powershell
npm.cmd run build
```

## Task 3: Final Verification And Commit

- [ ] **Step 1: Run consultation tests**

```powershell
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan test tests/Feature/ConsultationSubmissionTest.php
```

- [ ] **Step 2: Run full verifier**

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify.ps1
```

- [ ] **Step 3: Commit**

```powershell
git add app/Http/Requests/StoreConsultationRequest.php app/Http/Controllers/ConsultationController.php routes/web.php resources/js/Pages/Welcome.jsx resources/js/Pages/InsuranceCheckup.jsx tests/Feature/ConsultationSubmissionTest.php docs/superpowers/plans/2026-05-30-bohumcc-consultations.md
git commit -m "feat: add consultation intake"
```
