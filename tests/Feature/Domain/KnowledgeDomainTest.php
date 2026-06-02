<?php

namespace Tests\Feature\Domain;

use App\Enums\KnowledgeQuestionStatus;
use App\Models\KnowledgeAnswer;
use App\Models\KnowledgeQuestion;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KnowledgeDomainTest extends TestCase
{
    use RefreshDatabase;

    public function test_question_belongs_to_member_and_answer_belongs_to_planner(): void
    {
        $member = User::factory()->create();
        $planner = User::factory()->planner()->create();

        $question = KnowledgeQuestion::factory()->for($member, 'user')->create([
            'status' => KnowledgeQuestionStatus::Open,
        ]);

        $answer = KnowledgeAnswer::factory()
            ->for($question, 'question')
            ->for($planner, 'manager')
            ->create();

        $this->assertSame(KnowledgeQuestionStatus::Open, $question->status);
        $this->assertTrue($question->user->is($member));
        $this->assertTrue($question->answer->is($answer));
        $this->assertTrue($answer->manager->is($planner));
    }

    public function test_question_accepts_only_one_answer(): void
    {
        $question = KnowledgeQuestion::factory()->create();

        KnowledgeAnswer::factory()->for($question, 'question')->create();

        $this->expectException(QueryException::class);
        KnowledgeAnswer::factory()->for($question, 'question')->create();
    }
}
