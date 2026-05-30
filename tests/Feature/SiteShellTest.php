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
    }
}
