<?php

namespace Database\Factories;

use App\Enums\KnowledgeQuestionStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\KnowledgeQuestion>
 */
class KnowledgeQuestionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'status' => KnowledgeQuestionStatus::Open,
            'title' => '보험 리모델링 상담이 필요합니다',
            'body' => fake()->paragraph(),
        ];
    }
}
