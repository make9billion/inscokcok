<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AdminAuthenticatedSessionController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/AdminLogin', [
            'status' => session('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()
            ->where('username', $validated['username'])
            ->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'username' => '아이디 또는 비밀번호가 올바르지 않습니다.',
            ]);
        }

        if ($user->admin_approval_status !== 'approved') {
            throw ValidationException::withMessages([
                'username' => $user->admin_approval_status === 'pending'
                    ? '관리자 승인이 완료된 후 로그인할 수 있습니다.'
                    : '관리자 로그인이 승인되지 않은 계정입니다.',
            ]);
        }

        if (! $user->canAccessAdmin()) {
            throw ValidationException::withMessages([
                'username' => '관리자 권한이 없는 계정입니다.',
            ]);
        }

        Auth::login($user, $request->boolean('remember'));
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
