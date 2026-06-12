<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PointLedgerType;
use App\Http\Controllers\Controller;
use App\Models\PointLedgerEntry;
use App\Models\User;
use App\Services\AdminAuditLogger;
use App\Services\PointLedgerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Inertia\Inertia;
use Inertia\Response;

class MemberManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeAdmin($request);

        $search = trim((string) $request->query('search', ''));
        $hasSocialAccountsTable = Schema::hasTable('social_accounts');

        $members = User::query()
            ->where('role', 'member')
            ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            }))
            ->when($hasSocialAccountsTable, fn ($query) => $query->with('socialAccounts:id,user_id,provider'))
            ->withCount(['consultations', 'knowledgeQuestions', 'pointMallOrders'])
            ->withSum('pointLedgerEntries as point_balance', 'points')
            ->latest()
            ->get()
            ->map(fn (User $member) => [
                'id' => $member->id,
                'name' => $member->name,
                'email' => $member->email,
                'phone' => $member->phone,
                'signupProvider' => $hasSocialAccountsTable ? $this->signupProvider($member) : 'email',
                'birthDate' => $member->birth_date?->format('Y-m-d'),
                'gender' => $member->gender,
                'postalCode' => $member->postal_code,
                'address' => trim(collect([$member->address_line1, $member->address_line2])->filter()->implode(' ')),
                'pointBalance' => (int) ($member->point_balance ?? 0),
                'consultationCount' => $member->consultations_count,
                'questionCount' => $member->knowledge_questions_count,
                'orderCount' => $member->point_mall_orders_count,
                'joinedAt' => $member->created_at?->format('Y-m-d'),
            ])
            ->values();

        return Inertia::render('Admin/Members/Index', [
            'members' => $members,
            'filters' => ['search' => $search],
            'canAdjustPoints' => $request->user()?->isAdmin() ?? false,
            'recentAdjustments' => PointLedgerEntry::query()
                ->with(['user:id,name,email', 'createdBy:id,name'])
                ->where('type', PointLedgerType::Adjusted)
                ->latest()
                ->take(10)
                ->get()
                ->map(fn (PointLedgerEntry $entry) => [
                    'id' => $entry->id,
                    'memberName' => $entry->user?->name,
                    'memberEmail' => $entry->user?->email,
                    'actorName' => $entry->createdBy?->name,
                    'points' => $entry->points,
                    'balanceAfter' => $entry->balance_after,
                    'memo' => $entry->memo,
                    'createdAt' => $entry->created_at?->format('Y-m-d H:i'),
                ])
                ->values(),
        ]);
    }

    public function show(Request $request, User $member): Response
    {
        $this->authorizeAdmin($request);
        abort_unless($member->isMember(), 404);

        $member->loadCount(['consultations', 'knowledgeQuestions', 'pointMallOrders'])
            ->loadSum('pointLedgerEntries as point_balance', 'points');

        return Inertia::render('Admin/Members/Show', [
            'member' => $this->serializeMember($member),
            'canAdjustPoints' => $request->user()?->isAdmin() ?? false,
            'recentAdjustments' => PointLedgerEntry::query()
                ->with(['createdBy:id,name'])
                ->where('type', PointLedgerType::Adjusted)
                ->where('user_id', $member->id)
                ->latest()
                ->take(10)
                ->get()
                ->map(fn (PointLedgerEntry $entry) => [
                    'id' => $entry->id,
                    'actorName' => $entry->createdBy?->name,
                    'points' => $entry->points,
                    'balanceAfter' => $entry->balance_after,
                    'memo' => $entry->memo,
                    'createdAt' => $entry->created_at?->format('Y-m-d H:i'),
                ])
                ->values(),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $this->authorizeAdmin($request);

        $search = trim((string) $request->query('search', ''));
        $members = $this->memberQuery($search)
            ->withSum('pointLedgerEntries as point_balance', 'points')
            ->latest()
            ->get();

        return response()->streamDownload(function () use ($members) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, [
                'name',
                'email',
                'phone',
                'birth_date',
                'gender',
                'postal_code',
                'address',
                'point_balance',
                'joined_at',
            ]);

            foreach ($members as $member) {
                fputcsv($handle, [
                    $member->name,
                    $member->email,
                    $member->phone,
                    $member->birth_date?->format('Y-m-d'),
                    $member->gender,
                    $member->postal_code,
                    trim(collect([$member->address_line1, $member->address_line2])->filter()->implode(' ')),
                    (int) ($member->point_balance ?? 0),
                    $member->created_at?->format('Y-m-d'),
                ]);
            }

            fclose($handle);
        }, 'members.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function adjustPoints(
        Request $request,
        User $member,
        PointLedgerService $pointLedger,
        AdminAuditLogger $audit
    ): RedirectResponse
    {
        $this->authorizeAdmin($request);
        abort_unless($request->user()?->isAdmin(), 403);
        abort_unless($member->isMember(), 404);

        $validated = $request->validate([
            'points' => ['required', 'integer', 'not_in:0', 'min:-1000000', 'max:1000000'],
            'memo' => ['required', 'string', 'max:160'],
        ]);

        $beforeBalance = (int) $member->pointLedgerEntries()->sum('points');
        $entry = $pointLedger->adjustManually($member, $request->user(), $validated['points'], $validated['memo']);

        $audit->record($request, 'member.points_adjusted', $member, [
            'point_balance' => $beforeBalance,
        ], [
            'point_balance' => $entry->balance_after,
            'points' => $entry->points,
            'memo' => $entry->memo,
            'ledger_entry_id' => $entry->id,
        ]);

        $referer = (string) $request->headers->get('referer', '');
        $redirect = str_contains($referer, "/admin/members/{$member->id}")
            ? redirect()->route('admin.members.show', $member)
            : redirect()->route('admin.members.index', $request->only('search'));

        return $redirect->with('success', '포인트가 조정되었습니다.');
    }

    private function authorizeAdmin(Request $request): void
    {
        abort_unless($request->user()?->isAdmin(), 403);
    }

    private function memberQuery(string $search)
    {
        return User::query()
            ->where('role', 'member')
            ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            }));
    }

    private function serializeMember(User $member): array
    {
        return [
            'id' => $member->id,
            'name' => $member->name,
            'email' => $member->email,
            'phone' => $member->phone,
            'birthDate' => $member->birth_date?->format('Y-m-d'),
            'gender' => $member->gender,
            'postalCode' => $member->postal_code,
            'address' => trim(collect([$member->address_line1, $member->address_line2])->filter()->implode(' ')),
            'pointBalance' => (int) ($member->point_balance ?? 0),
            'consultationCount' => $member->consultations_count,
            'questionCount' => $member->knowledge_questions_count,
            'orderCount' => $member->point_mall_orders_count,
            'joinedAt' => $member->created_at?->format('Y-m-d'),
        ];
    }

    private function signupProvider(User $member): string
    {
        $providers = $member->socialAccounts
            ->pluck('provider')
            ->map(fn ($provider) => (string) $provider)
            ->all();

        if (in_array('kakao', $providers, true)) {
            return 'kakao';
        }

        if (in_array('naver', $providers, true)) {
            return 'naver';
        }

        return 'email';
    }
}
