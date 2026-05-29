# Bohumcc Domain Models Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Laravel domain foundation for members, roles, consultations, insurance Q&A, events, points, point mall orders, and admin audit logs.

**Architecture:** Keep the first backend slice as a single Laravel 12 monolith with Eloquent models, PHP backed enums, migrations, factories, seeders, and PHPUnit feature tests. Use database constraints for integrity, Eloquent relationships for application access, and signed point ledger entries instead of mutable point balances. Exclude admin insurance product management; insurance product pages stay static/image-backed content outside CMS.

**Tech Stack:** Laravel 12, PHP 8.4, Eloquent, PostgreSQL in production, SQLite in tests, PHPUnit, Laravel factories and seeders.

---

## Current Project Context

- Workspace: `C:\Project\bohumcc`
- Verification command: `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1`
- Existing scaffold: Laravel Breeze + React/Inertia
- Existing auth model: `app/Models/User.php`
- Existing base user migration: `database/migrations/0001_01_01_000000_create_users_table.php`
- User-authored design source: `design.MD`
- Untracked example folder: `배너+폼_예시/`; leave it untouched.

## Domain Boundaries

This plan creates backend domain structure only. It does not build customer pages, admin screens, social login, payment, delivery integration, or insurance product CMS.

The domain is split into these modules:

- `Identity`: users, roles, planner/manager/admin capability checks
- `Consultations`: consultation intake, planner assignment, completion/cancellation logs
- `Knowledge Q&A`: member questions, private body/answer visibility, manager answers
- `Events And Points`: configurable point events and immutable ledger entries
- `Point Mall`: categories, products, carts, orders, order items
- `Admin Audit`: audit records for privileged changes

## File Structure

Create or modify these files:

- Create: `app/Enums/UserRole.php`
- Create: `app/Enums/ConsultationStatus.php`
- Create: `app/Enums/ConsultationType.php`
- Create: `app/Enums/KnowledgeQuestionStatus.php`
- Create: `app/Enums/PointLedgerType.php`
- Create: `app/Enums/PointMallOrderStatus.php`
- Modify: `app/Models/User.php`
- Create: `app/Models/Consultation.php`
- Create: `app/Models/ConsultationStatusLog.php`
- Create: `app/Models/KnowledgeQuestion.php`
- Create: `app/Models/KnowledgeAnswer.php`
- Create: `app/Models/Event.php`
- Create: `app/Models/PointLedgerEntry.php`
- Create: `app/Models/PointMallCategory.php`
- Create: `app/Models/PointMallProduct.php`
- Create: `app/Models/PointMallCart.php`
- Create: `app/Models/PointMallCartItem.php`
- Create: `app/Models/PointMallOrder.php`
- Create: `app/Models/PointMallOrderItem.php`
- Create: `app/Models/AdminAuditLog.php`
- Create: `database/migrations/*_add_profile_fields_to_users_table.php`
- Create: `database/migrations/*_create_consultations_table.php`
- Create: `database/migrations/*_create_consultation_status_logs_table.php`
- Create: `database/migrations/*_create_knowledge_questions_table.php`
- Create: `database/migrations/*_create_knowledge_answers_table.php`
- Create: `database/migrations/*_create_events_table.php`
- Create: `database/migrations/*_create_point_ledger_entries_table.php`
- Create: `database/migrations/*_create_point_mall_categories_table.php`
- Create: `database/migrations/*_create_point_mall_products_table.php`
- Create: `database/migrations/*_create_point_mall_carts_table.php`
- Create: `database/migrations/*_create_point_mall_cart_items_table.php`
- Create: `database/migrations/*_create_point_mall_orders_table.php`
- Create: `database/migrations/*_create_point_mall_order_items_table.php`
- Create: `database/migrations/*_add_order_foreign_to_point_ledger_entries_table.php`
- Create: `database/migrations/*_create_admin_audit_logs_table.php`
- Modify: `database/factories/UserFactory.php`
- Create: `database/factories/ConsultationFactory.php`
- Create: `database/factories/KnowledgeQuestionFactory.php`
- Create: `database/factories/KnowledgeAnswerFactory.php`
- Create: `database/factories/EventFactory.php`
- Create: `database/factories/PointLedgerEntryFactory.php`
- Create: `database/factories/PointMallCategoryFactory.php`
- Create: `database/factories/PointMallProductFactory.php`
- Create: `database/factories/PointMallOrderFactory.php`
- Create: `database/factories/AdminAuditLogFactory.php`
- Create: `database/seeders/EventSeeder.php`
- Create: `database/seeders/PointMallCategorySeeder.php`
- Modify: `database/seeders/DatabaseSeeder.php`
- Create: `tests/Feature/Domain/IdentityDomainTest.php`
- Create: `tests/Feature/Domain/ConsultationDomainTest.php`
- Create: `tests/Feature/Domain/KnowledgeDomainTest.php`
- Create: `tests/Feature/Domain/PointLedgerDomainTest.php`
- Create: `tests/Feature/Domain/PointMallDomainTest.php`
- Create: `tests/Feature/Domain/AdminAuditDomainTest.php`

## Schema Contracts

### Users

Add these columns to the existing `users` table:

| Column | Type | Rule |
| --- | --- | --- |
| `role` | string length 40 | default `member`, indexed |
| `phone` | string length 30 nullable | indexed |
| `birth_date` | date nullable | member profile |
| `gender` | string length 20 nullable | profile display/filter only |
| `postal_code` | string length 20 nullable | shipping/contact profile |
| `address_line1` | string length 255 nullable | shipping/contact profile |
| `address_line2` | string length 255 nullable | shipping/contact profile |
| `withdrawn_at` | timestamp nullable | account withdrawal marker |

