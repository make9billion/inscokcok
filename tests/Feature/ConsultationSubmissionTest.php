<?php

namespace Tests\Feature;

use App\Enums\ConsultationStatus;
use App\Enums\ConsultationType;
use App\Models\Consultation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConsultationSubmissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_submit_product_consultation(): void
    {
        $response = $this->from('/')->post('/consultations', [
            'type' => 'product',
            'applicant_name' => '김민준',
            'phone' => '010-1234-5678',
            'birth_date' => '1990-01-02',
            'interested_product' => '암보험',
            'preferred_contact_time' => '평일 오후',
            'privacy_agreement' => '1',
            'third_party_agreement' => '1',
        ]);

        $response->assertRedirect('/');
        $response->assertSessionHas('success');

        $consultation = Consultation::firstOrFail();

        $this->assertNull($consultation->user_id);
        $this->assertSame(ConsultationType::Product, $consultation->type);
        $this->assertSame(ConsultationStatus::Received, $consultation->status);
        $this->assertSame('김민준', $consultation->applicant_name);
        $this->assertSame('010-1234-5678', $consultation->phone);
        $this->assertSame('암보험', $consultation->interested_product);
        $this->assertNotNull($consultation->privacy_agreed_at);
        $this->assertNotNull($consultation->third_party_agreed_at);
    }

    public function test_authenticated_user_is_linked_to_consultation(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->from('/insurance-checkup')->post('/consultations', [
            'type' => 'checkup',
            'applicant_name' => '이서연',
            'phone' => '010-2222-3333',
            'current_monthly_premium' => 120000,
            'memo' => '현재 가입한 보험을 점검하고 싶어요.',
            'privacy_agreement' => '1',
        ]);

        $response->assertRedirect('/insurance-checkup');

        $consultation = Consultation::firstOrFail();

        $this->assertSame($user->id, $consultation->user_id);
        $this->assertSame(ConsultationType::Checkup, $consultation->type);
        $this->assertSame(120000, $consultation->current_monthly_premium);
        $this->assertNull($consultation->third_party_agreed_at);
    }

    public function test_privacy_agreement_is_required(): void
    {
        $response = $this->from('/')->post('/consultations', [
            'type' => 'product',
            'applicant_name' => '박지호',
            'phone' => '010-9999-1111',
        ]);

        $response->assertRedirect('/');
        $response->assertSessionHasErrors('privacy_agreement');
        $this->assertDatabaseCount('consultations', 0);
    }

    public function test_invalid_consultation_type_is_rejected(): void
    {
        $response = $this->from('/')->post('/consultations', [
            'type' => 'unknown',
            'applicant_name' => '최하윤',
            'phone' => '010-4444-5555',
            'privacy_agreement' => '1',
        ]);

        $response->assertRedirect('/');
        $response->assertSessionHasErrors('type');
        $this->assertDatabaseCount('consultations', 0);
    }
}
