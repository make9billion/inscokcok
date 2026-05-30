<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminEventManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_cannot_access_admin_event_list(): void
    {
        $member = User::factory()->create();

        $this->actingAs($member)->get('/admin/events')->assertForbidden();
    }

    public function test_admin_can_view_point_events(): void
    {
        $admin = User::factory()->admin()->create();
        $event = Event::factory()->create([
            'slug' => 'signup_bonus',
            'name' => '회원가입 적립',
            'trigger_type' => 'member.registered',
            'point_amount' => 1000,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->get('/admin/events');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Events/Index')
            ->where('events.0.id', $event->id)
            ->where('events.0.slug', 'signup_bonus')
            ->where('events.0.name', '회원가입 적립')
            ->where('events.0.pointAmount', 1000)
            ->where('events.0.isActive', true)
        );
    }

    public function test_admin_can_update_event_point_amount_and_active_state(): void
    {
        $admin = User::factory()->admin()->create();
        $event = Event::factory()->create([
            'point_amount' => 1000,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->patch("/admin/events/{$event->id}", [
            'point_amount' => 2500,
            'is_active' => false,
        ]);

        $response->assertRedirect('/admin/events');

        $event->refresh();

        $this->assertSame(2500, $event->point_amount);
        $this->assertFalse($event->is_active);
    }
}
