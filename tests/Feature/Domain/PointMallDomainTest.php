<?php

namespace Tests\Feature\Domain;

use App\Enums\PointMallOrderStatus;
use App\Models\PointMallCart;
use App\Models\PointMallCartItem;
use App\Models\PointMallCategory;
use App\Models\PointMallOrder;
use App\Models\PointMallOrderItem;
use App\Models\PointMallProduct;
use App\Models\User;
use Database\Seeders\PointMallCategorySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PointMallDomainTest extends TestCase
{
    use RefreshDatabase;

    public function test_category_seeder_creates_required_korean_categories(): void
    {
        $this->seed(PointMallCategorySeeder::class);

        foreach (['kitchen', 'health-food', 'mobile-accessories', 'goods'] as $slug) {
            $this->assertDatabaseHas('point_mall_categories', ['slug' => $slug]);
        }
    }

    public function test_cart_and_order_relationships_keep_product_snapshots(): void
    {
        $user = User::factory()->create();
        $category = PointMallCategory::factory()->create();
        $product = PointMallProduct::factory()->for($category, 'category')->create([
            'name' => '멀티 충전 케이블',
            'point_price' => 3000,
        ]);

        $cart = PointMallCart::create(['user_id' => $user->id]);
        PointMallCartItem::create([
            'point_mall_cart_id' => $cart->id,
            'point_mall_product_id' => $product->id,
            'quantity' => 2,
        ]);

        $order = PointMallOrder::factory()->for($user)->create([
            'status' => PointMallOrderStatus::Paid,
            'total_points' => 6000,
            'ordered_at' => now(),
        ]);
        $item = PointMallOrderItem::create([
            'point_mall_order_id' => $order->id,
            'point_mall_product_id' => $product->id,
            'product_name' => $product->name,
            'point_price' => $product->point_price,
            'quantity' => 2,
            'line_total_points' => 6000,
        ]);

        $this->assertSame(PointMallOrderStatus::Paid, $order->status);
        $this->assertTrue($cart->items()->first()->product->is($product));
        $this->assertSame('멀티 충전 케이블', $item->product_name);
        $this->assertTrue($order->items()->first()->is($item));
    }

    public function test_order_item_can_reference_soft_deleted_product(): void
    {
        $product = PointMallProduct::factory()->create();
        $order = PointMallOrder::factory()->create();
        $item = PointMallOrderItem::create([
            'point_mall_order_id' => $order->id,
            'point_mall_product_id' => $product->id,
            'product_name' => $product->name,
            'point_price' => $product->point_price,
            'quantity' => 1,
            'line_total_points' => $product->point_price,
        ]);

        $product->delete();

        $this->assertTrue($item->fresh()->product->is($product));
    }

    public function test_pending_order_factory_does_not_set_ordered_at(): void
    {
        $order = PointMallOrder::factory()->create();

        $this->assertSame(PointMallOrderStatus::Pending, $order->status);
        $this->assertNull($order->ordered_at);
    }
}
