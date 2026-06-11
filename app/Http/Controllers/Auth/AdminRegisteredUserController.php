<?php

namespace App\Http\Controllers\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class AdminRegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/AdminRegister', [
            'status' => session('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'username' => ['required', 'string', 'alpha_dash', 'max:40', 'unique:users,username'],
            'password' => ['required', 'string', 'min:8', 'confirmed', 'max:100'],
            'name' => ['required', 'string', 'max:80'],
            'phone' => ['required', 'string', 'max:30'],
            'organization' => ['required', 'string', 'max:120'],
        ]);

        User::create([
            'username' => $validated['username'],
            'email' => $validated['username'].'@admin.local',
            'password' => Hash::make($validated['password']),
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'organization' => $validated['organization'],
            'role' => UserRole::Member,
            'admin_approval_status' => 'pending',
            'admin_requested_role' => UserRole::Planner->value,
        ]);

        return redirect()
            ->route('admin.login')
            ->with('status', '관리자 가입 신청이 접수되었습니다. 승인 후 로그인할 수 있습니다.');
    }
}
