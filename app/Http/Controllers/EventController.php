<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(): Response
    {
        $now = now();

        return Inertia::render('Events/Index', [
            'events' => Event::query()
                ->where('is_active', true)
                ->where(fn ($query) => $query->whereNull('starts_at')->orWhere('starts_at', '<=', $now))
                ->where(fn ($query) => $query->whereNull('ends_at')->orWhere('ends_at', '>=', $now))
                ->orderByRaw('starts_at is null')
                ->orderByDesc('starts_at')
                ->orderBy('id')
                ->get()
                ->map(fn (Event $event) => [
                    'id' => $event->id,
                    'slug' => $event->slug,
                    'name' => $event->name,
                    'triggerType' => $event->trigger_type,
                    'pointAmount' => $event->point_amount,
                    'startsAt' => $event->starts_at?->format('Y.m.d'),
                    'endsAt' => $event->ends_at?->format('Y.m.d'),
                ]),
        ]);
    }
}
