# Bohumcc Site Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Laravel default welcome screen with a Toss-inspired public site shell for the Korean insurance agency platform.

**Architecture:** Build reusable React/Inertia layout components before feature pages. Keep the shell static for this slice: navigation links can point to future paths, but header, dropdowns, mobile menu, footer, and a simple page body must render now. Use `design.MD` tokens for typography, color, spacing, 4-8px radii, and restrained business UI.

**Tech Stack:** Laravel 12, React, Inertia, Tailwind CSS, lucide-react icons, PHPUnit, Vite.

---

## Scope

This plan implements only the public site shell:

- Public header with primary menu
- Hover/focus dropdowns for insurance products and customer center
- Mobile menu
- Auth-aware login/dashboard links
- Footer with grouped navigation and business contact placeholders
- Toss-inspired design tokens in Tailwind/CSS
- Root `Welcome` page using the shell

It does not implement homepage content sections, consultation form behavior, admin CMS, point mall screens, or static image pages.

## Files

- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `tailwind.config.js`
- Modify: `resources/css/app.css`
- Create: `resources/js/Constants/siteNavigation.js`
- Create: `resources/js/Layouts/PublicLayout.jsx`
- Create: `resources/js/Components/SiteHeader.jsx`
- Create: `resources/js/Components/SiteFooter.jsx`
- Modify: `resources/js/Pages/Welcome.jsx`
- Create: `tests/Feature/SiteShellTest.php`

## Navigation Contract

Top-level desktop menu, in order:

- 서비스안내 -> `/services`
- 보험상품 -> dropdown:
  - 암보험 -> `/insurance/cancer`
  - 치매/간병보험 -> `/insurance/dementia-care`
  - 질병/상해보험 -> `/insurance/disease-accident`
  - 치매보험 -> `/insurance/dementia`
  - 펫보험 -> `/insurance/pet`
  - 어린이보험 -> `/insurance/child`
- 보험점검 -> `/insurance-checkup`
- 보험지식인 -> `/knowledge`
- 이벤트 -> `/events`
- 포인트몰 -> `/point-mall`
- 고객센터 -> dropdown:
  - 공지사항 -> `/customer/notices`
  - 자주 묻는 질문 -> `/customer/faq`
  - 회사소개 -> `/customer/company`
- 내정보 -> `/mypage`

Auth area:

- Guest: `로그인`, `회원가입`
- Authenticated: `대시보드`, `내정보`

## Task 1: Dependencies And Design Tokens

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `tailwind.config.js`
- Modify: `resources/css/app.css`

- [ ] **Step 1: Add icon dependency**

Run:

```powershell
npm install lucide-react
```

Expected: `package.json` and `package-lock.json` include `lucide-react`.

- [ ] **Step 2: Update Tailwind theme**

Set `fontFamily.sans` to:

```js
[
    'Toss Product Sans',
    'Tossface',
    'SF Pro KR',
    'SF Pro Display',
    'Apple SD Gothic Neo',
    'Noto Sans KR',
    ...defaultTheme.fontFamily.sans,
]
```

Add colors:

```js
toss: {
    blue: '#6366f1',
    blueHover: '#2272eb',
    blueLight: '#e8f3ff',
    grey50: '#f9fafb',
    grey100: '#f2f4f6',
    grey200: '#e5e8eb',
    grey500: '#8b95a1',
    grey600: '#6b7684',
    grey700: '#4e5968',
    grey800: '#333d4b',
    grey900: '#191f28',
}
```

- [ ] **Step 3: Add global CSS base**

`resources/css/app.css` must set:

```css
@layer base {
    html {
        font-family: "Toss Product Sans", "Tossface", "SF Pro KR", "SF Pro Display", "Apple SD Gothic Neo", "Noto Sans KR", system-ui, sans-serif;
        color: #191f28;
        background: #ffffff;
    }

    body {
        min-width: 320px;
        background: #ffffff;
    }

    * {
        letter-spacing: 0;
    }
}
```

- [ ] **Step 4: Build**

Run:

```powershell
npm.cmd run build
```

Expected: Vite build passes.

## Task 2: Public Layout Components

**Files:**

- Create: `resources/js/Constants/siteNavigation.js`
- Create: `resources/js/Components/SiteHeader.jsx`
- Create: `resources/js/Components/SiteFooter.jsx`
- Create: `resources/js/Layouts/PublicLayout.jsx`

- [ ] **Step 1: Create navigation constants**

Export `primaryNavigation`, `insuranceProductLinks`, and `customerCenterLinks` using the navigation contract paths and labels.

- [ ] **Step 2: Create `SiteHeader`**

Requirements:

- Uses `Link` from `@inertiajs/react`.
- Uses `ChevronDown`, `Menu`, and `X` from `lucide-react`.
- Desktop header is sticky, white, 1px bottom border `#e5e8eb`.
- Brand label is `보흠CC`.
- Dropdown menus open on hover and keyboard focus via CSS group/focus-within.
- Mobile menu opens with local React state.
- Mobile menu includes all top-level links and dropdown child links.
- No emoji in UI text.

- [ ] **Step 3: Create `SiteFooter`**

Requirements:

- Footer uses neutral grey background.
- Shows `보흠CC`, short Korean business copy, and grouped links.
- Uses compact typography and no marketing-heavy hero copy.

- [ ] **Step 4: Create `PublicLayout`**

Requirements:

- Props: `children`, `auth`.
- Renders `SiteHeader`, `main`, and `SiteFooter`.
- Main uses white/grey section backgrounds and keeps content below sticky header.

## Task 3: Root Page And Feature Test

**Files:**

- Replace: `resources/js/Pages/Welcome.jsx`
- Create: `tests/Feature/SiteShellTest.php`

- [ ] **Step 1: Replace Laravel default welcome page**

`Welcome.jsx` must:

- Use `<Head title="보흠CC" />`.
- Render `PublicLayout`.
- Show a quiet first screen with three operational panels:
  - 상담신청
  - 보험점검
  - 포인트몰
- Include no Laravel default links, SVGs, or copy.
- Keep content minimal because homepage sections are a later plan.

- [ ] **Step 2: Add feature test**

Create `tests/Feature/SiteShellTest.php`:

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;

class SiteShellTest extends TestCase
{
    public function test_homepage_renders_insurance_site_shell(): void
    {
        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('Welcome'));
    }
}
```

- [ ] **Step 3: Run focused test**

Run:

```powershell
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan test tests/Feature/SiteShellTest.php
```

Expected: test passes.

- [ ] **Step 4: Run full verification**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify.ps1
```

Expected:

- Composer validation passes.
- Laravel tests pass.
- Vite build passes.
- Playwright remains skipped until config exists.

