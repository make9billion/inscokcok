<?php

namespace Database\Factories;

use App\Enums\PointMallOrderStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PointMallOrder>
 */
class PointMallOrderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'status' => PointMallOrderStatus::Pending,
            'order_number' => fake()->unique()->numerify('PM############'),
            'total_points' => 1000,
            'used_points' => 0,
            'delivery_fee' => 0,
            'cash_payment_amount' => 0,
            'recipient_name' => fake()->name(),
            'recipient_phone' => '010'.fake()->numerify('########'),
            'postal_code' => fake()->postcode(),
            'address_line1' => fake()->address(),
            'address_line2' => null,
            'delivery_memo' => null,
            'ordered_at' => null,
        ];
    }
}
