<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Event>
 */
class EventFactory extends Factory
{
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(2),
            'name' => fake()->words(2, true),
            'trigger_type' => fake()->unique()->bothify('event.####'),
            'point_amount' => 1000,
            'is_active' => true,
            'show_on_home' => false,
        ];
    }
}
