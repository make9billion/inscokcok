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
use Inertia\Inertia;
use Inertia\Response;

class MemberManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeAdmin($request);

        $search = trim((string) $request->query('search', ''));

        $members = User::query()
            ->where('role', 'member')
            ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            }))
            ->withCount(['consultations', 'knowledgeQuestions', 'pointMallOrders'])
            ->withSum('pointLedgerEntries as point_balance', 'points')
            ->latest()
            ->get()
            ->map(fn (User $member) => [
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

        return redirect()
            ->route('admin.members.index', $request->only('search'))
            ->with('success', '포인트가 조정되었습니다.');
    }

    private function authorizeAdmin(Request $request): void
    {
        abort_unless($request->user()?->isAdmin(), 403);
    }
}
