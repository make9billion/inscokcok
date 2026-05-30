# Bohumcc Auth And Members Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adapt the existing Breeze authentication flow into a Korean insurance-platform member experience.

**Architecture:** Keep Laravel Breeze auth as the foundation. Extend registration to collect the profile fields already present on `users`, localize member-facing screens, and add a member dashboard that summarizes consultations, points, and point mall activity using existing domain relationships. Social login is represented as disabled/integration-ready UI until provider credentials and package choice are confirmed.

**Tech Stack:** Laravel 12, React, Inertia, Tailwind CSS, PHPUnit, Vite.

---

## Scope

This plan implements:

- Korean member registration labels and profile fields
- Backend registration validation/storage for phone, birth date, gender, and address fields
- Integration-ready Kakao/Naver social login buttons without OAuth behavior
- Korean member dashboard summary
- Member dashboard props for point balance, recent point entries, consultation count, Q&A count, and order count

This plan does not implement:

- Real Kakao/Naver OAuth callback flow
- Point ledger grant on registration
- Full mypage order history screens
- Profile edit redesign

## Files

- Modify: `app/Http/Controllers/Auth/RegisteredUserController.php`
- Modify: `routes/web.php`
- Modify: `resources/js/Pages/Auth/Register.jsx`
- Modify: `resources/js/Pages/Dashboard.jsx`
- Create: `tests/Feature/Auth/MemberRegistrationTest.php`
- Create: `tests/Feature/MemberDashboardTest.php`

## Task 1: Member Registration Fields

**Files:**

- Modify: `app/Http/Controllers/Auth/RegisteredUserController.php`
- Modify: `resources/js/Pages/Auth/Register.jsx`
- Create: `tests/Feature/Auth/MemberRegistrationTest.php`

- [ ] **Step 1: Write registration feature test**

Create `tests/Feature/Auth/MemberRegistrationTest.php`:

```php
<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MemberRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_members_can_register_with_profile_fields(): void
    {
        $response = $this->post('/register', [
            'name' => '홍길동',
            'email' => 'member@example.com',
            'phone' => '010-1234-5678',
            'birth_date' => '1990-01-02',
            'gender' => 'male',
            'postal_code' => '06236',
            'address_line1' => '서울시 강남구 테헤란로',
            'address_line2' => '10층',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertRedirect(route('dashboard', absolute: false));

        $user = User::where('email', 'member@example.com')->firstOrFail();

        $this->assertSame('홍길동', $user->name);
        $this->assertSame('010-1234-5678', $user->phone);
        $this->assertSame('1990-01-02', $user->birth_date->toDateString());
        $this->assertSame('male', $user->gender);
        $this->assertSame('06236', $user->postal_code);
        $this->assertSame('서울시 강남구 테헤란로', $user->address_line1);
        $this->assertSame('10층', $user->address_line2);
        $this->assertAuthenticatedAs($user);
    }

    public function test_phone_is_required_for_member_registration(): void
    {
        $response = $this->from('/register')->post('/register', [
            'name' => '홍길동',
            'email' => 'member@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertRedirect('/register');
        $response->assertSessionHasErrors('phone');
    }
}
```

- [ ] **Step 2: Update controller validation and create payload**

`RegisteredUserController::store` must validate:

```php
'name' => 'required|string|max:255',
'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
'phone' => 'required|string|max:30',
'birth_date' => 'nullable|date',
'gender' => 'nullable|string|max:20',
'postal_code' => 'nullable|string|max:20',
'address_line1' => 'nullable|string|max:255',
'address_line2' => 'nullable|string|max:255',
'password' => ['required', 'confirmed', Rules\Password::defaults()],
```

Create the user with the same profile fields.

- [ ] **Step 3: Update registration UI**

`Register.jsx` must:

- Use Korean labels and title.
- Add fields: phone, birth_date, gender select, postal_code, address_line1, address_line2.
- Keep password and confirmation.
- Add disabled Kakao/Naver buttons with text `카카오로 시작하기`, `네이버로 시작하기`, and helper text `소셜 로그인 연동 준비 중`.
- Use no emoji.

- [ ] **Step 4: Verify**

Run:

```powershell
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan test tests/Feature/Auth/MemberRegistrationTest.php
npm.cmd run build
```

## Task 2: Member Dashboard Summary

**Files:**

- Modify: `routes/web.php`
- Modify: `resources/js/Pages/Dashboard.jsx`
- Create: `tests/Feature/MemberDashboardTest.php`

- [ ] **Step 1: Write dashboard feature test**

Create `tests/Feature/MemberDashboardTest.php`:

```php
<?php

namespace Tests\Feature;

use App\Enums\PointLedgerType;
use App\Models\Consultation;
use App\Models\KnowledgeQuestion;
use App\Models\PointLedgerEntry;
use App\Models\PointMallOrder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MemberDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_receives_member_summary_props(): void
    {
        $user = User::factory()->create();

        Consultation::factory()->for($user)->create();
        KnowledgeQuestion::factory()->for($user)->create();
        PointMallOrder::factory()->for($user)->create(['total_points' => 3000]);
        PointLedgerEntry::factory()->for($user)->create([
            'type' => PointLedgerType::Earned,
            'points' => 1000,
            'memo' => '회원가입 적립',
        ]);

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->where('summary.pointBalance', 1000)
            ->where('summary.consultationCount', 1)
            ->where('summary.questionCount', 1)
            ->where('summary.orderCount', 1)
        );
    }
}
```

- [ ] **Step 2: Update dashboard route props**

Replace the `/dashboard` closure with a callback that reads the authenticated user and passes:

```php
'summary' => [
    'pointBalance' => (int) $user->pointLedgerEntries()->sum('points'),
    'consultationCount' => $user->consultations()->count(),
    'questionCount' => $user->knowledgeQuestions()->count(),
    'orderCount' => $user->pointMallOrders()->count(),
],
'recentPointEntries' => $user->pointLedgerEntries()
    ->latest()
    ->take(5)
    ->get(['type', 'points', 'memo', 'created_at'])
    ->map(fn ($entry) => [
        'type' => $entry->type->value,
        'points' => $entry->points,
        'memo' => $entry->memo,
        'createdAt' => $entry->created_at?->format('Y-m-d'),
    ]),
```

- [ ] **Step 3: Replace dashboard UI**

`Dashboard.jsx` must:

- Use Korean title `내정보`.
- Show cards for point balance, consultations, Q&A, orders.
- Show recent point entries or empty state.
- Link to `/profile`, `/insurance-checkup`, `/point-mall`, `/knowledge`.
- Avoid emoji and oversized marketing.

- [ ] **Step 4: Verify**

Run:

```powershell
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan test tests/Feature/MemberDashboardTest.php
npm.cmd run build
```

## Task 3: Final Verification

- [ ] **Step 1: Run auth/member tests**

```powershell
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan test tests/Feature/Auth/MemberRegistrationTest.php tests/Feature/MemberDashboardTest.php
```

- [ ] **Step 2: Run full verifier**

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify.ps1
```

Expected: Laravel tests and Vite build pass.

