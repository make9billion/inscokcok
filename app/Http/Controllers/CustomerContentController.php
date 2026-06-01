<?php

namespace App\Http\Controllers;

use App\Models\SiteContent;
use Inertia\Inertia;
use Inertia\Response;

class CustomerContentController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Customer/Index', [
            'notices' => $this->publishedContents('notice', 5),
            'faqs' => $this->publishedContents('faq', 6),
        ]);
    }

    public function notices(): Response
    {
        return Inertia::render('Customer/Notices', [
            'notices' => $this->publishedContents('notice', 20),
        ]);
    }

    public function notice(SiteContent $content): Response
    {
        abort_unless($content->type === 'notice' && $content->is_published, 404);

        return Inertia::render('Customer/NoticeShow', [
            'notice' => $this->serializeContent($content),
        ]);
    }

    public function faq(): Response
    {
        return Inertia::render('Customer/Faq', [
            'faqs' => $this->publishedContents('faq', 30),
        ]);
    }

    public function company(): Response
    {
        return Inertia::render('Customer/Company');
    }

    private function publishedContents(string $type, int $limit): array
    {
        return SiteContent::query()
            ->where('type', $type)
            ->where('is_published', true)
            ->orderBy('sort_order')
            ->latest()
            ->take($limit)
            ->get()
            ->map(fn (SiteContent $content) => $this->serializeContent($content))
            ->values()
            ->all();
    }

    private function serializeContent(SiteContent $content): array
    {
        return [
            'id' => $content->id,
            'title' => $content->title,
            'body' => $content->body,
            'linkUrl' => $content->link_url,
            'publishedAt' => $content->published_at?->format('Y.m.d') ?? $content->created_at?->format('Y.m.d'),
        ];
    }
}
