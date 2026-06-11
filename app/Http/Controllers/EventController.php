<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Events/Index', [
            'events' => $this->activeEvents()->map(fn (Event $event) => $this->serializeEvent($event)),
        ]);
    }

    public function show(Event $event): Response
    {
        abort_unless($event->is_active, 404);

        return Inertia::render('Events/Show', [
            'event' => $this->serializeEvent($event) + [
                'detailContent' => $event->detail_content,
            ],
        ]);
    }

    private function activeEvents()
    {
        $now = now();

        return Event::query()
            ->where('is_active', true)
            ->where(fn ($query) => $query->whereNull('starts_at')->orWhere('starts_at', '<=', $now))
            ->where(fn ($query) => $query->whereNull('ends_at')->orWhere('ends_at', '>=', $now))
            ->orderByRaw('starts_at is null')
            ->orderByDesc('starts_at')
            ->orderBy('id')
            ->get();
    }

    private function serializeEvent(Event $event): array
    {
        return [
            'id' => $event->id,
            'slug' => $event->slug,
            'name' => $event->name,
            'triggerType' => $event->trigger_type,
            'pointAmount' => $event->point_amount,
            'bannerImageUrl' => $event->banner_image_url,
            'startsAt' => $event->starts_at?->format('Y.m.d'),
            'endsAt' => $event->ends_at?->format('Y.m.d'),
        ];
    }
}
