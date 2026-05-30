<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MemberRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_members_can_register_with_profile_fields(): void
    {
        $response = $this->post('/register', [
            'name' => '홍길동',
            'email' => 'member@example.com',
            'phone' => '010-1234-5678',
            'birth_date' => '1990-01-02',
            'gender' => 'male',
            'postal_code' => '06236',
            'address_line1' => '서울시 강남구 테헤란로',
            'address_line2' => '10층',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertRedirect(route('dashboard', absolute: false));

        $user = User::where('email', 'member@example.com')->firstOrFail();

        $this->assertSame('홍길동', $user->name);
        $this->assertSame('010-1234-5678', $user->phone);
        $this->assertSame('1990-01-02', $user->birth_date->toDateString());
        $this->assertSame('male', $user->gender);
        $this->assertSame('06236', $user->postal_code);
        $this->assertSame('서울시 강남구 테헤란로', $user->address_line1);
        $this->assertSame('10층', $user->address_line2);
        $this->assertAuthenticatedAs($user);
    }

    public function test_phone_is_required_for_member_registration(): void
    {
        $response = $this->from('/register')->post('/register', [
            'name' => '홍길동',
            'email' => 'member@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertRedirect('/register');
        $response->assertSessionHasErrors('phone');
    }
}