### Consultations

`consultations` columns:

| Column | Type | Rule |
| --- | --- | --- |
| `id` | id | primary key |
| `user_id` | foreign id nullable constrained users nullOnDelete | anonymous or member intake |
| `assigned_planner_id` | foreign id nullable constrained users nullOnDelete | planner role user |
| `type` | string length 40 | enum value |
| `status` | string length 40 | enum value, default `received`, indexed |
| `applicant_name` | string length 80 | required |
| `phone` | string length 30 | required |
| `birth_date` | date nullable | optional |
| `current_monthly_premium` | unsigned integer nullable | KRW amount |
| `interested_product` | string length 120 nullable | selected product/static category |
| `preferred_contact_time` | string length 80 nullable | free text window |
| `memo` | text nullable | intake detail |
| `privacy_agreed_at` | timestamp | required |
| `third_party_agreed_at` | timestamp nullable | required when external handoff is used |
| `completed_at` | timestamp nullable | set when planner completes |
| `cancelled_at` | timestamp nullable | set when planner cancels |
| `created_at`, `updated_at`, `deleted_at` | timestamps/soft deletes | Laravel defaults |

`consultation_status_logs` columns:

| Column | Type | Rule |
| --- | --- | --- |
| `id` | id | primary key |
| `consultation_id` | foreign id constrained cascadeOnDelete | parent consultation |
| `actor_id` | foreign id nullable constrained users nullOnDelete | user who changed status |
| `from_status` | string length 40 nullable | previous enum value |
| `to_status` | string length 40 | new enum value |
| `memo` | text nullable | reason note |
| `created_at`, `updated_at` | timestamps | Laravel defaults |

### Knowledge Q&A

`knowledge_questions` columns:

| Column | Type | Rule |
| --- | --- | --- |
| `id` | id | primary key |
| `user_id` | foreign id constrained users cascadeOnDelete | asking member |
| `assigned_manager_id` | foreign id nullable constrained users nullOnDelete | consultation manager |
| `status` | string length 40 | default `open`, indexed |
| `title` | string length 180 | public listing text |
| `body` | text | private content |
| `answered_at` | timestamp nullable | set when answer exists |
| `created_at`, `updated_at`, `deleted_at` | timestamps/soft deletes | customer can delete own question |

`knowledge_answers` columns:

| Column | Type | Rule |
| --- | --- | --- |
| `id` | id | primary key |
| `knowledge_question_id` | foreign id constrained cascadeOnDelete | one answer per question |
| `manager_id` | foreign id constrained users restrictOnDelete | consultation manager |
| `body` | text | private answer |
| `created_at`, `updated_at` | timestamps | keep `updated_at` for Laravel, policy forbids manager edits after create |

Add a unique index on `knowledge_answers.knowledge_question_id`.

### Events And Point Ledger

`events` columns:

| Column | Type | Rule |
| --- | --- | --- |
| `id` | id | primary key |
| `slug` | string length 80 unique | `signup_bonus`, `consultation_completed_bonus` |
| `name` | string length 120 | admin display |
| `trigger_type` | string length 80 | event hook name |
| `point_amount` | integer | default amount, signed not allowed by validation later |
| `is_active` | boolean | default true |
| `starts_at` | timestamp nullable | optional activation window |
| `ends_at` | timestamp nullable | optional activation window |
| `created_at`, `updated_at` | timestamps | Laravel defaults |

`point_ledger_entries` columns:

| Column | Type | Rule |
| --- | --- | --- |
| `id` | id | primary key |
| `user_id` | foreign id constrained users cascadeOnDelete | owner |
| `event_id` | foreign id nullable constrained nullOnDelete | configured event source |
| `order_id` | unsigned bigint nullable indexed | mall order source; foreign key is added after point mall order table exists |
| `created_by_id` | foreign id nullable constrained users nullOnDelete | admin/manual actor |
| `type` | string length 40 | enum value |
| `points` | integer | positive earn/refund, negative spend/adjustment |
| `balance_after` | integer nullable | snapshot after service writes |
| `idempotency_key` | string length 160 unique nullable | prevents duplicate grants |
| `memo` | string length 255 nullable | admin/member readable reason |
| `created_at`, `updated_at` | timestamps | immutable by service rules |

### Point Mall

`point_mall_categories` columns:

| Column | Type | Rule |
| --- | --- | --- |
| `id` | id | primary key |
| `name` | string length 80 | category name |
| `slug` | string length 80 unique | URL/admin identifier |
| `sort_order` | unsigned integer default 0 | display order |
| `is_active` | boolean default true | visibility |
| `created_at`, `updated_at` | timestamps | Laravel defaults |

`point_mall_products` columns:

| Column | Type | Rule |
| --- | --- | --- |
| `id` | id | primary key |
| `point_mall_category_id` | foreign id constrained cascadeOnDelete | category |
| `name` | string length 160 | product name |
| `slug` | string length 180 unique | URL/admin identifier |
| `summary` | string length 255 nullable | card text |
| `description` | text nullable | detail text |
| `image_path` | string length 255 nullable | local/public asset path |
| `point_price` | unsigned integer | checkout price |
| `stock_quantity` | unsigned integer default 0 | inventory |
| `is_featured` | boolean default false | homepage popular section |
| `is_active` | boolean default true | visibility |
| `created_at`, `updated_at`, `deleted_at` | timestamps/soft deletes | admin product lifecycle |

