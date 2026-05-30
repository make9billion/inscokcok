<?php

namespace App\Http\Controllers\Admin;

use App\Enums\KnowledgeQuestionStatus;
use App\Http\Controllers\Controller;
use App\Models\KnowledgeAnswer;
use App\Models\KnowledgeQuestion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class KnowledgeAnswerController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeManager($request);

        return Inertia::render('Admin/Knowledge/Index', [
            'questions' => KnowledgeQuestion::query()
                ->with(['user', 'answer.manager'])
                ->latest()
                ->take(50)
                ->get()
                ->map(fn (KnowledgeQuestion $question) => [
                    'id' => $question->id,
                    'title' => $question->title,
                    'body' => $question->body,
                    'status' => $question->status->value,
                    'statusLabel' => $this->statusLabel($question->status),
                    'authorName' => $question->user?->name,
                    'answerBody' => $question->answer?->body,
                    'answeredBy' => $question->answer?->manager?->name,
                    'createdAt' => $question->created_at?->format('Y-m-d H:i'),
                ]),
        ]);
    }

    public function store(Request $request, KnowledgeQuestion $question): RedirectResponse
    {
        $this->authorizeManager($request);

        $validator = Validator::make($request->all(), [
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $validator->after(function ($validator) use ($question) {
            if ($question->answer()->exists()) {
                $validator->errors()->add('body', '이미 답변이 등록된 질문입니다.');
            }
        });

        $validated = $validator->validate();

        KnowledgeAnswer::create([
            'knowledge_question_id' => $question->id,
            'manager_id' => $request->user()->id,
            'body' => $validated['body'],
        ]);

        $question->update([
            'status' => KnowledgeQuestionStatus::Answered,
            'answered_at' => now(),
            'assigned_manager_id' => $request->user()->id,
        ]);

        return redirect()
            ->route('admin.knowledge.index')
            ->with('success', '답변이 등록되었습니다.');
    }

    private function authorizeManager(Request $request): void
    {
        $user = $request->user();

        abort_unless($user?->isConsultationManager() || $user?->isAdmin(), 403);
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
