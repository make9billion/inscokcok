<?php

namespace App\Services;

use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class NaverOAuthClient
{
    public function authorizationUrl(string $state): string
    {
        return 'https://nid.naver.com/oauth2.0/authorize?'.http_build_query([
            'response_type' => 'code',
            'client_id' => config('services.naver.client_id'),
            'redirect_uri' => $this->redirectUri(),
            'state' => $state,
        ]);
    }

    /**
     * @return array{id: string, email: string|null, name: string|null, raw: array}
     *
     * @throws RequestException
     */
    public function userFromCode(string $code, string $state): array
    {
        $token = Http::asForm()
            ->post('https://nid.naver.com/oauth2.0/token', [
                'grant_type' => 'authorization_code',
                'client_id' => config('services.naver.client_id'),
                'client_secret' => config('services.naver.client_secret'),
                'code' => $code,
                'state' => $state,
            ])
            ->throw()
            ->json('access_token');

        $profile = Http::withToken($token)
            ->get('https://openapi.naver.com/v1/nid/me')
            ->throw()
            ->json();

        return [
            'id' => (string) data_get($profile, 'response.id'),
            'email' => data_get($profile, 'response.email'),
            'name' => data_get($profile, 'response.name') ?: data_get($profile, 'response.nickname'),
            'raw' => $profile,
        ];
    }

    public function makeState(): string
    {
        return Str::random(40);
    }

    private function redirectUri(): string
    {
        return config('services.naver.redirect') ?: route('social.naver.callback');
    }
}