`point_mall_carts` columns:

| Column | Type | Rule |
| --- | --- | --- |
| `id` | id | primary key |
| `user_id` | foreign id constrained users cascadeOnDelete | owner |
| `created_at`, `updated_at` | timestamps | Laravel defaults |

Add a unique index on `point_mall_carts.user_id`.

`point_mall_cart_items` columns:

| Column | Type | Rule |
| --- | --- | --- |
| `id` | id | primary key |
| `point_mall_cart_id` | foreign id constrained cascadeOnDelete | cart |
| `point_mall_product_id` | foreign id constrained cascadeOnDelete | product |
| `quantity` | unsigned integer | default 1 |
| `created_at`, `updated_at` | timestamps | Laravel defaults |

Add a unique composite index on `point_mall_cart_id, point_mall_product_id`.

`point_mall_orders` columns:

| Column | Type | Rule |
| --- | --- | --- |
| `id` | id | primary key |
| `user_id` | foreign id constrained users cascadeOnDelete | buyer |
| `status` | string length 40 | enum value, default `pending`, indexed |
| `order_number` | string length 40 unique | generated order id |
| `total_points` | unsigned integer | sum of item points |
| `recipient_name` | string length 80 | shipping recipient |
| `recipient_phone` | string length 30 | shipping phone |
| `postal_code` | string length 20 | shipping postal code |
| `address_line1` | string length 255 | shipping address |
| `address_line2` | string length 255 nullable | shipping address |
| `delivery_memo` | string length 255 nullable | shipping memo |
| `ordered_at` | timestamp nullable | set on checkout |
| `cancelled_at` | timestamp nullable | set on cancellation |
| `created_at`, `updated_at` | timestamps | Laravel defaults |

`point_mall_order_items` columns:

| Column | Type | Rule |
| --- | --- | --- |
| `id` | id | primary key |
| `point_mall_order_id` | foreign id constrained cascadeOnDelete | order |
| `point_mall_product_id` | foreign id nullable constrained nullOnDelete | product can be removed later |
| `product_name` | string length 160 | snapshot |
| `point_price` | unsigned integer | snapshot |
| `quantity` | unsigned integer | snapshot |
| `line_total_points` | unsigned integer | snapshot |
| `created_at`, `updated_at` | timestamps | Laravel defaults |

### Admin Audit

`admin_audit_logs` columns:

| Column | Type | Rule |
| --- | --- | --- |
| `id` | id | primary key |
| `actor_id` | foreign id nullable constrained users nullOnDelete | admin/planner/manager |
| `action` | string length 120 | action key |
| `subject_type` | string length 160 nullable | audited model class |
| `subject_id` | unsigned bigint nullable | audited model id |
| `before` | json nullable | previous values |
| `after` | json nullable | next values |
| `ip_address` | string length 45 nullable | request IP |
| `user_agent` | text nullable | request user agent |
| `created_at`, `updated_at` | timestamps | Laravel defaults |

## Enum Values

Implement enum files with these exact cases and values:

```php
<?php

namespace App\Enums;

enum UserRole: string
{
    case Member = 'member';
    case Planner = 'planner';
    case ConsultationManager = 'consultation_manager';
    case Admin = 'admin';
}
```

```php
<?php

namespace App\Enums;

enum ConsultationType: string
{
    case Product = 'product';
    case Checkup = 'checkup';
}
```

```php
<?php

namespace App\Enums;

enum ConsultationStatus: string
{
    case Received = 'received';
    case Assigned = 'assigned';
    case InProgress = 'in_progress';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
}
```

```php
<?php

namespace App\Enums;

enum KnowledgeQuestionStatus: string
{
    case Open = 'open';
    case Answered = 'answered';
    case Closed = 'closed';
}
```

```php
<?php

namespace App\Enums;

enum PointLedgerType: string
{
    case Earned = 'earned';
    case Spent = 'spent';
    case Refunded = 'refunded';
    case Adjusted = 'adjusted';
    case Expired = 'expired';
}
```

```php
<?php

namespace App\Enums;

enum PointMallOrderStatus: string
{
    case Pending = 'pending';
    case Paid = 'paid';
    case Preparing = 'preparing';
    case Shipped = 'shipped';
    case Delivered = 'delivered';
    case Cancelled = 'cancelled';
    case Refunded = 'refunded';
}
```

## Task 1: Enums And User Role Helpers

**Files:**

- Create: `app/Enums/UserRole.php`
- Create: `app/Enums/ConsultationType.php`
- Create: `app/Enums/ConsultationStatus.php`
- Create: `app/Enums/KnowledgeQuestionStatus.php`
- Create: `app/Enums/PointLedgerType.php`
- Create: `app/Enums/PointMallOrderStatus.php`
- Modify: `app/Models/User.php`
- Modify: `database/factories/UserFactory.php`
- Test: `tests/Feature/Domain/IdentityDomainTest.php`

- [ ] **Step 1: Write the failing identity test**

Create `tests/Feature/Domain/IdentityDomainTest.php`:

```php
<?php

namespace Tests\Feature\Domain;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IdentityDomainTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_role_casts_to_enum_and_defaults_to_member(): void
    {
        $user = User::factory()->create();

        $this->assertSame(UserRole::Member, $user->role);
        $this->assertTrue($user->isMember());
        $this->assertFalse($user->isPlanner());
        $this->assertFalse($user->isConsultationManager());
        $this->assertFalse($user->isAdmin());
    }

    public function test_role_helpers_identify_privileged_users(): void
    {
        $planner = User::factory()->planner()->create();
        $manager = User::factory()->consultationManager()->create();
        $admin = User::factory()->admin()->create();

        $this->assertTrue($planner->isPlanner());
        $this->assertTrue($manager->isConsultationManager());
        $this->assertTrue($admin->isAdmin());
        $this->assertTrue($admin->canAccessAdmin());
        $this->assertFalse(User::factory()->create()->canAccessAdmin());
    }
}
```

