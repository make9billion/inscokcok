<?php

namespace Database\Factories;

use App\Enums\PointLedgerType;
use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PointLedgerEntry>
 */
class PointLedgerEntryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'event_id' => Event::factory(),
            'type' => PointLedgerType::Earned,
            'points' => 1000,
            'balance_after' => 1000,
            'idempotency_key' => fake()->unique()->uuid(),
            'memo' => fake()->sentence(),
        ];
    }
}
