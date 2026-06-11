<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SocialAccount>
 */
class SocialAccountFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'provider' => 'kakao',
            'provider_id' => (string) fake()->unique()->numberBetween(100000, 999999999),
            'email' => fake()->unique()->safeEmail(),
            'name' => fake()->name(),
            'raw_profile' => [],
        ];
    }
}
