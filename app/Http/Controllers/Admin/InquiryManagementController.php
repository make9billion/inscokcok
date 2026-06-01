<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class InquiryManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeAdmin($request);

        return Inertia::render('Admin/Inquiries/Index', [
            'categories' => $this->options(Inquiry::CATEGORIES),
            'statusOptions' => $this->options(Inquiry::STATUSES),
            'inquiries' => Inquiry::query()
                ->latest()
                ->get()
                ->map(fn (Inquiry $inquiry) => [
                    'id' => $inquiry->id,
                    'category' => $inquiry->category,
                    'categoryLabel' => Inquiry::CATEGORIES[$inquiry->category] ?? $inquiry->category,
                    'applicantName' => $inquiry->applicant_name,
                    'phone' => $inquiry->phone,
                    'email' => $inquiry->email,
                    'title' => $inquiry->title,
                    'body' => $inquiry->body,
                    'status' => $inquiry->status,
                    'statusLabel' => Inquiry::STATUSES[$inquiry->status] ?? $inquiry->status,
                    'adminReply' => $inquiry->admin_reply,
                    'createdAt' => $inquiry->created_at?->format('Y-m-d H:i'),
                    'repliedAt' => $inquiry->replied_at?->format('Y-m-d H:i'),
                ])
                ->values(),
        ]);
    }

    public function update(Request $request, Inquiry $inquiry): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'status' => ['required', Rule::in(array_keys(Inquiry::STATUSES))],
            'admin_reply' => ['nullable', 'string', 'max:5000'],
        ]);

        $inquiry->update([
            ...$validated,
            'replied_at' => filled($validated['admin_reply'] ?? null) ? now() : null,
        ]);

        return redirect()
            ->route('admin.inquiries.index')
            ->with('success', '문의 상태가 저장되었습니다.');
    }

    private function options(array $items): array
    {
        return collect($items)
            ->map(fn (string $label, string $value) => compact('value', 'label'))
            ->values()
            ->all();
    }

    private function authorizeAdmin(Request $request): void
    {
        abort_unless($request->user()?->isAdmin(), 403);
    }
}
