<?php

namespace Tests\Feature;

use App\Models\SiteContent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SiteShellTest extends TestCase
{
    use RefreshDatabase;

    public function test_homepage_renders_insurance_site_shell(): void
    {
        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('Welcome'));
        $response->assertSee('data-page', false);
    }

    public function test_homepage_receives_published_cms_contents(): void
    {
        SiteContent::create([
            'type' => 'notice',
            'title' => 'CMS notice',
            'body' => 'Notice body',
            'link_url' => '/customer/notices/cms',
            'sort_order' => 1,
            'is_published' => true,
            'published_at' => now(),
        ]);
        SiteContent::create([
            'type' => 'faq',
            'title' => 'CMS question',
            'body' => 'CMS answer',
            'sort_order' => 1,
            'is_published' => true,
            'published_at' => now(),
        ]);
        SiteContent::create([
            'type' => 'main_banner',
            'title' => 'CMS banner',
            'body' => 'Banner body',
            'link_url' => '/insurance-checkup',
            'sort_order' => 1,
            'is_published' => true,
            'published_at' => now(),
        ]);
        SiteContent::create([
            'type' => 'notice',
            'title' => 'Hidden notice',
            'sort_order' => 2,
            'is_published' => false,
        ]);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('cms.notices.0.title', 'CMS notice')
            ->where('cms.notices.0.linkUrl', '/customer/notices/cms')
            ->where('cms.faqs.0.title', 'CMS question')
            ->where('cms.faqs.0.body', 'CMS answer')
            ->where('cms.mainBanners.0.title', 'CMS banner')
            ->missing('cms.notices.1')
        );
    }

    public function test_homepage_source_contains_reference_style_hero_and_sections(): void
    {
        $source = file_get_contents(resource_path('js/Pages/Welcome.jsx'));

        $this->assertStringContainsString('hero-stage', $source);
        $this->assertStringContainsString('hero-track', $source);
        $this->assertStringContainsString('consult-panel', $source);
        $this->assertStringContainsString('product-tabs', $source);
        $this->assertStringContainsString('lead-form', $source);
        $this->assertStringContainsString('암보험', $source);
        $this->assertStringContainsString('치매/간병보험', $source);
        $this->assertStringContainsString('질병/상해보험', $source);
        $this->assertStringContainsString('치아보험', $source);
        $this->assertStringContainsString('펫보험', $source);
        $this->assertStringContainsString('어린이보험', $source);
        $this->assertStringContainsString('보험점검', $source);
        $this->assertStringContainsString('제3자 정보제공 동의', $source);
        $this->assertStringNotContainsString('성별', $source);
        $this->assertStringNotContainsString('생년월일', $source);
        $this->assertStringContainsString('form.post(route(\'consultations.store\')', $source);
        $this->assertStringContainsString('aria-pressed={form.data.interested_product === slide.product}', $source);
        $this->assertStringContainsString('실시간 상담 접수 현황', $source);
        $this->assertStringContainsString('포인트몰 인기 상품', $source);
        $this->assertStringContainsString('진행 중인 이벤트', $source);
        $this->assertStringContainsString('보험지식인', $source);
        $this->assertStringContainsString('공지사항', $source);
        $this->assertStringContainsString('href="/customer/notices"', $source);
        $this->assertStringContainsString('href="/customer"', $source);
        $this->assertStringNotContainsString('href="/notices"', $source);
        $this->assertStringNotContainsString('href="/customer-center"', $source);
    }

    public function test_site_navigation_excludes_my_info_top_level_link(): void
    {
        $navigation = file_get_contents(resource_path('js/Constants/siteNavigation.js'));
        $header = file_get_contents(resource_path('js/Components/SiteHeader.jsx'));

        $this->assertStringNotContainsString('내정보', $navigation);
        $this->assertStringNotContainsString("href: '/mypage'", $navigation);
        $this->assertStringContainsString('마이페이지', $header);
        $this->assertStringNotContainsString('내정보', $header);
        $this->assertStringNotContainsString('profile.edit', $header);
    }

    public function test_insurance_product_navigation_uses_dental_insurance(): void
    {
        $source = file_get_contents(resource_path('js/Constants/siteNavigation.js'));

        $this->assertStringContainsString('치아보험', $source);
        $this->assertStringContainsString('/insurance/dental', $source);
        $this->assertStringNotContainsString('치매보험', $source);
        $this->assertStringNotContainsString('/insurance/dementia\'', $source);
    }

    public function test_static_image_insurance_pages_render(): void
    {
        $response = $this->get('/insurance/dental');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('StaticImagePage')
            ->where('title', '치아보험')
            ->where('images.0', 'dental-insurance/01.png')
        );
    }

    public function test_customer_center_pages_render_published_cms_contents(): void
    {
        $notice = SiteContent::create([
            'type' => 'notice',
            'title' => 'Published notice',
            'body' => 'Notice body',
            'sort_order' => 1,
            'is_published' => true,
            'published_at' => now(),
        ]);
        SiteContent::create([
            'type' => 'faq',
            'title' => 'Published FAQ',
            'body' => 'FAQ body',
            'sort_order' => 1,
            'is_published' => true,
            'published_at' => now(),
        ]);
        SiteContent::create([
            'type' => 'notice',
            'title' => 'Hidden notice',
            'is_published' => false,
        ]);

        $this->get('/customer')->assertOk()->assertInertia(fn ($page) => $page
            ->component('Customer/Index')
            ->where('notices.0.title', 'Published notice')
            ->where('faqs.0.title', 'Published FAQ')
            ->missing('notices.1')
        );

        $this->get('/customer/notices')->assertOk()->assertInertia(fn ($page) => $page
            ->component('Customer/Notices')
            ->where('notices.0.title', 'Published notice')
            ->missing('notices.1')
        );

        $this->get("/customer/notices/{$notice->id}")->assertOk()->assertInertia(fn ($page) => $page
            ->component('Customer/NoticeShow')
            ->where('notice.title', 'Published notice')
            ->where('notice.body', 'Notice body')
        );

        $this->get('/customer/faq')->assertOk()->assertInertia(fn ($page) => $page
            ->component('Customer/Faq')
            ->where('faqs.0.title', 'Published FAQ')
            ->where('faqs.0.body', 'FAQ body')
        );
    }

    public function test_company_page_renders_uploaded_company_images(): void
    {
        $this->get('/customer/company')->assertOk()->assertInertia(fn ($page) => $page
            ->component('Customer/Company')
        );

        $source = file_get_contents(resource_path('js/Pages/Customer/Company.jsx'));

        $this->assertStringContainsString('../../../images/company/01.png', $source);
        $this->assertStringContainsString('../../../images/company/02.png', $source);
        $this->assertStringContainsString('회사소개', $source);
    }
}
