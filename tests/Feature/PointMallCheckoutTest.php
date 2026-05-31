<?php

namespace Tests\Feature;

use App\Enums\PointLedgerType;
use App\Enums\PointMallOrderStatus;
use App\Models\PointLedgerEntry;
use App\Models\PointMallCart;
use App\Models\PointMallCartItem;
use App\Models\PointMallCategory;
use App\Models\PointMallProduct;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PointMallCheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_member_can_add_product_to_cart(): void
    {
        $user = User::factory()->create();
        $product = PointMallProduct::factory()->create([
            'stock_quantity' => 5,
            'is_active' => true,
        ]);

        $response = $this->actingAs($user)->post("/point-mall/products/{$product->slug}/cart", [
            'quantity' => 2,
        ]);

        $response->assertRedirect('/point-mall/cart');
        $this->assertDatabaseHas('point_mall_cart_items', [
            'point_mall_product_id' => $product->id,
            'quantity' => 2,
        ]);
    }

    public function test_checkout_allows_purchase_when_points_are_short_and_records_cash_shortfall_and_delivery_fee(): void
    {
        $user = User::factory()->create();
        $category = PointMallCategory::factory()->create();
        $product = PointMallProduct::factory()->for($category, 'category')->create([
            'name' => '커피 쿠폰',
            'point_price' => 5000,
            'stock_quantity' => 3,
            'delivery_type' => 'paid',
            'delivery_fee' => 3000,
            'is_active' => true,
        ]);

        PointLedgerEntry::factory()->for($user)->create([
            'type' => PointLedgerType::Earned,
            'points' => 4000,
            'balance_after' => 4000,
            'memo' => '테스트 적립',
        ]);

        $cart = PointMallCart::create(['user_id' => $user->id]);
        PointMallCartItem::create([
            'point_mall_cart_id' => $cart->id,
            'point_mall_product_id' => $product->id,
            'quantity' => 2,
        ]);

        $response = $this->actingAs($user)->post('/point-mall/cart/checkout', [
            'recipient_name' => '김주문',
            'recipient_phone' => '010-1111-2222',
            'postal_code' => '12345',
            'address_line1' => '서울시 강남구',
            'address_line2' => '101호',
            'delivery_memo' => '문 앞',
        ]);

        $response->assertRedirect('/mypage/point-mall/orders');

        $this->assertDatabaseHas('point_mall_orders', [
            'user_id' => $user->id,
            'status' => PointMallOrderStatus::Paid->value,
            'total_points' => 10000,
            'used_points' => 4000,
            'delivery_fee' => 3000,
            'cash_payment_amount' => 9000,
            'recipient_name' => '김주문',
        ]);
        $this->assertDatabaseHas('point_mall_order_items', [
            'product_name' => '커피 쿠폰',
            'point_price' => 5000,
            'quantity' => 2,
            'line_total_points' => 10000,
        ]);
        $this->assertDatabaseHas('point_ledger_entries', [
            'user_id' => $user->id,
            'type' => PointLedgerType::Spent->value,
            'points' => -4000,
            'balance_after' => 0,
            'memo' => '포인트몰 주문 결제',
        ]);

        $this->assertSame(1, $product->fresh()->stock_quantity);
        $this->assertDatabaseMissing('point_mall_cart_items', [
            'point_mall_cart_id' => $cart->id,
        ]);
    }

    public function test_checkout_blocks_when_cart_quantity_exceeds_stock(): void
    {
        $user = User::factory()->create();
        $product = PointMallProduct::factory()->create([
            'stock_quantity' => 1,
            'is_active' => true,
        ]);
        $cart = PointMallCart::create(['user_id' => $user->id]);
        PointMallCartItem::create([
            'point_mall_cart_id' => $cart->id,
            'point_mall_product_id' => $product->id,
            'quantity' => 2,
        ]);

        $response = $this->actingAs($user)->from('/point-mall/cart')->post('/point-mall/cart/checkout', [
            'recipient_name' => '김주문',
            'recipient_phone' => '010-1111-2222',
            'postal_code' => '12345',
            'address_line1' => '서울시 강남구',
        ]);

        $response->assertRedirect('/point-mall/cart');
        $response->assertSessionHasErrors('cart');
    }
}
