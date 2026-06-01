<?php

namespace Database\Seeders;

use App\Models\SiteContent;
use Illuminate\Database\Seeder;

class SiteContentSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $contents = [
            [
                'type' => 'main_banner',
                'title' => '보험CC 맞춤 보험점검',
                'body' => '가입한 보장을 한 번에 정리하고 부족한 부분을 확인하세요.',
                'link_url' => '/insurance-checkup',
                'sort_order' => 10,
            ],
            [
                'type' => 'notice',
                'title' => '보험CC 서비스 오픈 안내',
                'body' => '보험 상담, 보험점검, 포인트몰 서비스를 순차적으로 제공합니다.',
                'link_url' => null,
                'sort_order' => 10,
            ],
            [
                'type' => 'faq',
                'title' => '상담 신청 후 언제 연락을 받을 수 있나요?',
                'body' => '운영 시간 내 접수 순서대로 담당자가 연락드립니다.',
                'link_url' => null,
                'sort_order' => 10,
            ],
            [
                'type' => 'company_intro',
                'title' => '보험CC 회사소개',
                'body' => '보험CC는 보험 상담과 포인트 혜택을 연결하는 온라인 보험 플랫폼입니다.',
                'link_url' => '/customer/company',
                'sort_order' => 10,
            ],
            [
                'type' => 'event_guide',
                'title' => '포인트 이벤트 안내',
                'body' => '회원가입과 상담 완료 시 포인트가 적립됩니다.',
                'link_url' => '/events',
                'sort_order' => 10,
            ],
        ];

        foreach ($contents as $content) {
            SiteContent::updateOrCreate(
                [
                    'type' => $content['type'],
                    'title' => $content['title'],
                ],
                [
                    ...$content,
                    'is_published' => true,
                    'published_at' => $now,
                ]
            );
        }
    }
}
