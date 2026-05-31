<?php

namespace Tests\Feature;

use App\Models\PointMallProduct;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminPointMallProductManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_cannot_access_point_mall_product_management(): void
    {
        $member = User::factory()->create();

        $this->actingAs($member)->get('/admin/point-mall/products')->assertForbidden();
    }

    public function test_admin_can_view_point_mall_product_delivery_settings(): void
    {
        $admin = User::factory()->admin()->create();
        $product = PointMallProduct::factory()->create([
            'name' => '커피 쿠폰',
            'delivery_type' => 'paid',
            'delivery_fee' => 3000,
        ]);

        $response = $this->actingAs($admin)->get('/admin/point-mall/products');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/PointMall/Products')
            ->where('products.0.id', $product->id)
            ->where('products.0.name', '커피 쿠폰')
            ->where('products.0.deliveryType', 'paid')
            ->where('products.0.deliveryFee', 3000)
        );
    }

    public function test_admin_can_update_point_mall_product_delivery_settings(): void
    {
        $admin = User::factory()->admin()->create();
        $product = PointMallProduct::factory()->create([
            'delivery_type' => 'free',
            'delivery_fee' => 0,
        ]);

        $response = $this->actingAs($admin)->patch("/admin/point-mall/products/{$product->id}/delivery", [
            'delivery_type' => 'paid',
            'delivery_fee' => 3500,
        ]);

        $response->assertRedirect('/admin/point-mall/products');

        $product->refresh();
        $this->assertSame('paid', $product->delivery_type);
        $this->assertSame(3500, $product->delivery_fee);
    }

    public function test_free_delivery_resets_delivery_fee_to_zero(): void
    {
        $admin = User::factory()->admin()->create();
        $product = PointMallProduct::factory()->create([
            'delivery_type' => 'paid',
            'delivery_fee' => 3000,
        ]);

        $this->actingAs($admin)->patch("/admin/point-mall/products/{$product->id}/delivery", [
            'delivery_type' => 'free',
            'delivery_fee' => 3000,
        ])->assertRedirect('/admin/point-mall/products');

        $product->refresh();
        $this->assertSame('free', $product->delivery_type);
        $this->assertSame(0, $product->delivery_fee);
    }
}
