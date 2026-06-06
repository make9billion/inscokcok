<?php

namespace Database\Factories;

use App\Models\PointMallCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PointMallProduct>
 */
class PointMallProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'point_mall_category_id' => PointMallCategory::factory(),
            'name' => fake()->words(3, true),
            'slug' => fake()->unique()->slug(3),
            'summary' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'image_path' => null,
            'point_price' => fake()->numberBetween(1000, 50000),
            'stock_quantity' => fake()->numberBetween(0, 100),
            'low_stock_threshold' => 0,
            'delivery_type' => 'free',
            'delivery_fee' => 0,
            'sort_order' => 0,
            'is_featured' => false,
            'is_main_visible' => false,
            'is_active' => true,
        ];
    }
}
