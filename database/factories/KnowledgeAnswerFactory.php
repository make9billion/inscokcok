<?php

namespace Database\Factories;

use App\Models\KnowledgeQuestion;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\KnowledgeAnswer>
 */
class KnowledgeAnswerFactory extends Factory
{
    public function definition(): array
    {
        return [
            'knowledge_question_id' => KnowledgeQuestion::factory(),
            'manager_id' => User::factory()->consultationManager(),
            'body' => fake()->paragraph(),
        ];
    }
}