- [ ] **Step 2: Run the failing test**

Run:

```powershell
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan test tests/Feature/Domain/IdentityDomainTest.php
```

Expected: fail because `App\Enums\UserRole` and the user helpers do not exist.

- [ ] **Step 3: Add enum files**

Create all enum files listed in `Enum Values` with the exact code shown there.

- [ ] **Step 4: Add user profile migration**

Run:

```powershell
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan make:migration add_profile_fields_to_users_table --table=users
```

Replace the generated migration body with the user schema contract from this plan:

```php
public function up(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->string('role', 40)->default('member')->index()->after('password');
        $table->string('phone', 30)->nullable()->index()->after('email');
        $table->date('birth_date')->nullable()->after('phone');
        $table->string('gender', 20)->nullable()->after('birth_date');
        $table->string('postal_code', 20)->nullable()->after('gender');
        $table->string('address_line1')->nullable()->after('postal_code');
        $table->string('address_line2')->nullable()->after('address_line1');
        $table->timestamp('withdrawn_at')->nullable()->after('remember_token');
    });
}

public function down(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->dropColumn([
            'role',
            'phone',
            'birth_date',
            'gender',
            'postal_code',
            'address_line1',
            'address_line2',
            'withdrawn_at',
        ]);
    });
}
```

- [ ] **Step 5: Update `User` model**

Add role/profile fields to `$fillable`, cast `role` to `UserRole::class`, cast `birth_date` and `withdrawn_at`, and add helper methods:

```php
public function isMember(): bool
{
    return $this->role === UserRole::Member;
}

public function isPlanner(): bool
{
    return $this->role === UserRole::Planner;
}

public function isConsultationManager(): bool
{
    return $this->role === UserRole::ConsultationManager;
}

public function isAdmin(): bool
{
    return $this->role === UserRole::Admin;
}

public function canAccessAdmin(): bool
{
    return in_array($this->role, [
        UserRole::Planner,
        UserRole::ConsultationManager,
        UserRole::Admin,
    ], true);
}
```

- [ ] **Step 6: Update `UserFactory` states**

Add these states:

```php
public function planner(): static
{
    return $this->state(fn (array $attributes) => [
        'role' => UserRole::Planner,
    ]);
}

public function consultationManager(): static
{
    return $this->state(fn (array $attributes) => [
        'role' => UserRole::ConsultationManager,
    ]);
}

public function admin(): static
{
    return $this->state(fn (array $attributes) => [
        'role' => UserRole::Admin,
    ]);
}
```

- [ ] **Step 7: Run identity tests**

Run:

```powershell
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan test tests/Feature/Domain/IdentityDomainTest.php
```

Expected: all identity tests pass.

- [ ] **Step 8: Commit**

```powershell
git add app/Enums app/Models/User.php database/factories/UserFactory.php database/migrations tests/Feature/Domain/IdentityDomainTest.php
git commit -m "feat: add user domain roles"
```

## Task 2: Consultation Models

**Files:**

- Create: `app/Models/Consultation.php`
- Create: `app/Models/ConsultationStatusLog.php`
- Create: `database/migrations/*_create_consultations_table.php`
- Create: `database/migrations/*_create_consultation_status_logs_table.php`
- Create: `database/factories/ConsultationFactory.php`
- Modify: `app/Models/User.php`
- Test: `tests/Feature/Domain/ConsultationDomainTest.php`

- [ ] **Step 1: Write the failing consultation test**

Create `tests/Feature/Domain/ConsultationDomainTest.php`:

```php
<?php

namespace Tests\Feature\Domain;

use App\Enums\ConsultationStatus;
use App\Enums\ConsultationType;
use App\Models\Consultation;
use App\Models\ConsultationStatusLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConsultationDomainTest extends TestCase
{
    use RefreshDatabase;

    public function test_consultation_casts_status_type_and_links_people(): void
    {
        $member = User::factory()->create();
        $planner = User::factory()->planner()->create();

        $consultation = Consultation::factory()
            ->for($member, 'user')
            ->for($planner, 'assignedPlanner')
            ->create([
                'type' => ConsultationType::Checkup,
                'status' => ConsultationStatus::Assigned,
            ]);

        $this->assertSame(ConsultationType::Checkup, $consultation->type);
        $this->assertSame(ConsultationStatus::Assigned, $consultation->status);
        $this->assertTrue($consultation->user->is($member));
        $this->assertTrue($consultation->assignedPlanner->is($planner));
    }

    public function test_consultation_status_logs_keep_transition_history(): void
    {
        $planner = User::factory()->planner()->create();
        $consultation = Consultation::factory()->create([
            'status' => ConsultationStatus::Received,
        ]);

        $log = ConsultationStatusLog::create([
            'consultation_id' => $consultation->id,
            'actor_id' => $planner->id,
            'from_status' => ConsultationStatus::Received,
            'to_status' => ConsultationStatus::Completed,
            'memo' => '상담 완료',
        ]);

        $this->assertSame(ConsultationStatus::Received, $log->from_status);
        $this->assertSame(ConsultationStatus::Completed, $log->to_status);
        $this->assertTrue($log->actor->is($planner));
        $this->assertTrue($consultation->statusLogs()->first()->is($log));
    }
}
```

