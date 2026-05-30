<?php

namespace Tests\Feature;

use Tests\TestCase;

class SiteShellTest extends TestCase
{
    public function test_homepage_renders_insurance_site_shell(): void
    {
        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('Welcome'));
        $response->assertSee('data-page', false);
    }

    public function test_homepage_source_contains_reference_style_hero_and_sections(): void
    {
        $source = file_get_contents(resource_path('js/Pages/Welcome.jsx'));

        $this->assertStringContainsString('hero-stage', $source);
        $this->assertStringContainsString('hero-track', $source);
        $this->assertStringContainsString('consult-panel', $source);
        $this->assertStringContainsString('product-tabs', $source);
        $this->assertStringContainsString('lead-form', $source);
        $this->assertStringContainsString('어떤 상품이 필요하신가요?', $source);
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
}
