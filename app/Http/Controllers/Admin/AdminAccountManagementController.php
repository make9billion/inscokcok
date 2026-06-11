<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AdminAuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminAccountManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeFullAdmin($request);

        return Inertia::render('Admin/Accounts/Index', [
            'accounts' => User::query()
                ->where(function ($query) {
                    $query->whereIn('role', [UserRole::Admin, UserRole::Planner])
                        ->orWhereNotNull('admin_approval_status');
                })
                ->orderByRaw("case admin_approval_status when 'pending' then 0 when 'approved' then 1 when 'rejected' then 2 else 3 end")
                ->orderBy('role')
                ->orderBy('name')
                ->get()
                ->map(fn (User $user) => $this->serializeAccount($user)),
            'roleOptions' => $this->roleOptions(),
        ]);
    }

    public function show(Request $request, User $account): Response
    {
        $this->authorizeFullAdmin($request);
        abort_unless($this->isManagedAccount($account), 404);

        return Inertia::render('Admin/Accounts/Show', [
            'account' => $this->serializeAccount($account),
            'roleOptions' => $this->roleOptions(),
            'approvalOptions' => [
                ['value' => 'pending', 'label' => '승인대기'],
                ['value' => 'approved', 'label' => '승인완료'],
                ['value' => 'rejected', 'label' => '반려'],
            ],
        ]);
    }

    public function store(Request $request, AdminAuditLogger $audit): RedirectResponse
    {
        $this->authorizeFullAdmin($request);

        $validated = $request->validate([
            'username' => ['required', 'string', 'alpha_dash', 'max:40', 'unique:users,username'],
            'password' => ['required', 'string', 'min:8', 'max:100'],
            'name' => ['required', 'string', 'max:80'],
            'phone' => ['required', 'string', 'max:30'],
            'organization' => ['required', 'string', 'max:120'],
            'role' => ['required', Rule::in($this->managedRoleValues())],
        ]);

        $account = User::create([
            'username' => $validated['username'],
            'email' => $validated['username'].'@admin.local',
            'password' => Hash::make($validated['password']),
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'organization' => $validated['organization'],
            'role' => UserRole::from($validated['role']),
            'admin_approval_status' => 'approved',
            'admin_requested_role' => $validated['role'],
            'admin_approved_at' => now(),
            'admin_approved_by' => $request->user()->id,
        ]);

        $audit->record($request, 'admin_account.created', $account, null, $this->auditSnapshot($account));

        return redirect()
            ->route('admin.accounts.index')
            ->with('success', '관리자 계정을 생성했습니다.');
    }

    public function update(Request $request, User $account, AdminAuditLogger $audit): RedirectResponse
    {
        $this->authorizeFullAdmin($request);
        abort_unless($this->isManagedAccount($account), 404);

        $validated = $request->validate([
            'role' => ['required', Rule::in($this->managedRoleValues())],
            'organization' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:30'],
            'approval_status' => ['required', Rule::in(['pending', 'approved', 'rejected'])],
        ]);

        $before = $this->auditSnapshot($account);
        $approvalStatus = $validated['approval_status'];

        $updates = [
            'organization' => $validated['organization'],
            'phone' => $validated['phone'],
            'admin_approval_status' => $approvalStatus,
            'admin_requested_role' => $validated['role'],
        ];

        if ($approvalStatus === 'approved') {
            $updates['role'] = UserRole::from($validated['role']);
            $updates['admin_approved_at'] = now();
            $updates['admin_approved_by'] = $request->user()->id;
        } elseif ($approvalStatus === 'rejected') {
            $updates['role'] = UserRole::Member;
            $updates['admin_approved_at'] = null;
            $updates['admin_approved_by'] = null;
        }

        $account->update($updates);

        $audit->record($request, 'admin_account.updated', $account, $before, $this->auditSnapshot($account->refresh()));

        return redirect()
            ->route('admin.accounts.index')
            ->with('success', '관리자 계정 상태를 저장했습니다.');
    }

    public function destroy(Request $request, User $account, AdminAuditLogger $audit): RedirectResponse
    {
        $this->authorizeFullAdmin($request);
        abort_unless($this->isManagedAccount($account), 404);
        abort_if($request->user()->id === $account->id, 403);

        $audit->record($request, 'admin_account.deleted', $account, $this->auditSnapshot($account), null);
        $account->delete();

        return redirect()
            ->route('admin.accounts.index')
            ->with('success', '관리자 계정을 삭제했습니다.');
    }

    private function serializeAccount(User $user): array
    {
        $requestedRole = $user->admin_requested_role ?: $user->role->value;

        return [
            'id' => $user->id,
            'username' => $user->username,
            'name' => $user->name,
            'phone' => $user->phone,
            'organization' => $user->organization,
            'role' => in_array($user->role, [UserRole::Admin, UserRole::Planner], true) ? $user->role->value : $requestedRole,
            'roleLabel' => $this->roleLabel(UserRole::from($requestedRole)),
            'approvalStatus' => $user->admin_approval_status ?? 'approved',
            'approvalStatusLabel' => $this->approvalStatusLabel($user->admin_approval_status ?? 'approved'),
            'requestedRole' => $requestedRole,
            'approvedAt' => $user->admin_approved_at?->format('Y-m-d H:i'),
            'createdAt' => $user->created_at?->format('Y-m-d'),
        ];
    }

    private function roleOptions(): array
    {
        return collect($this->managedRoleValues())
            ->map(fn (string $value) => [
                'value' => $value,
                'label' => $this->roleLabel(UserRole::from($value)),
            ])
            ->all();
    }

    private function managedRoleValues(): array
    {
        return [
            UserRole::Admin->value,
            UserRole::Planner->value,
        ];
    }

    private function roleLabel(UserRole $role): string
    {
        return match ($role) {
            UserRole::Admin => '전체권한',
            UserRole::Planner => '설계사권한',
            UserRole::Member => '회원',
        };
    }

    private function approvalStatusLabel(string $status): string
    {
        return match ($status) {
            'pending' => '승인대기',
            'approved' => '승인완료',
            'rejected' => '반려',
            default => '승인완료',
        };
    }

    private function isManagedAccount(User $user): bool
    {
        return in_array($user->role, [UserRole::Admin, UserRole::Planner], true)
            || $user->admin_approval_status !== null;
    }

    private function auditSnapshot(User $user): array
    {
        return [
            'username' => $user->username,
            'name' => $user->name,
            'phone' => $user->phone,
            'organization' => $user->organization,
            'role' => $user->role->value,
            'admin_approval_status' => $user->admin_approval_status,
            'admin_requested_role' => $user->admin_requested_role,
        ];
    }

    private function authorizeFullAdmin(Request $request): void
    {
        abort_unless($request->user()?->isAdmin(), 403);
    }
}
