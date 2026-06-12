<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\SocialAccount;
use App\Models\User;
use App\Services\NaverOAuthClient;
use App\Services\PointLedgerService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class NaverAuthenticatedSessionController extends Controller
{
    public function redirect(Request $request, NaverOAuthClient $naver): RedirectResponse
    {
        if (! config('services.naver.client_id') || ! config('services.naver.client_secret')) {
            return back()->withErrors(['social' => '네이버 로그인 설정이 아직 완료되지 않았습니다.']);
        }

        $state = $naver->makeState();

        $request->session()->put('oauth_naver_state', $state);

        return redirect()->away($naver->authorizationUrl($state));
    }

    public function callback(Request $request, NaverOAuthClient $naver, PointLedgerService $pointLedger): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string'],
            'state' => ['required', 'string'],
        ]);

        $state = (string) $request->query('state');

        if (! hash_equals((string) $request->session()->pull('oauth_naver_state'), $state)) {
            return redirect()
                ->route('login')
                ->withErrors(['social' => '네이버 로그인 요청이 만료되었습니다. 다시 시도해 주세요.']);
        }

        try {
            $naverUser = $naver->userFromCode($request->query('code'), $state);
        } catch (\Throwable) {
            return redirect()
                ->route('login')
                ->withErrors(['social' => '네이버 로그인 정보를 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.']);
        }

        if (! $naverUser['id']) {
            return redirect()
                ->route('login')
                ->withErrors(['social' => '네이버 계정 정보를 확인할 수 없습니다.']);
        }

        [$user, $created] = DB::transaction(function () use ($naverUser) {
            $socialAccount = SocialAccount::query()
                ->where('provider', 'naver')
                ->where('provider_id', $naverUser['id'])
                ->first();

            if ($socialAccount) {
                $socialAccount->update([
                    'email' => $naverUser['email'],
                    'name' => $naverUser['name'],
                    'raw_profile' => $naverUser['raw'],
                ]);

                return [$socialAccount->user, false];
            }

            $user = $this->findOrCreateUser($naverUser);

            $user->socialAccounts()->create([
                'provider' => 'naver',
                'provider_id' => $naverUser['id'],
                'email' => $naverUser['email'],
                'name' => $naverUser['name'],
                'raw_profile' => $naverUser['raw'],
            ]);

            return [$user, $user->wasRecentlyCreated];
        });

        if ($created) {
            event(new Registered($user));
            $pointLedger->grantSignupBonus($user);
        }

        Auth::login($user, true);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    private function findOrCreateUser(array $naverUser): User
    {
        if ($naverUser['email']) {
            $existingUser = User::query()->where('email', $naverUser['email'])->first();

            if ($existingUser) {
                return $existingUser;
            }
        }

        return User::create([
            'name' => $naverUser['name'] ?: '네이버 회원',
            'email' => $naverUser['email'] ?: 'naver_'.$naverUser['id'].'@social.inscokcok.local',
            'email_verified_at' => $naverUser['email'] ? now() : null,
            'password' => Hash::make(Str::random(40)),
        ]);
    }
}
