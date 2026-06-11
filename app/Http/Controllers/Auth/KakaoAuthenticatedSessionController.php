<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\SocialAccount;
use App\Models\User;
use App\Services\KakaoOAuthClient;
use App\Services\PointLedgerService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class KakaoAuthenticatedSessionController extends Controller
{
    public function redirect(Request $request, KakaoOAuthClient $kakao): RedirectResponse
    {
        if (! config('services.kakao.client_id')) {
            return back()->withErrors(['social' => '카카오 로그인 설정이 아직 완료되지 않았습니다.']);
        }

        $state = $kakao->makeState();

        $request->session()->put('oauth_kakao_state', $state);

        return redirect()->away($kakao->authorizationUrl($state));
    }

    public function callback(Request $request, KakaoOAuthClient $kakao, PointLedgerService $pointLedger): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string'],
            'state' => ['required', 'string'],
        ]);

        if (! hash_equals((string) $request->session()->pull('oauth_kakao_state'), (string) $request->query('state'))) {
            return redirect()
                ->route('login')
                ->withErrors(['social' => '카카오 로그인 요청이 만료되었습니다. 다시 시도해 주세요.']);
        }

        try {
            $kakaoUser = $kakao->userFromCode($request->query('code'));
        } catch (\Throwable) {
            return redirect()
                ->route('login')
                ->withErrors(['social' => '카카오 로그인 정보를 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.']);
        }

        if (! $kakaoUser['id']) {
            return redirect()
                ->route('login')
                ->withErrors(['social' => '카카오 계정 정보를 확인할 수 없습니다.']);
        }

        [$user, $created] = DB::transaction(function () use ($kakaoUser) {
            $socialAccount = SocialAccount::query()
                ->where('provider', 'kakao')
                ->where('provider_id', $kakaoUser['id'])
                ->first();

            if ($socialAccount) {
                $socialAccount->update([
                    'email' => $kakaoUser['email'],
                    'name' => $kakaoUser['name'],
                    'raw_profile' => $kakaoUser['raw'],
                ]);

                return [$socialAccount->user, false];
            }

            $user = $this->findOrCreateUser($kakaoUser);

            $user->socialAccounts()->create([
                'provider' => 'kakao',
                'provider_id' => $kakaoUser['id'],
                'email' => $kakaoUser['email'],
                'name' => $kakaoUser['name'],
                'raw_profile' => $kakaoUser['raw'],
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

    private function findOrCreateUser(array $kakaoUser): User
    {
        if ($kakaoUser['email']) {
            $existingUser = User::query()->where('email', $kakaoUser['email'])->first();

            if ($existingUser) {
                return $existingUser;
            }
        }

        return User::create([
            'name' => $kakaoUser['name'] ?: '카카오 회원',
            'email' => $kakaoUser['email'] ?: 'kakao_'.$kakaoUser['id'].'@social.inscokcok.local',
            'email_verified_at' => $kakaoUser['email'] ? now() : null,
            'password' => Hash::make(Str::random(40)),
        ]);
    }
}