- [ ] **Step 2: Run the failing consultation test**

Run:

```powershell
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan test tests/Feature/Domain/ConsultationDomainTest.php
```

Expected: fail because consultation models and tables do not exist.

- [ ] **Step 3: Generate model, migration, and factory files**

Run:

```powershell
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan make:model Consultation -mf
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan make:model ConsultationStatusLog -m
```

- [ ] **Step 4: Implement migrations**

Use the exact column contracts from `Consultations`. Add indexes for `status`, `assigned_planner_id`, and `created_at` on `consultations`.

- [ ] **Step 5: Implement models**

`Consultation` must use `SoftDeletes`, cast `type`, `status`, consent/status timestamps, and expose relationships:

```php
public function user(): BelongsTo
public function assignedPlanner(): BelongsTo
public function statusLogs(): HasMany
```

`ConsultationStatusLog` must cast `from_status` and `to_status` to `ConsultationStatus::class` and expose:

```php
public function consultation(): BelongsTo
public function actor(): BelongsTo
```

- [ ] **Step 6: Implement factory**

`ConsultationFactory` default state:

```php
[
    'user_id' => User::factory(),
    'type' => ConsultationType::Product,
    'status' => ConsultationStatus::Received,
    'applicant_name' => fake()->name(),
    'phone' => '010'.fake()->numerify('########'),
    'birth_date' => fake()->date(),
    'current_monthly_premium' => fake()->numberBetween(50000, 300000),
    'interested_product' => '암보험',
    'preferred_contact_time' => '평일 오후',
    'memo' => fake()->sentence(),
    'privacy_agreed_at' => now(),
    'third_party_agreed_at' => now(),
]
```

- [ ] **Step 7: Add user relationships**

Add to `User`:

```php
public function consultations(): HasMany
public function assignedConsultations(): HasMany
```

- [ ] **Step 8: Run consultation tests**

Run:

```powershell
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan test tests/Feature/Domain/ConsultationDomainTest.php
```

Expected: consultation tests pass.

- [ ] **Step 9: Commit**

```powershell
git add app/Models database/factories database/migrations tests/Feature/Domain/ConsultationDomainTest.php
git commit -m "feat: add consultation domain models"
```

## Task 3: Knowledge Q&A Models

**Files:**

- Create: `app/Models/KnowledgeQuestion.php`
- Create: `app/Models/KnowledgeAnswer.php`
- Create: `database/migrations/*_create_knowledge_questions_table.php`
- Create: `database/migrations/*_create_knowledge_answers_table.php`
- Create: `database/factories/KnowledgeQuestionFactory.php`
- Create: `database/factories/KnowledgeAnswerFactory.php`
- Modify: `app/Models/User.php`
- Test: `tests/Feature/Domain/KnowledgeDomainTest.php`

- [ ] **Step 1: Write the failing knowledge test**

Create `tests/Feature/Domain/KnowledgeDomainTest.php`:

```php
<?php

namespace Tests\Feature\Domain;

use App\Enums\KnowledgeQuestionStatus;
use App\Models\KnowledgeAnswer;
use App\Models\KnowledgeQuestion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Database\QueryException;
use Tests\TestCase;

class KnowledgeDomainTest extends TestCase
{
    use RefreshDatabase;

    public function test_question_belongs_to_member_and_answer_belongs_to_manager(): void
    {
        $member = User::factory()->create();
        $manager = User::factory()->consultationManager()->create();

        $question = KnowledgeQuestion::factory()->for($member, 'user')->create([
            'status' => KnowledgeQuestionStatus::Open,
        ]);

        $answer = KnowledgeAnswer::factory()
            ->for($question, 'question')
            ->for($manager, 'manager')
            ->create();

        $this->assertSame(KnowledgeQuestionStatus::Open, $question->status);
        $this->assertTrue($question->user->is($member));
        $this->assertTrue($question->answer->is($answer));
        $this->assertTrue($answer->manager->is($manager));
    }

    public function test_question_accepts_only_one_answer(): void
    {
        $question = KnowledgeQuestion::factory()->create();

        KnowledgeAnswer::factory()->for($question, 'question')->create();

        $this->expectException(QueryException::class);
        KnowledgeAnswer::factory()->for($question, 'question')->create();
    }
}
```

- [ ] **Step 2: Run the failing knowledge test**

Run:

```powershell
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan test tests/Feature/Domain/KnowledgeDomainTest.php
```

Expected: fail because knowledge models and tables do not exist.

- [ ] **Step 3: Generate files**

Run:

```powershell
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan make:model KnowledgeQuestion -mf
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan make:model KnowledgeAnswer -mf
```

- [ ] **Step 4: Implement migrations**

Use the exact column contracts from `Knowledge Q&A`. Add the unique index on `knowledge_answers.knowledge_question_id`.

- [ ] **Step 5: Implement models**

`KnowledgeQuestion` must use `SoftDeletes`, cast `status` and `answered_at`, and expose:

```php
public function user(): BelongsTo
public function assignedManager(): BelongsTo
public function answer(): HasOne
```

`KnowledgeAnswer` must expose:

```php
public function question(): BelongsTo
public function manager(): BelongsTo
```

- [ ] **Step 6: Implement factories**

`KnowledgeQuestionFactory` default state:

```php
[
    'user_id' => User::factory(),
    'status' => KnowledgeQuestionStatus::Open,
    'title' => '보험 리모델링 상담이 필요합니다',
    'body' => fake()->paragraph(),
]
```

