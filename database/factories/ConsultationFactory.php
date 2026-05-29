<?php

namespace Database\Factories;

use App\Enums\ConsultationStatus;
use App\Enums\ConsultationType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Consultation>
 */
class ConsultationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'type' => ConsultationType::Product,
            'status' => ConsultationStatus::Received,
            'applicant_name' => fake()->name(),
            'phone' => '010'.fake()->numerify('########'),
            'birth_date' => fake()->date(),
            'current_monthly_premium' => fake()->numberBetween(50000, 300000),
            'interested_product' => '암보험',
            'preferred_contact_time' => '평일 오후',
            'memo' => fake()->sentence(),
            'privacy_agreed_at' => now(),
            'third_party_agreed_at' => now(),
        ];
    }
}
