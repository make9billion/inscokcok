<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class EventManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeAdmin($request);

        return Inertia::render('Admin/Events/Index', [
            'events' => Event::query()
                ->orderByDesc('show_on_home')
                ->orderBy('id')
                ->get()
                ->map(fn (Event $event) => $this->serializeEvent($event)),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $this->validateEvent($request, creating: true);
        $showOnHome = $request->boolean('show_on_home');
        $this->ensureHomeVisibleLimit($showOnHome);

        $slug = $this->uniqueSlug($validated['name']);
        $eventData = [
            'slug' => $slug,
            'name' => $validated['name'],
            'trigger_type' => 'manual.'.$slug,
            'point_amount' => (int) ($validated['point_amount'] ?? 0),
            'is_active' => $request->boolean('is_active'),
            'show_on_home' => $showOnHome,
            'detail_content' => $validated['detail_content'] ?? null,
        ];

        if ($request->hasFile('banner_image')) {
            $eventData['banner_image_path'] = $request->file('banner_image')->store('event-banners', 'public');
        }

        Event::create($eventData);

        return redirect()
            ->route('admin.events.index')
            ->with('success', '이벤트가 추가되었습니다.');
    }

    public function update(Request $request, Event $event): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $this->validateEvent($request);
        $showOnHome = $request->has('show_on_home') ? $request->boolean('show_on_home') : $event->show_on_home;
        $this->ensureHomeVisibleLimit($showOnHome, $event);

        $eventData = [
            'point_amount' => (int) $validated['point_amount'],
            'is_active' => $request->boolean('is_active'),
            'show_on_home' => $showOnHome,
        ];

        if (array_key_exists('name', $validated)) {
            $eventData['name'] = $validated['name'];
        }

        if ($request->has('detail_content')) {
            $eventData['detail_content'] = $validated['detail_content'] ?? null;
        }

        if ($request->hasFile('banner_image')) {
            $eventData['banner_image_path'] = $request->file('banner_image')->store('event-banners', 'public');
        }

        $event->update($eventData);

        return redirect()
            ->route('admin.events.index')
            ->with('success', '이벤트 설정이 저장되었습니다.');
    }

    public function uploadDetailImage(Request $request)
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'image' => ['required', 'image', 'max:10240'],
        ]);

        $path = $validated['image']->store('event-detail-images', 'public');

        return response()->json([
            'url' => "/storage/{$path}",
        ]);
    }

    private function validateEvent(Request $request, bool $creating = false): array
    {
        return $request->validate([
            'name' => [$creating ? 'required' : 'sometimes', 'required', 'string', 'max:120'],
            'point_amount' => ['required', 'integer', 'min:0', 'max:1000000'],
            'is_active' => ['required', 'boolean'],
            'show_on_home' => [$creating ? 'required' : 'sometimes', 'boolean'],
            'detail_content' => ['nullable', 'string'],
            'banner_image' => [$creating ? 'nullable' : 'nullable', 'image', 'max:5120', 'dimensions:width=500,height=200'],
        ], [
            'name.required' => '이벤트명을 입력해 주세요.',
            'name.max' => '이벤트명은 120자 이하로 입력해 주세요.',
            'point_amount.required' => '표시 포인트를 입력해 주세요.',
            'point_amount.integer' => '표시 포인트는 숫자로 입력해 주세요.',
            'point_amount.min' => '표시 포인트는 0 이상으로 입력해 주세요.',
            'point_amount.max' => '표시 포인트는 1,000,000 이하로 입력해 주세요.',
            'is_active.required' => '이벤트 페이지 노출 여부를 선택해 주세요.',
            'is_active.boolean' => '이벤트 페이지 노출 값이 올바르지 않습니다.',
            'show_on_home.required' => '메인페이지 노출 여부를 선택해 주세요.',
            'show_on_home.boolean' => '메인페이지 노출 값이 올바르지 않습니다.',
            'detail_content.string' => '상세 안내 내용이 올바르지 않습니다.',
            'banner_image.image' => '배너 이미지는 JPG, PNG, WebP 형식의 이미지 파일만 등록할 수 있습니다.',
            'banner_image.max' => '배너 이미지는 5MB 이하로 등록해 주세요.',
            'banner_image.dimensions' => '배너 이미지는 500x200 크기로 등록해 주세요.',
        ], [
            'name' => '이벤트명',
            'point_amount' => '표시 포인트',
            'is_active' => '이벤트 페이지 노출',
            'show_on_home' => '메인페이지 노출',
            'detail_content' => '상세 안내',
            'banner_image' => '배너 이미지',
        ]);
    }

    private function ensureHomeVisibleLimit(bool $showOnHome, ?Event $currentEvent = null): void
    {
        if (! $showOnHome) {
            return;
        }

        $count = Event::query()
            ->where('show_on_home', true)
            ->when($currentEvent, fn ($query) => $query->whereKeyNot($currentEvent->id))
            ->count();

        if ($count >= 2) {
            throw ValidationException::withMessages([
                'show_on_home' => '메인페이지 노출 이벤트는 최대 2개까지만 선택할 수 있습니다.',
            ]);
        }
    }

    private function uniqueSlug(string $name): string
    {
        $baseSlug = Str::slug($name) ?: 'event';
        $slug = $baseSlug;
        $index = 2;

        while (Event::query()->where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$index}";
            $index++;
        }

        return $slug;
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
            'detailContent' => $event->detail_content,
            'isActive' => $event->is_active,
            'showOnHome' => $event->show_on_home,
            'isAutomatic' => in_array($event->slug, ['signup_bonus', 'consultation_completed_bonus'], true),
        ];
    }

    private function authorizeAdmin(Request $request): void
    {
        abort_unless($request->user()?->isAdmin(), 403);
    }
}
