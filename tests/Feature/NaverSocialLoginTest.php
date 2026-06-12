<?php

namespace Tests\Feature;

use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class NaverSocialLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_naver_authorization_page(): void
    {
        config([
            'services.naver.client_id' => 'naver-client-id',
            'services.naver.client_secret' => 'naver-client-secret',
            'services.naver.redirect' => 'https://example.test/auth/naver/callback',
        ]);

        $response = $this->get(route('social.naver.redirect'));

        $response->assertRedirect();

        $location = $response->headers->get('Location');

        $this->assertStringStartsWith('https://nid.naver.com/oauth2.0/authorize?', $location);
        $this->assertStringContainsString('client_id=naver-client-id', $location);
        $this->assertStringContainsString('redirect_uri=https%3A%2F%2Fexample.test%2Fauth%2Fnaver%2Fcallback', $location);
        $this->assertStringContainsString('response_type=code', $location);
        $this->assertNotNull(session('oauth_naver_state'));
    }

    public function test_naver_callback_creates_member_and_logs_in(): void
    {
        config([
            'services.naver.client_id' => 'naver-client-id',
            'services.naver.client_secret' => 'naver-client-secret',
            'services.naver.redirect' => 'https://example.test/auth/naver/callback',
        ]);

        Http::fake([
            'https://nid.naver.com/oauth2.0/token' => Http::response([
                'access_token' => 'naver-access-token',
                'token_type' => 'bearer',
            ]),
            'https://openapi.naver.com/v1/nid/me' => Http::response([
                'resultcode' => '00',
                'response' => [
                    'id' => 'naver-member-id',
                    'email' => 'naver-user@example.com',
                    'name' => '네이버 회원',
                    'nickname' => '네이버닉',
                ],
            ]),
        ]);

        $response = $this
            ->withSession(['oauth_naver_state' => 'state-value'])
            ->get(route('social.naver.callback', [
                'code' => 'authorization-code',
                'state' => 'state-value',
            ]));

        $response->assertRedirect(route('dashboard', absolute: false));

        $user = User::where('email', 'naver-user@example.com')->first();

        $this->assertNotNull($user);
        $this->assertAuthenticatedAs($user);
        $this->assertDatabaseHas('social_accounts', [
            'user_id' => $user->id,
            'provider' => 'naver',
            'provider_id' => 'naver-member-id',
            'email' => 'naver-user@example.com',
        ]);
    }

    public function test_existing_naver_social_account_can_log_in_again(): void
    {
        $user = User::factory()->create(['email' => 'member@example.com']);
        SocialAccount::factory()->create([
            'user_id' => $user->id,
            'provider' => 'naver',
            'provider_id' => 'naver-member-id',
            'email' => 'member@example.com',
        ]);

        config([
            'services.naver.client_id' => 'naver-client-id',
            'services.naver.client_secret' => 'naver-client-secret',
            'services.naver.redirect' => 'https://example.test/auth/naver/callback',
        ]);

        Http::fake([
            'https://nid.naver.com/oauth2.0/token' => Http::response([
                'access_token' => 'naver-access-token',
            ]),
            'https://openapi.naver.com/v1/nid/me' => Http::response([
                'resultcode' => '00',
                'response' => [
                    'id' => 'naver-member-id',
                    'email' => 'member@example.com',
                    'name' => '기존 회원',
                ],
            ]),
        ]);

        $response = $this
            ->withSession(['oauth_naver_state' => 'state-value'])
            ->get(route('social.naver.callback', [
                'code' => 'authorization-code',
                'state' => 'state-value',
            ]));

        $response->assertRedirect(route('dashboard', absolute: false));
        $this->assertAuthenticatedAs($user);
        $this->assertSame(1, User::where('email', 'member@example.com')->count());
    }
}
