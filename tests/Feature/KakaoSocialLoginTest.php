<?php

namespace Tests\Feature;

use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class KakaoSocialLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_kakao_authorization_page(): void
    {
        config([
            'services.kakao.client_id' => 'kakao-client-id',
            'services.kakao.redirect' => 'https://example.test/auth/kakao/callback',
        ]);

        $response = $this->get(route('social.kakao.redirect'));

        $response->assertRedirect();

        $location = $response->headers->get('Location');

        $this->assertStringStartsWith('https://kauth.kakao.com/oauth/authorize?', $location);
        $this->assertStringContainsString('client_id=kakao-client-id', $location);
        $this->assertStringContainsString('redirect_uri=https%3A%2F%2Fexample.test%2Fauth%2Fkakao%2Fcallback', $location);
        $this->assertStringContainsString('response_type=code', $location);
        $this->assertNotNull(session('oauth_kakao_state'));
    }

    public function test_kakao_callback_creates_member_and_logs_in(): void
    {
        config([
            'services.kakao.client_id' => 'kakao-client-id',
            'services.kakao.client_secret' => 'kakao-client-secret',
            'services.kakao.redirect' => 'https://example.test/auth/kakao/callback',
        ]);

        Http::fake([
            'https://kauth.kakao.com/oauth/token' => Http::response([
                'access_token' => 'kakao-access-token',
                'token_type' => 'bearer',
            ]),
            'https://kapi.kakao.com/v2/user/me' => Http::response([
                'id' => 123456789,
                'kakao_account' => [
                    'email' => 'kakao-user@example.com',
                    'profile' => [
                        'nickname' => '카카오 회원',
                    ],
                ],
            ]),
        ]);

        $response = $this
            ->withSession(['oauth_kakao_state' => 'state-value'])
            ->get(route('social.kakao.callback', [
                'code' => 'authorization-code',
                'state' => 'state-value',
            ]));

        $response->assertRedirect(route('dashboard', absolute: false));

        $user = User::where('email', 'kakao-user@example.com')->first();

        $this->assertNotNull($user);
        $this->assertAuthenticatedAs($user);
        $this->assertDatabaseHas('social_accounts', [
            'user_id' => $user->id,
            'provider' => 'kakao',
            'provider_id' => '123456789',
            'email' => 'kakao-user@example.com',
        ]);
    }

    public function test_existing_social_account_can_log_in_again(): void
    {
        $user = User::factory()->create(['email' => 'member@example.com']);
        SocialAccount::factory()->create([
            'user_id' => $user->id,
            'provider' => 'kakao',
            'provider_id' => '123456789',
            'email' => 'member@example.com',
        ]);

        config([
            'services.kakao.client_id' => 'kakao-client-id',
            'services.kakao.redirect' => 'https://example.test/auth/kakao/callback',
        ]);

        Http::fake([
            'https://kauth.kakao.com/oauth/token' => Http::response([
                'access_token' => 'kakao-access-token',
            ]),
            'https://kapi.kakao.com/v2/user/me' => Http::response([
                'id' => 123456789,
                'kakao_account' => [
                    'email' => 'member@example.com',
                    'profile' => ['nickname' => '기존 회원'],
                ],
            ]),
        ]);

        $response = $this
            ->withSession(['oauth_kakao_state' => 'state-value'])
            ->get(route('social.kakao.callback', [
                'code' => 'authorization-code',
                'state' => 'state-value',
            ]));

        $response->assertRedirect(route('dashboard', absolute: false));
        $this->assertAuthenticatedAs($user);
        $this->assertSame(1, User::where('email', 'member@example.com')->count());
    }
}
