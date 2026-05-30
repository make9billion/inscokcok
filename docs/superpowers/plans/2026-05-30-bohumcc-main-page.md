# Bohumcc Main Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the public homepage sections on top of the Site Shell.

**Architecture:** Keep this as a static Inertia/React homepage slice. Use local arrays for preview content and links to future routes; later plans will replace those arrays with real data/controllers. Preserve the Toss-inspired restrained UI from `design.MD`.

**Tech Stack:** Laravel 12, React, Inertia, Tailwind CSS, lucide-react, PHPUnit, Vite.

---

## Scope

This plan implements the homepage only:

- Product selection and consultation intake preview
- Large insurance checkup CTA near product selection
- Fake rolling consultation receipt status
- FAQ preview
- Popular point mall products preview
- Event preview
- Insurance Q&A preview
- Notice preview
- Simple ad/banner strips

It does not submit forms, create consultations, load real CMS content, or build point mall/event/Q&A detail pages.

## Files

- Replace: `resources/js/Pages/Welcome.jsx`
- Modify: `tests/Feature/SiteShellTest.php`

## Content Contract

Homepage must include visible Korean text for:

- `상담신청`
- `보험점검`
- `실시간 상담 접수 현황`
- `자주 묻는 질문`
- `포인트몰 인기 상품`
- `진행 중인 이벤트`
- `보험지식인`
- `공지사항`
- `암보험`
- `치매/간병보험`
- `질병/상해보험`
- `펫보험`

## Task 1: Main Homepage Static Sections

**Files:**

- Replace: `resources/js/Pages/Welcome.jsx`
- Modify: `tests/Feature/SiteShellTest.php`

- [ ] **Step 1: Expand feature test**

Update `tests/Feature/SiteShellTest.php` so `test_homepage_renders_insurance_site_shell` still asserts Inertia `Welcome`, and also asserts the rendered response includes the expected app root. Add a second test:

```php
public function test_homepage_source_contains_main_page_entry(): void
{
    $source = file_get_contents(resource_path('js/Pages/Welcome.jsx'));

    $this->assertStringContainsString('실시간 상담 접수 현황', $source);
    $this->assertStringContainsString('포인트몰 인기 상품', $source);
    $this->assertStringContainsString('진행 중인 이벤트', $source);
    $this->assertStringContainsString('보험지식인', $source);
    $this->assertStringContainsString('공지사항', $source);
}
```

- [ ] **Step 2: Replace homepage component**

`Welcome.jsx` must:

- Use `PublicLayout`.
- Use `Head title="보흠CC"`.
- Import `Link` from Inertia.
- Import `ArrowRight`, `Bell`, `CheckCircle2`, `ChevronRight`, `Gift`, `MessageSquareText`, `PhoneCall`, `SearchCheck`, `ShoppingBag`, `ShieldCheck`, `Sparkles` from `lucide-react`.
- Define local arrays for product options, rolling receipt rows, FAQs, point mall products, events, Q&A previews, and notices.
- Render a restrained first screen with:
  - main headline
  - product selection chips
  - consultation form preview inputs
  - large `보험점검 바로가기` CTA next to or below product selection depending viewport
- Render all preview sections from the Content Contract.
- Use no emoji.
- Use cards only for repeated items and the form/tool surface.
- Keep UI colors within Toss tokens and avoid one-note blue.

- [ ] **Step 3: Run focused test**

Run:

```powershell
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan test tests/Feature/SiteShellTest.php
```

Expected: passes.

- [ ] **Step 4: Run build**

Run:

```powershell
npm.cmd run build
```

Expected: Vite build passes.

- [ ] **Step 5: Run full verification**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify.ps1
```

Expected: Laravel tests and Vite build pass.

