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
                ->whereIn('role', [UserRole::Admin, UserRole::Planner])
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
        abort_unless(in_array($account->role, [UserRole::Admin, UserRole::Planner], true), 404);

        return Inertia::render('Admin/Accounts/Show', [
            'account' => $this->serializeAccount($account),
            'roleOptions' => $this->roleOptions(),
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
        ]);

        $audit->record($request, 'admin_account.created', $account, null, [
            'username' => $account->username,
            'name' => $account->name,
            'phone' => $account->phone,
            'organization' => $account->organization,
            'role' => $account->role->value,
        ]);

        return redirect()
            ->route('admin.accounts.index')
            ->with('success', '관리자 계정이 생성되었습니다.');
    }

    public function update(Request $request, User $account, AdminAuditLogger $audit): RedirectResponse
    {
        $this->authorizeFullAdmin($request);
        abort_unless(in_array($account->role, [UserRole::Admin, UserRole::Planner], true), 404);

        $validated = $request->validate([
            'role' => ['required', Rule::in($this->managedRoleValues())],
            'organization' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:30'],
        ]);

        $before = [
            'role' => $account->role->value,
            'organization' => $account->organization,
            'phone' => $account->phone,
        ];

        $account->update([
            'role' => UserRole::from($validated['role']),
            'organization' => $validated['organization'],
            'phone' => $validated['phone'],
        ]);

        $audit->record($request, 'admin_account.updated', $account, $before, [
            'role' => $account->role->value,
            'organization' => $account->organization,
            'phone' => $account->phone,
        ]);

        return redirect()
            ->route('admin.accounts.index')
            ->with('success', '관리자 권한이 저장되었습니다.');
    }

    public function destroy(Request $request, User $account, AdminAuditLogger $audit): RedirectResponse
    {
        $this->authorizeFullAdmin($request);
        abort_unless(in_array($account->role, [UserRole::Admin, UserRole::Planner], true), 404);
        abort_if($request->user()->id === $account->id, 403);

        $before = [
            'username' => $account->username,
            'name' => $account->name,
            'phone' => $account->phone,
            'organization' => $account->organization,
            'role' => $account->role->value,
        ];

        $audit->record($request, 'admin_account.deleted', $account, $before, null);
        $account->delete();

        return redirect()
            ->route('admin.accounts.index')
            ->with('success', '관리자 계정을 삭제했습니다.');
    }

    private function serializeAccount(User $user): array
    {
        return [
            'id' => $user->id,
            'username' => $user->username,
            'name' => $user->name,
            'phone' => $user->phone,
            'organization' => $user->organization,
            'role' => $user->role->value,
            'roleLabel' => $this->roleLabel($user->role),
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

    private function authorizeFullAdmin(Request $request): void
    {
        abort_unless($request->user()?->isAdmin(), 403);
    }
}
