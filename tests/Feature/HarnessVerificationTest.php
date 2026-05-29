<?php

namespace Tests\Feature;

use Tests\TestCase;

class HarnessVerificationTest extends TestCase
{
    public function test_application_homepage_responds_successfully(): void
    {
        $response = $this->get('/');

        $response->assertSuccessful();
    }
}
