<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Services\AdminAuditLogger;
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

        return $this->renderIndex(
            Inquiry::query()->where('category', '!=', 'partnership'),
            '문의하기 관리',
            '고객 문의를 확인하고 처리상태와 답변을 저장합니다.',
            '등록된 문의가 없습니다.'
        );
    }

    public function partnershipIndex(Request $request): Response
    {
        $this->authorizeAdmin($request);

        return $this->renderIndex(
            Inquiry::query()->where('category', 'partnership'),
            '제휴문의 관리',
            '제휴문의를 확인하고 처리상태와 답변을 저장합니다.',
            '등록된 제휴문의가 없습니다.'
        );
    }

    public function show(Request $request, Inquiry $inquiry): Response
    {
        $this->authorizeAdmin($request);
        abort_if($inquiry->category === 'partnership', 404);

        return $this->renderShow($inquiry, '문의하기 상세', 'admin.inquiries.index');
    }

    public function partnershipShow(Request $request, Inquiry $inquiry): Response
    {
        $this->authorizeAdmin($request);
        abort_unless($inquiry->category === 'partnership', 404);

        return $this->renderShow($inquiry, '제휴문의 상세', 'admin.partnership-inquiries.index');
    }

    public function update(Request $request, Inquiry $inquiry, AdminAuditLogger $audit): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'status' => ['required', Rule::in(array_keys(Inquiry::STATUSES))],
            'admin_reply' => ['nullable', 'string', 'max:5000'],
        ]);

        $before = [
            'status' => $inquiry->status,
            'admin_reply' => $inquiry->admin_reply,
            'replied_at' => $inquiry->replied_at?->toISOString(),
        ];

        $inquiry->update([
            ...$validated,
            'replied_at' => filled($validated['admin_reply'] ?? null) ? now() : null,
        ]);

        $inquiry->refresh();
        $audit->record($request, 'inquiry.updated', $inquiry, $before, [
            'status' => $inquiry->status,
            'admin_reply' => $inquiry->admin_reply,
            'replied_at' => $inquiry->replied_at?->toISOString(),
        ]);

        return redirect()
            ->route($inquiry->category === 'partnership' ? 'admin.partnership-inquiries.index' : 'admin.inquiries.index')
            ->with('success', '문의 상태가 저장되었습니다.');
    }

    private function renderIndex($query, string $pageTitle, string $pageDescription, string $emptyMessage): Response
    {
        return Inertia::render('Admin/Inquiries/Index', [
            'pageTitle' => $pageTitle,
            'pageDescription' => $pageDescription,
            'emptyMessage' => $emptyMessage,
            'categories' => $this->options(Inquiry::CATEGORIES),
            'statusOptions' => $this->options(Inquiry::STATUSES),
            'inquiries' => $query
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

    private function renderShow(Inquiry $inquiry, string $pageTitle, string $backRouteName): Response
    {
        return Inertia::render('Admin/Inquiries/Show', [
            'pageTitle' => $pageTitle,
            'backRouteName' => $backRouteName,
            'statusOptions' => $this->options(Inquiry::STATUSES),
            'inquiry' => [
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
            ],
        ]);
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
