<?php

namespace Tests\Feature;

use App\Models\AdminAuditLog;
use App\Models\Inquiry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InquiryBoardTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_inquiry_page_exposes_categories(): void
    {
        $this->get('/customer/inquiries')->assertOk()->assertInertia(fn ($page) => $page
            ->component('Customer/Inquiries')
            ->where('categories.0.label', '사이트 이용문의')
            ->where('categories.1.label', '이벤트 문의')
            ->where('categories.2.label', '사은품 문의')
            ->where('categories.3.label', '배송 문의')
            ->where('categories.4.label', '기타 문의')
        );
    }

    public function test_guest_can_submit_inquiry(): void
    {
        $response = $this->post('/customer/inquiries', [
            'category' => 'delivery',
            'applicant_name' => '홍길동',
            'phone' => '010-1234-5678',
            'email' => 'user@example.com',
            'title' => '배송 문의드립니다',
            'body' => '사은품 배송 일정이 궁금합니다.',
        ]);

        $response->assertRedirect('/customer/inquiries');
        $this->assertDatabaseHas('inquiries', [
            'category' => 'delivery',
            'applicant_name' => '홍길동',
            'title' => '배송 문의드립니다',
            'status' => 'received',
        ]);
    }

    public function test_member_cannot_access_admin_inquiry_management(): void
    {
        $member = User::factory()->create();

        $this->actingAs($member)->get('/admin/inquiries')->assertForbidden();
    }

    public function test_admin_can_view_and_answer_inquiries(): void
    {
        $admin = User::factory()->admin()->create();
        $inquiry = Inquiry::create([
            'category' => 'gift',
            'applicant_name' => '문의자',
            'phone' => '010-1111-2222',
            'email' => 'asker@example.com',
            'title' => '사은품 문의',
            'body' => '사은품 지급 기준이 궁금합니다.',
            'status' => 'received',
        ]);

        $this->actingAs($admin)->get('/admin/inquiries')->assertOk()->assertInertia(fn ($page) => $page
            ->component('Admin/Inquiries/Index')
            ->where('inquiries.0.title', '사은품 문의')
            ->where('inquiries.0.categoryLabel', '사은품 문의')
            ->where('statusOptions.2.label', '답변완료')
        );

        $response = $this->actingAs($admin)->patch("/admin/inquiries/{$inquiry->id}", [
            'status' => 'answered',
            'admin_reply' => '확인 후 안내드렸습니다.',
        ]);

        $response->assertRedirect('/admin/inquiries');
        $this->assertDatabaseHas('inquiries', [
            'id' => $inquiry->id,
            'status' => 'answered',
            'admin_reply' => '확인 후 안내드렸습니다.',
        ]);
        $this->assertNotNull($inquiry->fresh()->replied_at);

        $audit = AdminAuditLog::query()->where('action', 'inquiry.updated')->firstOrFail();

        $this->assertSame($admin->id, $audit->actor_id);
        $this->assertSame(Inquiry::class, $audit->subject_type);
        $this->assertSame($inquiry->id, $audit->subject_id);
        $this->assertSame('received', $audit->before['status']);
        $this->assertNull($audit->before['admin_reply']);
        $this->assertSame('answered', $audit->after['status']);
        $this->assertSame('확인 후 안내드렸습니다.', $audit->after['admin_reply']);
    }
}
