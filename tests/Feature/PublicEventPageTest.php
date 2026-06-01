<?php

namespace Tests\Feature;

use App\Models\Event;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicEventPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_event_page_lists_active_current_events_only(): void
    {
        $active = Event::factory()->create([
            'slug' => 'consultation-complete',
            'name' => '상담 완료 포인트',
            'trigger_type' => 'consultation.completed',
            'point_amount' => 5000,
            'is_active' => true,
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addDays(7),
        ]);
        Event::factory()->create([
            'name' => '비공개 이벤트',
            'is_active' => false,
        ]);
        Event::factory()->create([
            'name' => '종료된 이벤트',
            'is_active' => true,
            'ends_at' => now()->subDay(),
        ]);

        $this->get('/events')->assertOk()->assertInertia(fn ($page) => $page
            ->component('Events/Index')
            ->where('events.0.id', $active->id)
            ->where('events.0.name', '상담 완료 포인트')
            ->where('events.0.pointAmount', 5000)
            ->missing('events.1')
        );
    }
}