`KnowledgeAnswerFactory` default state:

```php
[
    'knowledge_question_id' => KnowledgeQuestion::factory(),
    'manager_id' => User::factory()->consultationManager(),
    'body' => fake()->paragraph(),
]
```

- [ ] **Step 7: Add user relationships**

Add to `User`:

```php
public function knowledgeQuestions(): HasMany
public function assignedKnowledgeQuestions(): HasMany
public function knowledgeAnswers(): HasMany
```

- [ ] **Step 8: Run knowledge tests**

Run:

```powershell
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan test tests/Feature/Domain/KnowledgeDomainTest.php
```

Expected: knowledge tests pass.

- [ ] **Step 9: Commit**

```powershell
git add app/Models database/factories database/migrations tests/Feature/Domain/KnowledgeDomainTest.php
git commit -m "feat: add insurance qna domain models"
```

## Task 4: Events And Point Ledger Models

**Files:**

- Create: `app/Models/Event.php`
- Create: `app/Models/PointLedgerEntry.php`
- Create: `database/migrations/*_create_events_table.php`
- Create: `database/migrations/*_create_point_ledger_entries_table.php`
- Create: `database/factories/EventFactory.php`
- Create: `database/factories/PointLedgerEntryFactory.php`
- Create: `database/seeders/EventSeeder.php`
- Modify: `database/seeders/DatabaseSeeder.php`
- Modify: `app/Models/User.php`
- Test: `tests/Feature/Domain/PointLedgerDomainTest.php`

- [ ] **Step 1: Write the failing point ledger test**

Create `tests/Feature/Domain/PointLedgerDomainTest.php`:

```php
<?php

namespace Tests\Feature\Domain;

use App\Enums\PointLedgerType;
use App\Models\Event;
use App\Models\PointLedgerEntry;
use App\Models\User;
use Database\Seeders\EventSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Database\QueryException;
use Tests\TestCase;

class PointLedgerDomainTest extends TestCase
{
    use RefreshDatabase;

    public function test_event_seeder_creates_default_point_events(): void
    {
        $this->seed(EventSeeder::class);

        $this->assertDatabaseHas('events', [
            'slug' => 'signup_bonus',
            'point_amount' => 1000,
            'is_active' => true,
        ]);
        $this->assertDatabaseHas('events', [
            'slug' => 'consultation_completed_bonus',
            'point_amount' => 1000,
            'is_active' => true,
        ]);
    }

    public function test_ledger_entries_are_signed_and_idempotent(): void
    {
        $user = User::factory()->create();
        $event = Event::factory()->create(['slug' => 'signup_bonus']);

        $entry = PointLedgerEntry::factory()->for($user)->for($event)->create([
            'type' => PointLedgerType::Earned,
            'points' => 1000,
            'balance_after' => 1000,
            'idempotency_key' => 'signup:'.$user->id,
        ]);

        $this->assertSame(PointLedgerType::Earned, $entry->type);
        $this->assertSame(1000, $user->pointLedgerEntries()->sum('points'));

        $this->expectException(QueryException::class);
        PointLedgerEntry::factory()->for($user)->for($event)->create([
            'idempotency_key' => 'signup:'.$user->id,
        ]);
    }
}
```

- [ ] **Step 2: Run the failing point ledger test**

Run:

```powershell
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan test tests/Feature/Domain/PointLedgerDomainTest.php
```

Expected: fail because events and ledger models do not exist.

- [ ] **Step 3: Generate files**

Run:

```powershell
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan make:model Event -mf
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan make:model PointLedgerEntry -mf
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan make:seeder EventSeeder
```

- [ ] **Step 4: Implement migrations**

Use the exact column contracts from `Events And Point Ledger`. Create `events` before `point_ledger_entries`.

- [ ] **Step 5: Implement models**

`Event` must cast `is_active`, `starts_at`, and `ends_at`, and expose:

```php
public function pointLedgerEntries(): HasMany
```

`PointLedgerEntry` must cast `type` to `PointLedgerType::class` and expose:

```php
public function user(): BelongsTo
public function event(): BelongsTo
public function order(): BelongsTo
public function createdBy(): BelongsTo
```

- [ ] **Step 6: Implement factories and seeders**

`EventSeeder` must upsert exactly these default rows by `slug`:

```php
[
    [
        'slug' => 'signup_bonus',
        'name' => '회원가입 적립',
        'trigger_type' => 'member.registered',
        'point_amount' => 1000,
        'is_active' => true,
    ],
    [
        'slug' => 'consultation_completed_bonus',
        'name' => '상담완료 적립',
        'trigger_type' => 'consultation.completed',
        'point_amount' => 1000,
        'is_active' => true,
    ],
]
```

`DatabaseSeeder` must call `EventSeeder::class`.

- [ ] **Step 7: Add user relationship**

Add to `User`:

```php
public function pointLedgerEntries(): HasMany
```

- [ ] **Step 8: Run point ledger tests**

Run:

```powershell
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan test tests/Feature/Domain/PointLedgerDomainTest.php
```

Expected: point ledger tests pass.

- [ ] **Step 9: Commit**

```powershell
git add app/Models database/factories database/migrations database/seeders tests/Feature/Domain/PointLedgerDomainTest.php
git commit -m "feat: add point event ledger domain"
```

## Task 5: Point Mall Models

**Files:**

