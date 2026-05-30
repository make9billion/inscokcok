<?php

namespace Tests\Feature;

use App\Models\PointMallCategory;
use App\Models\PointMallProduct;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PointMallCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_point_mall_lists_active_products_only(): void
    {
        $category = PointMallCategory::factory()->create([
            'name' => '모바일 쿠폰',
            'slug' => 'mobile-coupon',
            'sort_order' => 1,
            'is_active' => true,
        ]);
        $activeProduct = PointMallProduct::factory()->for($category, 'category')->create([
            'name' => '커피 쿠폰',
            'slug' => 'coffee-coupon',
            'point_price' => 4500,
            'stock_quantity' => 10,
            'is_active' => true,
        ]);
        PointMallProduct::factory()->for($category, 'category')->create([
            'name' => '비활성 상품',
            'slug' => 'inactive-product',
            'is_active' => false,
        ]);

        $response = $this->get('/point-mall');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('PointMall/Index')
            ->where('categories.0.name', '모바일 쿠폰')
            ->where('products.0.id', $activeProduct->id)
            ->where('products.0.name', '커피 쿠폰')
            ->where('products.0.pointPrice', 4500)
            ->where('products.0.stockQuantity', 10)
            ->missing('products.1')
        );
    }

    public function test_point_mall_product_detail_shows_active_product(): void
    {
        $category = PointMallCategory::factory()->create(['name' => '건강식품']);
        $product = PointMallProduct::factory()->for($category, 'category')->create([
            'name' => '비타민 세트',
            'slug' => 'vitamin-set',
            'summary' => '매일 챙기는 건강 습관',
            'description' => '포인트로 교환할 수 있는 비타민 세트입니다.',
            'point_price' => 12000,
            'stock_quantity' => 3,
            'is_active' => true,
        ]);

        $response = $this->get('/point-mall/products/vitamin-set');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('PointMall/Show')
            ->where('product.id', $product->id)
            ->where('product.name', '비타민 세트')
            ->where('product.categoryName', '건강식품')
            ->where('product.description', '포인트로 교환할 수 있는 비타민 세트입니다.')
            ->where('product.pointPrice', 12000)
        );
    }

    public function test_inactive_product_detail_returns_not_found(): void
    {
        PointMallProduct::factory()->create([
            'slug' => 'inactive-product',
            'is_active' => false,
        ]);

        $this->get('/point-mall/products/inactive-product')->assertNotFound();
    }
}
