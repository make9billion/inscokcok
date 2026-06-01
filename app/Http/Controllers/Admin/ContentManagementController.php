<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteContent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ContentManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeAdmin($request);

        return Inertia::render('Admin/Cms/Index', [
            'contents' => SiteContent::query()
                ->orderBy('type')
                ->orderBy('sort_order')
                ->latest()
                ->get()
                ->map(fn (SiteContent $content) => $this->serializeContent($content)),
            'typeOptions' => collect($this->typeLabels())
                ->map(fn (string $label, string $value) => compact('value', 'label'))
                ->values(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $this->validated($request);

        SiteContent::create($this->payload($validated));

        return redirect()
            ->route('admin.cms.index')
            ->with('success', '콘텐츠가 추가되었습니다.');
    }

    public function update(Request $request, SiteContent $content): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $this->validated($request);
        $content->update($this->payload($validated));

        return redirect()
            ->route('admin.cms.index')
            ->with('success', '콘텐츠가 저장되었습니다.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'type' => ['required', Rule::in(array_keys($this->typeLabels()))],
            'title' => ['required', 'string', 'max:160'],
            'body' => ['nullable', 'string', 'max:5000'],
            'link_url' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:100000'],
            'is_published' => ['required', 'boolean'],
        ]);
    }

    private function payload(array $validated): array
    {
        return [
            ...$validated,
            'published_at' => $validated['is_published'] ? now() : null,
        ];
    }

    private function serializeContent(SiteContent $content): array
    {
        return [
            'id' => $content->id,
            'type' => $content->type,
            'typeLabel' => $this->typeLabels()[$content->type] ?? $content->type,
            'title' => $content->title,
            'body' => $content->body,
            'linkUrl' => $content->link_url,
            'sortOrder' => $content->sort_order,
            'isPublished' => $content->is_published,
            'publishedAt' => $content->published_at?->format('Y-m-d H:i'),
        ];
    }

    private function typeLabels(): array
    {
        return [
            'notice' => '공지사항',
            'faq' => 'FAQ',
            'main_banner' => '메인 배너',
            'company_intro' => '회사소개',
            'event_guide' => '이벤트 안내',
        ];
    }

    private function authorizeAdmin(Request $request): void
    {
        abort_unless($request->user()?->canAccessAdmin(), 403);
    }
}
