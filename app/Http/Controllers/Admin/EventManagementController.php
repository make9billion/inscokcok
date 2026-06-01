<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EventManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeAdmin($request);

        return Inertia::render('Admin/Events/Index', [
            'events' => Event::query()
                ->orderBy('id')
                ->get()
                ->map(fn (Event $event) => [
                    'id' => $event->id,
                    'slug' => $event->slug,
                    'name' => $event->name,
                    'triggerType' => $event->trigger_type,
                    'pointAmount' => $event->point_amount,
                    'isActive' => $event->is_active,
                ]),
        ]);
    }

    public function update(Request $request, Event $event): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'point_amount' => ['required', 'integer', 'min:0', 'max:1000000'],
            'is_active' => ['required', 'boolean'],
        ]);

        $event->update([
            'point_amount' => $validated['point_amount'],
            'is_active' => $request->boolean('is_active'),
        ]);

        return redirect()
            ->route('admin.events.index')
            ->with('success', '이벤트 설정이 저장되었습니다.');
    }

    private function authorizeAdmin(Request $request): void
    {
        abort_unless($request->user()?->isAdmin(), 403);
    }
}
