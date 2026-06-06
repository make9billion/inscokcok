<?php

namespace Tests\Feature;

use App\Models\PointMallProduct;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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

    public function test_admin_can_update_point_mall_product_details(): void
    {
        $admin = User::factory()->admin()->create();
        $product = PointMallProduct::factory()->create([
            'name' => 'Old product',
            'summary' => 'Old summary',
            'point_price' => 1000,
            'stock_quantity' => 1,
            'delivery_type' => 'free',
            'delivery_fee' => 0,
            'is_featured' => false,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->patch("/admin/point-mall/products/{$product->id}", [
            'point_mall_category_id' => $product->point_mall_category_id,
            'name' => 'Updated product',
            'summary' => 'Updated summary',
            'description' => 'Updated description',
            'point_price' => 2500,
            'stock_quantity' => 12,
            'low_stock_threshold' => 2,
            'delivery_type' => 'paid',
            'delivery_fee' => 3500,
            'sort_order' => 1,
            'is_featured' => true,
            'is_main_visible' => true,
            'is_active' => false,
        ]);

        $response->assertRedirect("/admin/point-mall/products/{$product->id}");

        $product->refresh();
        $this->assertSame('Updated product', $product->name);
        $this->assertSame('Updated summary', $product->summary);
        $this->assertSame(2500, $product->point_price);
        $this->assertSame(12, $product->stock_quantity);
        $this->assertSame('paid', $product->delivery_type);
        $this->assertSame(3500, $product->delivery_fee);
        $this->assertTrue($product->is_featured);
        $this->assertFalse($product->is_active);
    }

    public function test_admin_can_create_point_mall_product_with_operating_fields(): void
    {
        Storage::fake('public');

        $admin = User::factory()->admin()->create();
        $category = \App\Models\PointMallCategory::factory()->create();

        $response = $this->actingAs($admin)->post('/admin/point-mall/products', [
            'point_mall_category_id' => $category->id,
            'name' => 'Dental care gift',
            'summary' => 'Short summary',
            'description' => 'Detailed description',
            'point_price' => 12000,
            'stock_quantity' => 9,
            'low_stock_threshold' => 3,
            'delivery_type' => 'paid',
            'delivery_fee' => 3000,
            'sort_order' => 7,
            'is_featured' => true,
            'is_main_visible' => true,
            'is_active' => true,
            'image' => UploadedFile::fake()->image('gift.jpg', 600, 400),
        ]);

        $response->assertRedirect('/admin/point-mall/products');

        $product = PointMallProduct::query()->where('name', 'Dental care gift')->firstOrFail();
        $this->assertSame($category->id, $product->point_mall_category_id);
        $this->assertSame('dental-care-gift', $product->slug);
        $this->assertSame(12000, $product->point_price);
        $this->assertSame(9, $product->stock_quantity);
        $this->assertSame(3, $product->low_stock_threshold);
        $this->assertSame(3000, $product->delivery_fee);
        $this->assertSame(7, $product->sort_order);
        $this->assertTrue($product->is_featured);
        $this->assertTrue($product->is_main_visible);
        $this->assertNotNull($product->image_path);
        Storage::disk('public')->assertExists($product->image_path);
        $this->assertDatabaseHas('point_mall_product_logs', [
            'point_mall_product_id' => $product->id,
            'actor_id' => $admin->id,
            'action' => 'created',
        ]);
    }

    public function test_admin_can_create_product_after_soft_deleted_slug_collision(): void
    {
        $admin = User::factory()->admin()->create();
        $category = \App\Models\PointMallCategory::factory()->create();
        $deletedProduct = PointMallProduct::factory()->for($category, 'category')->create([
            'name' => 'Deleted product',
            'slug' => 'deleted-product',
        ]);
        $deletedProduct->delete();

        $response = $this->actingAs($admin)->post('/admin/point-mall/products', [
            'point_mall_category_id' => $category->id,
            'name' => 'Deleted product',
            'summary' => 'Register again',
            'description' => 'Register after deletion',
            'point_price' => 12000,
            'stock_quantity' => 9,
            'low_stock_threshold' => 3,
            'delivery_type' => 'free',
            'delivery_fee' => 0,
            'sort_order' => 7,
            'is_featured' => true,
            'is_main_visible' => true,
            'is_active' => true,
        ]);

        $response->assertRedirect('/admin/point-mall/products');

        $this->assertDatabaseHas('point_mall_products', [
            'name' => 'Deleted product',
            'slug' => 'deleted-product-2',
            'deleted_at' => null,
        ]);
    }

    public function test_admin_can_open_separate_product_create_page(): void
    {
        $admin = User::factory()->admin()->create();
        $category = \App\Models\PointMallCategory::factory()->create(['name' => 'Gift']);

        $response = $this->actingAs($admin)->get('/admin/point-mall/products/create');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/PointMall/ProductCreate')
            ->where('categories.0.id', $category->id)
            ->where('categories.0.name', 'Gift')
        );
    }

    public function test_admin_can_upload_product_description_image(): void
    {
        Storage::fake('public');

        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post('/admin/point-mall/products/description-images', [
            'image' => UploadedFile::fake()->image('detail.jpg', 800, 600),
        ]);

        $response->assertOk();
        $response->assertJsonPath('url', fn (string $url) => str_starts_with($url, '/storage/point-mall-description-images/'));

        $path = str($response->json('url'))->after('/storage/')->toString();
        Storage::disk('public')->assertExists($path);
    }

    public function test_admin_can_upload_large_product_description_image_up_to_ten_megabytes(): void
    {
        Storage::fake('public');

        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post('/admin/point-mall/products/description-images', [
            'image' => UploadedFile::fake()->image('large-detail.jpg', 1600, 1200)->size(8192),
        ]);

        $response->assertOk();
        $response->assertJsonPath('url', fn (string $url) => str_starts_with($url, '/storage/point-mall-description-images/'));

        $path = str($response->json('url'))->after('/storage/')->toString();
        Storage::disk('public')->assertExists($path);
    }

    public function test_admin_can_view_product_detail_and_update_logs(): void
    {
        $admin = User::factory()->admin()->create();
        $product = PointMallProduct::factory()->create([
            'name' => 'Original product',
            'stock_quantity' => 4,
        ]);

        $this->actingAs($admin)->patch("/admin/point-mall/products/{$product->id}", [
            'point_mall_category_id' => $product->point_mall_category_id,
            'name' => 'Updated product',
            'summary' => 'Updated summary',
            'description' => 'Updated detail',
            'point_price' => 2500,
            'stock_quantity' => 12,
            'low_stock_threshold' => 2,
            'delivery_type' => 'free',
            'delivery_fee' => 999,
            'sort_order' => 4,
            'is_featured' => false,
            'is_main_visible' => true,
            'is_active' => true,
        ])->assertRedirect("/admin/point-mall/products/{$product->id}");

        $response = $this->actingAs($admin)->get("/admin/point-mall/products/{$product->id}");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/PointMall/ProductShow')
            ->where('product.name', 'Updated product')
            ->where('product.stockQuantity', 12)
            ->where('product.lowStockThreshold', 2)
            ->where('product.sortOrder', 4)
            ->where('product.isMainVisible', true)
            ->where('logs.0.action', 'updated')
        );
    }

    public function test_admin_can_delete_point_mall_product(): void
    {
        $admin = User::factory()->admin()->create();
        $product = PointMallProduct::factory()->create(['name' => 'Delete product']);

        $response = $this->actingAs($admin)->delete("/admin/point-mall/products/{$product->id}");

        $response->assertRedirect('/admin/point-mall/products');
        $this->assertSoftDeleted('point_mall_products', ['id' => $product->id]);
        $this->assertDatabaseHas('point_mall_product_logs', [
            'point_mall_product_id' => $product->id,
            'actor_id' => $admin->id,
            'action' => 'deleted',
        ]);
    }

    public function test_admin_can_filter_products_and_manage_categories(): void
    {
        $admin = User::factory()->admin()->create();
        $activeCategory = \App\Models\PointMallCategory::factory()->create(['name' => 'Gift', 'sort_order' => 5]);
        $inactiveCategory = \App\Models\PointMallCategory::factory()->create(['name' => 'Hidden']);
        $matchingProduct = PointMallProduct::factory()->for($activeCategory, 'category')->create([
            'name' => 'Coffee coupon',
            'stock_quantity' => 1,
            'low_stock_threshold' => 3,
            'is_active' => true,
            'is_featured' => true,
            'is_main_visible' => true,
        ]);
        PointMallProduct::factory()->for($inactiveCategory, 'category')->create([
            'name' => 'Tea set',
            'stock_quantity' => 20,
            'is_featured' => false,
            'is_main_visible' => false,
        ]);

        $response = $this->actingAs($admin)->get('/admin/point-mall/products?search=coffee&stock=low_stock&featured=1&main_visible=1');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('products.0.id', $matchingProduct->id)
            ->where('filters.search', 'coffee')
            ->where('filters.stock', 'low_stock')
            ->where('filters.featured', '1')
            ->where('filters.main_visible', '1')
        );

        $this->actingAs($admin)->post('/admin/point-mall/categories', [
            'name' => 'New category',
            'sort_order' => 1,
            'is_active' => true,
        ])->assertRedirect('/admin/point-mall/products');

        $this->assertDatabaseHas('point_mall_categories', [
            'name' => 'New category',
            'slug' => 'new-category',
            'sort_order' => 1,
            'is_active' => true,
        ]);
    }

    public function test_product_description_editor_exposes_only_requested_toolbar_controls(): void
    {
        $source = file_get_contents(resource_path('js/Components/Admin/ProductDescriptionEditor.jsx'));

        foreach (['글씨 크기', '굵게', '기울기', '왼쪽 정렬', '가운데 정렬', '오른쪽 정렬', '이미지 추가'] as $label) {
            $this->assertStringContainsString($label, $source);
        }

        foreach (['문단', '제목', '글머리 목록', '번호 목록', '되돌리기', '다시 실행'] as $label) {
            $this->assertStringNotContainsString($label, $source);
        }
    }

    public function test_product_description_editor_centers_uploaded_images_by_default(): void
    {
        $source = file_get_contents(resource_path('js/Components/Admin/ProductDescriptionEditor.jsx'));

        $this->assertStringContainsString("class: 'block mx-auto max-w-full rounded-lg'", $source);
    }
}
