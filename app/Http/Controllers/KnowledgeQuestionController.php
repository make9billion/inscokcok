<?php

namespace App\Http\Controllers;

use App\Enums\KnowledgeQuestionStatus;
use App\Models\KnowledgeQuestion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KnowledgeQuestionController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Knowledge/Index', [
            'questions' => KnowledgeQuestion::query()
                ->latest()
                ->take(30)
                ->get(['id', 'status', 'title', 'created_at'])
                ->map(fn (KnowledgeQuestion $question) => [
                    'id' => $question->id,
                    'status' => $question->status->value,
                    'statusLabel' => $this->statusLabel($question->status),
                    'title' => $question->title,
                    'createdAt' => $question->created_at?->format('Y-m-d'),
                ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:180'],
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $question = KnowledgeQuestion::create([
            'user_id' => $request->user()->id,
            'status' => KnowledgeQuestionStatus::Open,
            'title' => $validated['title'],
            'body' => $validated['body'],
        ]);

        return redirect()->route('knowledge.questions.show', $question);
    }

    public function show(Request $request, KnowledgeQuestion $question): Response
    {
        abort_unless($request->user()?->id === $question->user_id, 403);

        return Inertia::render('Knowledge/Show', [
            'question' => [
                'id' => $question->id,
                'status' => $question->status->value,
                'statusLabel' => $this->statusLabel($question->status),
                'title' => $question->title,
                'body' => $question->body,
                'createdAt' => $question->created_at?->format('Y-m-d H:i'),
            ],
        ]);
    }

    private function statusLabel(KnowledgeQuestionStatus $status): string
    {
        return match ($status) {
            KnowledgeQuestionStatus::Open => '답변 대기',
            KnowledgeQuestionStatus::Answered => '답변 완료',
            KnowledgeQuestionStatus::Closed => '종료',
        };
    }
}
