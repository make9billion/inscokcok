<?php

namespace Tests\Feature;

use App\Enums\KnowledgeQuestionStatus;
use App\Models\KnowledgeAnswer;
use App\Models\KnowledgeQuestion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminKnowledgeAnswerTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_cannot_access_admin_knowledge_list(): void
    {
        $member = User::factory()->create();

        $this->actingAs($member)->get('/admin/knowledge')->assertForbidden();
    }

    public function test_planner_can_view_knowledge_questions(): void
    {
        $planner = User::factory()->planner()->create();
        $question = KnowledgeQuestion::factory()->create([
            'title' => '암보험 진단비 질문',
            'status' => KnowledgeQuestionStatus::Open,
        ]);

        $response = $this->actingAs($planner)->get('/admin/knowledge');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Knowledge/Index')
            ->where('questions.0.id', $question->id)
            ->where('questions.0.title', '암보험 진단비 질문')
            ->where('questions.0.status', 'open')
        );
    }

    public function test_planner_can_answer_question_once(): void
    {
        $planner = User::factory()->planner()->create();
        $question = KnowledgeQuestion::factory()->create([
            'status' => KnowledgeQuestionStatus::Open,
            'answered_at' => null,
        ]);

        $response = $this->actingAs($planner)->post("/admin/knowledge/{$question->id}/answer", [
            'body' => '기존 보장을 확인한 뒤 진단비 중심으로 비교하는 것이 좋습니다.',
        ]);

        $response->assertRedirect('/admin/knowledge');

        $answer = KnowledgeAnswer::firstOrFail();
        $question->refresh();

        $this->assertSame($question->id, $answer->knowledge_question_id);
        $this->assertSame($planner->id, $answer->manager_id);
        $this->assertSame('기존 보장을 확인한 뒤 진단비 중심으로 비교하는 것이 좋습니다.', $answer->body);
        $this->assertSame(KnowledgeQuestionStatus::Answered, $question->status);
        $this->assertNotNull($question->answered_at);

        $this->actingAs($planner)->post("/admin/knowledge/{$question->id}/answer", [
            'body' => '두 번째 답변입니다.',
        ])->assertSessionHasErrors('body');

        $this->assertDatabaseCount('knowledge_answers', 1);
    }

    public function test_question_author_can_view_answer_on_detail(): void
    {
        $author = User::factory()->create();
        $planner = User::factory()->planner()->create(['name' => '설계사']);
        $question = KnowledgeQuestion::factory()->for($author)->create([
            'title' => '간병보험 질문',
            'body' => '부모님 보험 문의입니다.',
            'status' => KnowledgeQuestionStatus::Answered,
            'answered_at' => now(),
        ]);
        KnowledgeAnswer::factory()->for($question, 'question')->for($planner, 'manager')->create([
            'body' => '간병비 보장 범위를 먼저 확인하세요.',
        ]);

        $this->actingAs($author)
            ->get("/knowledge/questions/{$question->id}")
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Knowledge/Show')
                ->where('question.answer.body', '간병비 보장 범위를 먼저 확인하세요.')
                ->where('question.answer.managerName', '설계사')
            );
    }
}
