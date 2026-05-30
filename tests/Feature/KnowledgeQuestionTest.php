<?php

namespace Tests\Feature;

use App\Enums\KnowledgeQuestionStatus;
use App\Models\KnowledgeQuestion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KnowledgeQuestionTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_question_list_shows_titles_without_body(): void
    {
        $question = KnowledgeQuestion::factory()->create([
            'title' => '암보험 진단비를 줄여도 될까요?',
            'body' => '민감한 가입 내용입니다.',
            'status' => KnowledgeQuestionStatus::Open,
        ]);

        $response = $this->get('/knowledge');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Knowledge/Index')
            ->where('questions.0.id', $question->id)
            ->where('questions.0.title', '암보험 진단비를 줄여도 될까요?')
            ->where('questions.0.status', 'open')
            ->missing('questions.0.body')
        );
    }

    public function test_member_can_create_question(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/knowledge/questions', [
            'title' => '부모님 간병보험 가입이 가능한가요?',
            'body' => '나이와 병력이 있어서 상담이 필요합니다.',
        ]);

        $question = KnowledgeQuestion::firstOrFail();

        $response->assertRedirect("/knowledge/questions/{$question->id}");

        $this->assertSame($user->id, $question->user_id);
        $this->assertSame(KnowledgeQuestionStatus::Open, $question->status);
        $this->assertSame('부모님 간병보험 가입이 가능한가요?', $question->title);
        $this->assertSame('나이와 병력이 있어서 상담이 필요합니다.', $question->body);
    }

    public function test_guest_cannot_create_question(): void
    {
        $this->post('/knowledge/questions', [
            'title' => '비회원 질문',
            'body' => '로그인이 필요합니다.',
        ])->assertRedirect('/login');
    }

    public function test_only_author_can_view_question_body(): void
    {
        $author = User::factory()->create();
        $other = User::factory()->create();
        $question = KnowledgeQuestion::factory()->for($author)->create([
            'title' => '내 보험 질문',
            'body' => '작성자만 볼 수 있는 내용',
        ]);

        $this->actingAs($other)
            ->get("/knowledge/questions/{$question->id}")
            ->assertForbidden();

        $this->actingAs($author)
            ->get("/knowledge/questions/{$question->id}")
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Knowledge/Show')
                ->where('question.title', '내 보험 질문')
                ->where('question.body', '작성자만 볼 수 있는 내용')
            );
    }
}