- Create: `app/Models/PointMallCategory.php`
- Create: `app/Models/PointMallProduct.php`
- Create: `app/Models/PointMallCart.php`
- Create: `app/Models/PointMallCartItem.php`
- Create: `app/Models/PointMallOrder.php`
- Create: `app/Models/PointMallOrderItem.php`
- Create: `database/migrations/*_create_point_mall_categories_table.php`
- Create: `database/migrations/*_create_point_mall_products_table.php`
- Create: `database/migrations/*_create_point_mall_carts_table.php`
- Create: `database/migrations/*_create_point_mall_cart_items_table.php`
- Create: `database/migrations/*_create_point_mall_orders_table.php`
- Create: `database/migrations/*_create_point_mall_order_items_table.php`
- Create: `database/migrations/*_add_order_foreign_to_point_ledger_entries_table.php`
- Create: `database/factories/PointMallCategoryFactory.php`
- Create: `database/factories/PointMallProductFactory.php`
- Create: `database/factories/PointMallOrderFactory.php`
- Create: `database/seeders/PointMallCategorySeeder.php`
- Modify: `database/seeders/DatabaseSeeder.php`
- Modify: `app/Models/User.php`
- Test: `tests/Feature/Domain/PointMallDomainTest.php`

- [ ] **Step 1: Write the failing point mall test**

Create `tests/Feature/Domain/PointMallDomainTest.php`:

```php
<?php

namespace Tests\Feature\Domain;

use App\Enums\PointMallOrderStatus;
use App\Models\PointMallCart;
use App\Models\PointMallCartItem;
use App\Models\PointMallCategory;
use App\Models\PointMallOrder;
use App\Models\PointMallOrderItem;
use App\Models\PointMallProduct;
use App\Models\User;
use Database\Seeders\PointMallCategorySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PointMallDomainTest extends TestCase
{
    use RefreshDatabase;

    public function test_category_seeder_creates_required_korean_categories(): void
    {
        $this->seed(PointMallCategorySeeder::class);

        foreach (['kitchen', 'health-food', 'mobile-accessories', 'goods'] as $slug) {
            $this->assertDatabaseHas('point_mall_categories', ['slug' => $slug]);
        }
    }

    public function test_cart_and_order_relationships_keep_product_snapshots(): void
    {
        $user = User::factory()->create();
        $category = PointMallCategory::factory()->create();
        $product = PointMallProduct::factory()->for($category, 'category')->create([
            'name' => '멀티 충전 케이블',
            'point_price' => 3000,
        ]);

        $cart = PointMallCart::create(['user_id' => $user->id]);
        PointMallCartItem::create([
            'point_mall_cart_id' => $cart->id,
            'point_mall_product_id' => $product->id,
            'quantity' => 2,
        ]);

        $order = PointMallOrder::factory()->for($user)->create([
            'status' => PointMallOrderStatus::Paid,
            'total_points' => 6000,
        ]);
        $item = PointMallOrderItem::create([
            'point_mall_order_id' => $order->id,
            'point_mall_product_id' => $product->id,
            'product_name' => $product->name,
            'point_price' => $product->point_price,
            'quantity' => 2,
            'line_total_points' => 6000,
        ]);

        $this->assertSame(PointMallOrderStatus::Paid, $order->status);
        $this->assertTrue($cart->items()->first()->product->is($product));
        $this->assertSame('멀티 충전 케이블', $item->product_name);
        $this->assertTrue($order->items()->first()->is($item));
    }
}
```

- [ ] **Step 2: Run the failing point mall test**

Run:

```powershell
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan test tests/Feature/Domain/PointMallDomainTest.php
```

Expected: fail because point mall models and tables do not exist.

- [ ] **Step 3: Generate files**

Run:

```powershell
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan make:model PointMallCategory -mf
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan make:model PointMallProduct -mf
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan make:model PointMallCart -m
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan make:model PointMallCartItem -m
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan make:model PointMallOrder -mf
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan make:model PointMallOrderItem -m
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan make:seeder PointMallCategorySeeder
```

- [ ] **Step 4: Implement migrations**

Use the exact column contracts from `Point Mall`. Create tables in this order: categories, products, carts, cart items, orders, order items. After `point_mall_orders` exists, add the point ledger order foreign key:

```php
Schema::table('point_ledger_entries', function (Blueprint $table) {
    $table->foreign('order_id')
        ->references('id')
        ->on('point_mall_orders')
        ->nullOnDelete();
});
```

The rollback must drop that foreign key before `point_mall_orders` is dropped:

```php
Schema::table('point_ledger_entries', function (Blueprint $table) {
    $table->dropForeign(['order_id']);
});
```

- [ ] **Step 5: Implement models**

Relationships:

```php
PointMallCategory::products(): HasMany
PointMallProduct::category(): BelongsTo
PointMallProduct::cartItems(): HasMany
PointMallProduct::orderItems(): HasMany
PointMallCart::user(): BelongsTo
PointMallCart::items(): HasMany
PointMallCartItem::cart(): BelongsTo
PointMallCartItem::product(): BelongsTo
PointMallOrder::user(): BelongsTo
PointMallOrder::items(): HasMany
PointMallOrderItem::order(): BelongsTo
PointMallOrderItem::product(): BelongsTo
```

`PointMallProduct` must use `SoftDeletes`. `PointMallOrder` must cast `status` to `PointMallOrderStatus::class` and cast `ordered_at`, `cancelled_at`.

- [ ] **Step 6: Implement seeders**

`PointMallCategorySeeder` must upsert exactly these rows by `slug`:

