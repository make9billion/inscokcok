<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AdminAuditLog>
 */
class AdminAuditLogFactory extends Factory
{
    public function definition(): array
    {
        return [
            'actor_id' => User::factory()->admin(),
            'action' => 'admin.changed',
            'subject_type' => User::class,
            'subject_id' => 1,
            'before' => ['state' => 'before'],
            'after' => ['state' => 'after'],
            'ip_address' => '127.0.0.1',
            'user_agent' => 'PHPUnit',
        ];
    }
}
