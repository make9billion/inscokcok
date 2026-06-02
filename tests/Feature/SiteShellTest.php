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
        $this->assertStringContainsString('form.post(route(\'consultations.store\')', $source);
        $this->assertStringContainsString('aria-pressed={form.data.interested_product === slide.product}', $source);
        $this->assertStringContainsString('href="/customer/notices"', $source);
        $this->assertStringContainsString('href="/customer"', $source);
        $this->assertStringNotContainsString('href="/notices"', $source);
        $this->assertStringNotContainsString('href="/customer-center"', $source);
    }

    public function test_site_navigation_excludes_my_info_and_exposes_logout(): void
    {
        $navigation = file_get_contents(resource_path('js/Constants/siteNavigation.js'));
        $header = file_get_contents(resource_path('js/Components/SiteHeader.jsx'));
        $authenticatedLayout = file_get_contents(resource_path('js/Layouts/AuthenticatedLayout.jsx'));

        $this->assertStringNotContainsString('내정보', $navigation);
        $this->assertStringNotContainsString("href: '/mypage'", $navigation);
        $this->assertStringContainsString('마이페이지', $header);
        $this->assertStringContainsString('로그아웃', $header);
        $this->assertStringContainsString("method=\"post\"", $header);
        $this->assertStringContainsString("route('logout')", $header);
        $this->assertStringContainsString('대시보드', $authenticatedLayout);
        $this->assertStringContainsString('마이페이지', $authenticatedLayout);
        $this->assertStringContainsString('로그아웃', $authenticatedLayout);
        $this->assertStringContainsString('회원관리', $authenticatedLayout);
        $this->assertStringContainsString('admin.members.index', $authenticatedLayout);
        $this->assertStringContainsString('문의하기', $authenticatedLayout);
        $this->assertStringContainsString('admin.inquiries.index', $authenticatedLayout);
        $this->assertStringContainsString('admin.faqs.index', $authenticatedLayout);
        $this->assertStringContainsString('admin.notices.index', $authenticatedLayout);
        $this->assertStringContainsString('adminLinks', $authenticatedLayout);
        $this->assertStringContainsString('설계사권한', $authenticatedLayout);
        $this->assertStringNotContainsString('상담사권한', $authenticatedLayout);
        $this->assertStringNotContainsString('adminGroups', $authenticatedLayout);
        $this->assertStringNotContainsString('어드민', $authenticatedLayout);
        $this->assertStringNotContainsString('CMS', $authenticatedLayout);
        $this->assertStringNotContainsString('내정보', $header);
        $this->assertStringNotContainsString('profile.edit', $header);
    }

    public function test_footer_contains_company_information_and_grayscale_logo(): void
    {
        $footer = file_get_contents(resource_path('js/Components/SiteFooter.jsx'));

        $this->assertStringContainsString("import logoUrl from '../../images/logo/logo.png'", $footer);
        $this->assertStringContainsString('grayscale', $footer);
        $this->assertStringContainsString('주식회사 만형', $footer);
        $this->assertStringContainsString('인천광역시 미추홀구 주안로 115 전시문화빌딩 601호', $footer);
        $this->assertStringContainsString('경기도 수원시 팔달구 인계로94번길 32 정진빌딩 302호', $footer);
        $this->assertStringContainsString('553-88-01928', $footer);
        $this->assertStringContainsString('강준보', $footer);
        $this->assertStringContainsString('개인정보처리방침', $footer);
        $this->assertStringContainsString('/privacy-policy', $footer);
        $this->assertStringContainsString('제휴문의', $footer);
        $this->assertStringContainsString('/partnership', $footer);
        $this->assertStringNotContainsString('FooterGroup title="서비스"', $footer);
        $this->assertStringNotContainsString('FooterGroup title="보험상품"', $footer);
        $this->assertStringNotContainsString('FooterGroup title="고객센터"', $footer);
    }

    public function test_public_navigation_exposes_inquiry_page(): void
    {
        $source = file_get_contents(resource_path('js/Constants/siteNavigation.js'));

        $this->assertStringContainsString('문의하기', $source);
        $this->assertStringContainsString('/customer/inquiries', $source);
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
    }
}
