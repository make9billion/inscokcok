<?php

namespace Database\Seeders;

use App\Models\Event;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        Event::upsert([
            [
                'slug' => 'signup_bonus',
                'name' => '회원가입 적립',
                'trigger_type' => 'member.registered',
                'point_amount' => 1000,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'slug' => 'consultation_completed_bonus',
                'name' => '상담완료 적립',
                'trigger_type' => 'consultation.completed',
                'point_amount' => 1000,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ], ['slug'], [
            'name',
            'trigger_type',
            'point_amount',
            'is_active',
            'updated_at',
        ]);
    }
}