```php
[
    ['name' => '주방용품', 'slug' => 'kitchen', 'sort_order' => 10, 'is_active' => true],
    ['name' => '건강식품', 'slug' => 'health-food', 'sort_order' => 20, 'is_active' => true],
    ['name' => '휴대폰 주변기기', 'slug' => 'mobile-accessories', 'sort_order' => 30, 'is_active' => true],
    ['name' => '잡화', 'slug' => 'goods', 'sort_order' => 40, 'is_active' => true],
]
```

`DatabaseSeeder` must call `PointMallCategorySeeder::class`.

- [ ] **Step 7: Add user relationships**

Add to `User`:

```php
public function pointMallCart(): HasOne
public function pointMallOrders(): HasMany
```

- [ ] **Step 8: Run point mall tests**

Run:

```powershell
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan test tests/Feature/Domain/PointMallDomainTest.php
```

Expected: point mall tests pass.

- [ ] **Step 9: Commit**

```powershell
git add app/Models database/factories database/migrations database/seeders tests/Feature/Domain/PointMallDomainTest.php
git commit -m "feat: add point mall domain models"
```

## Task 6: Admin Audit Domain

**Files:**

- Create: `app/Models/AdminAuditLog.php`
- Create: `database/migrations/*_create_admin_audit_logs_table.php`
- Create: `database/factories/AdminAuditLogFactory.php`
- Modify: `app/Models/User.php`
- Test: `tests/Feature/Domain/AdminAuditDomainTest.php`

- [ ] **Step 1: Write the failing admin audit test**

Create `tests/Feature/Domain/AdminAuditDomainTest.php`:

```php
<?php

namespace Tests\Feature\Domain;

use App\Models\AdminAuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAuditDomainTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_audit_log_casts_before_after_payloads_and_links_actor(): void
    {
        $admin = User::factory()->admin()->create();

        $log = AdminAuditLog::factory()->for($admin, 'actor')->create([
            'action' => 'point.adjusted',
            'subject_type' => User::class,
            'subject_id' => $admin->id,
            'before' => ['points' => 1000],
            'after' => ['points' => 1500],
        ]);

        $this->assertTrue($log->actor->is($admin));
        $this->assertSame(['points' => 1000], $log->before);
        $this->assertSame(['points' => 1500], $log->after);
        $this->assertTrue($admin->adminAuditLogs()->first()->is($log));
    }
}
```

- [ ] **Step 2: Run the failing admin audit test**

Run:

```powershell
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan test tests/Feature/Domain/AdminAuditDomainTest.php
```

Expected: fail because admin audit model and table do not exist.

- [ ] **Step 3: Generate files**

Run:

```powershell
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan make:model AdminAuditLog -mf
```

- [ ] **Step 4: Implement migration**

Use the exact column contract from `Admin Audit`. Add an index on `actor_id`, and a composite index on `subject_type, subject_id`.

- [ ] **Step 5: Implement model and factory**

`AdminAuditLog` must cast `before` and `after` to arrays and expose:

```php
public function actor(): BelongsTo
```

`AdminAuditLogFactory` default state:

```php
[
    'actor_id' => User::factory()->admin(),
    'action' => 'admin.changed',
    'subject_type' => User::class,
    'subject_id' => 1,
    'before' => ['state' => 'before'],
    'after' => ['state' => 'after'],
    'ip_address' => '127.0.0.1',
    'user_agent' => 'PHPUnit',
]
```

- [ ] **Step 6: Add user relationship**

Add to `User`:

```php
public function adminAuditLogs(): HasMany
```

- [ ] **Step 7: Run admin audit tests**

Run:

```powershell
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan test tests/Feature/Domain/AdminAuditDomainTest.php
```

Expected: admin audit tests pass.

- [ ] **Step 8: Commit**

```powershell
git add app/Models database/factories database/migrations tests/Feature/Domain/AdminAuditDomainTest.php
git commit -m "feat: add admin audit domain model"
```

## Task 7: Full Domain Verification

**Files:**

- Modify only if verification exposes a concrete defect in files from Tasks 1-6.

- [ ] **Step 1: Run all domain tests**

Run:

```powershell
$env:Path += ";$env:USERPROFILE\.config\herd\bin"; php artisan test tests/Feature/Domain
```

Expected: all domain tests pass.

- [ ] **Step 2: Run full project verification**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify.ps1
```

Expected:

- Composer validation passes.
- Laravel test suite passes.
- Vite production build passes.
- Playwright remains skipped until Playwright config exists.

- [ ] **Step 3: Review git status**

Run:

```powershell
git -c safe.directory=C:/Project/bohumcc status --short
```

Expected: only intentional domain model files are modified or staged. `배너+폼_예시/` may remain untracked and must not be staged.

- [ ] **Step 4: Commit final verification fixes**

If Task 7 required fixes after the previous task commits, commit them:

```powershell
git add app database tests
git commit -m "test: verify domain model foundation"
```

If Task 7 required no fixes, do not create an empty commit.

## Review Checklist

- User roles include member, planner, consultation manager, and admin.
- Admin access helper includes planner, consultation manager, and admin.
- Admin CMS insurance product management is absent from the domain.
- Consultations support product consultation and insurance checkup.
- Planner assignment and consultation completion/cancellation history are modeled.
- Insurance Q&A has public title and private body/answer data structure.
- Q&A answer is one-to-one with a question.
- Signup and consultation completion events default to 1000 points.
- Point ledger supports signed immutable point movements and idempotency keys.
- Point mall categories match the revised sheet: 주방용품, 건강식품, 휴대폰 주변기기, 잡화.
- Point mall order items snapshot product name and point price.
- Admin audit logs can capture before/after payloads.
- Full verification passes before the implementation is complete.
