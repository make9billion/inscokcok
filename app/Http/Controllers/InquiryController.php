<?php

namespace App\Http\Controllers;

use App\Models\Inquiry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class InquiryController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Customer/Inquiries', [
            'categories' => $this->options(Inquiry::CATEGORIES),
            'inquiries' => Inquiry::query()
                ->latest()
                ->take(20)
                ->get()
                ->map(fn (Inquiry $inquiry) => [
                    'id' => $inquiry->id,
                    'category' => Inquiry::CATEGORIES[$inquiry->category] ?? $inquiry->category,
                    'title' => $inquiry->title,
                    'status' => Inquiry::STATUSES[$inquiry->status] ?? $inquiry->status,
                    'createdAt' => $inquiry->created_at?->format('Y.m.d'),
                    'hasReply' => filled($inquiry->admin_reply),
                ])
                ->values(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'category' => ['required', Rule::in(array_keys(Inquiry::CATEGORIES))],
            'applicant_name' => ['required', 'string', 'max:80'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:160'],
            'title' => ['required', 'string', 'max:160'],
            'body' => ['required', 'string', 'max:5000'],
        ]);

        Inquiry::create([
            ...$validated,
            'status' => 'received',
        ]);

        return redirect()
            ->route('customer.inquiries.index')
            ->with('success', '문의가 접수되었습니다.');
    }

    private function options(array $items): array
    {
        return collect($items)
            ->map(fn (string $label, string $value) => compact('value', 'label'))
            ->values()
            ->all();
    }
}
