<?php

namespace Database\Seeders;

use App\Models\Event;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        collect([
            [
                'slug' => 'signup_bonus',
                'name' => '회원가입 포인트 적립',
                'trigger_type' => 'member.registered',
                'point_amount' => 1000,
                'banner_image_path' => 'event-banners/event-banner-1.jpg',
                'detail_content' => '<h2>회원가입 포인트 적립 안내</h2><p>보험콕콕 회원가입을 완료하면 이벤트 설정에 따라 포인트가 자동 적립됩니다.</p>',
                'is_active' => true,
                'show_on_home' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'slug' => 'consultation_completed_bonus',
                'name' => '보험점검 완료시 포인트 적립',
                'trigger_type' => 'consultation.completed',
                'point_amount' => 1000,
                'banner_image_path' => 'event-banners/event-banner-2.jpg',
                'detail_content' => '<h2>보험점검 완료 포인트 적립 안내</h2><p>보험점검으로 신청한 상담이 상담완료 상태가 되면 이벤트 설정에 따라 포인트가 자동 적립됩니다.</p>',
                'is_active' => true,
                'show_on_home' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ])->each(function (array $event): void {
            Event::query()->firstOrCreate(
                ['slug' => $event['slug']],
                $event,
            );
        });
    }
}
