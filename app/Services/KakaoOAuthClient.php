<?php

namespace App\Services;

use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class KakaoOAuthClient
{
    public function authorizationUrl(string $state): string
    {
        return 'https://kauth.kakao.com/oauth/authorize?'.http_build_query([
            'client_id' => config('services.kakao.client_id'),
            'redirect_uri' => $this->redirectUri(),
            'response_type' => 'code',
            'state' => $state,
        ]);
    }

    /**
     * @return array{id: string, email: string|null, name: string|null, raw: array}
     *
     * @throws RequestException
     */
    public function userFromCode(string $code): array
    {
        $token = Http::asForm()
            ->post('https://kauth.kakao.com/oauth/token', array_filter([
                'grant_type' => 'authorization_code',
                'client_id' => config('services.kakao.client_id'),
                'client_secret' => config('services.kakao.client_secret'),
                'redirect_uri' => $this->redirectUri(),
                'code' => $code,
            ]))
            ->throw()
            ->json('access_token');

        $profile = Http::withToken($token)
            ->get('https://kapi.kakao.com/v2/user/me')
            ->throw()
            ->json();

        return [
            'id' => (string) data_get($profile, 'id'),
            'email' => data_get($profile, 'kakao_account.email'),
            'name' => data_get($profile, 'kakao_account.profile.nickname') ?: data_get($profile, 'properties.nickname'),
            'raw' => $profile,
        ];
    }

    public function makeState(): string
    {
        return Str::random(40);
    }

    private function redirectUri(): string
    {
        return config('services.kakao.redirect') ?: route('social.kakao.callback');
    }
}
