<?php

namespace Tests\Feature;

use App\Enums\PointLedgerType;
use App\Enums\PointMallOrderStatus;
use App\Models\PointLedgerEntry;
use App\Models\PointMallCart;
use App\Models\PointMallCartItem;
use App\Models\PointMallOrder;
use App\Models\PointMallOrderItem;
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

    public function test_checkout_with_cash_payment_creates_pending_order_without_spending_points(): void
    {
        $user = User::factory()->create();
        $product = PointMallProduct::factory()->create([
            'name' => 'Coffee coupon',
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
            'memo' => 'test grant',
        ]);

        $cart = PointMallCart::create(['user_id' => $user->id]);
        PointMallCartItem::create([
            'point_mall_cart_id' => $cart->id,
            'point_mall_product_id' => $product->id,
            'quantity' => 2,
        ]);

        $response = $this->actingAs($user)->post('/point-mall/cart/checkout', [
            'recipient_name' => 'Order user',
            'recipient_phone' => '010-1111-2222',
            'postal_code' => '12345',
            'address_line1' => 'Seoul',
            'address_line2' => '101',
            'delivery_memo' => 'Door',
        ]);

        $response->assertRedirect('/mypage/point-mall/orders');

        $order = PointMallOrder::first();
        $this->assertSame(PointMallOrderStatus::Pending, $order->status);
        $this->assertSame(10000, $order->total_points);
        $this->assertSame(4000, $order->used_points);
        $this->assertSame(3000, $order->delivery_fee);
        $this->assertSame(9000, $order->cash_payment_amount);
        $this->assertSame('toss_payments', $order->payment_provider);
        $this->assertSame('ready', $order->payment_status);
        $this->assertSame($order->order_number, $order->payment_order_id);
        $this->assertNotNull($order->payment_requested_at);

        $this->assertDatabaseHas('point_mall_order_items', [
            'product_name' => 'Coffee coupon',
            'point_price' => 5000,
            'quantity' => 2,
            'line_total_points' => 10000,
        ]);
        $this->assertDatabaseMissing('point_ledger_entries', [
            'user_id' => $user->id,
            'type' => PointLedgerType::Spent->value,
            'points' => -4000,
        ]);

        $this->assertSame(1, $product->fresh()->stock_quantity);
        $this->assertDatabaseMissing('point_mall_cart_items', [
            'point_mall_cart_id' => $cart->id,
        ]);
    }

    public function test_checkout_without_cash_payment_marks_order_paid_and_spends_points_immediately(): void
    {
        $user = User::factory()->create();
        $product = PointMallProduct::factory()->create([
            'point_price' => 3000,
            'stock_quantity' => 2,
            'is_active' => true,
        ]);

        PointLedgerEntry::factory()->for($user)->create([
            'type' => PointLedgerType::Earned,
            'points' => 5000,
            'balance_after' => 5000,
        ]);

        $cart = PointMallCart::create(['user_id' => $user->id]);
        PointMallCartItem::create([
            'point_mall_cart_id' => $cart->id,
            'point_mall_product_id' => $product->id,
            'quantity' => 1,
        ]);

        $this->actingAs($user)->post('/point-mall/cart/checkout', [
            'recipient_name' => 'Point buyer',
            'recipient_phone' => '010-1111-2222',
            'postal_code' => '12345',
            'address_line1' => 'Seoul',
        ])->assertRedirect('/mypage/point-mall/orders');

        $order = PointMallOrder::first();
        $this->assertSame(PointMallOrderStatus::Paid, $order->status);
        $this->assertSame('not_required', $order->payment_status);
        $this->assertDatabaseHas('point_ledger_entries', [
            'user_id' => $user->id,
            'order_id' => $order->id,
            'type' => PointLedgerType::Spent->value,
            'points' => -3000,
            'balance_after' => 2000,
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
            'recipient_name' => 'Order user',
            'recipient_phone' => '010-1111-2222',
            'postal_code' => '12345',
            'address_line1' => 'Seoul',
        ]);

        $response->assertRedirect('/point-mall/cart');
        $response->assertSessionHasErrors('cart');
    }

    public function test_member_can_cancel_paid_order_and_receive_point_refund_and_stock_restore(): void
    {
        $user = User::factory()->create();
        $product = PointMallProduct::factory()->create([
            'stock_quantity' => 3,
        ]);
        $order = PointMallOrder::factory()->for($user)->create([
            'status' => PointMallOrderStatus::Paid,
            'total_points' => 5000,
            'used_points' => 4000,
            'delivery_fee' => 3000,
            'cash_payment_amount' => 4000,
            'ordered_at' => now(),
        ]);

        PointMallOrderItem::create([
            'point_mall_order_id' => $order->id,
            'point_mall_product_id' => $product->id,
            'product_name' => $product->name,
            'point_price' => 5000,
            'quantity' => 2,
            'line_total_points' => 10000,
        ]);

        PointLedgerEntry::factory()->for($user)->create([
            'type' => PointLedgerType::Spent,
            'points' => -4000,
            'balance_after' => 0,
            'order_id' => $order->id,
            'idempotency_key' => 'point-mall-order-spent:'.$order->id,
        ]);

        $response = $this->actingAs($user)->post("/mypage/point-mall/orders/{$order->id}/cancel");

        $response->assertRedirect('/mypage/point-mall/orders');
        $this->assertSame(PointMallOrderStatus::Refunded, $order->fresh()->status);
        $this->assertNotNull($order->fresh()->cancelled_at);
        $this->assertSame(5, $product->fresh()->stock_quantity);
        $this->assertDatabaseHas('point_ledger_entries', [
            'user_id' => $user->id,
            'order_id' => $order->id,
            'type' => PointLedgerType::Refunded->value,
            'points' => 4000,
            'balance_after' => 0,
            'idempotency_key' => 'point-mall-order-refund:'.$order->id,
        ]);
    }

    public function test_member_can_cancel_pending_cash_order_without_point_refund_entry(): void
    {
        $user = User::factory()->create();
        $product = PointMallProduct::factory()->create([
            'stock_quantity' => 3,
        ]);
        $order = PointMallOrder::factory()->for($user)->create([
            'status' => PointMallOrderStatus::Pending,
            'used_points' => 3000,
            'cash_payment_amount' => 2000,
            'payment_status' => 'ready',
        ]);

        PointMallOrderItem::create([
            'point_mall_order_id' => $order->id,
            'point_mall_product_id' => $product->id,
            'product_name' => $product->name,
            'point_price' => 3000,
            'quantity' => 1,
            'line_total_points' => 3000,
        ]);

        $this->actingAs($user)
            ->post("/mypage/point-mall/orders/{$order->id}/cancel")
            ->assertRedirect('/mypage/point-mall/orders');

        $this->assertSame(PointMallOrderStatus::Cancelled, $order->fresh()->status);
        $this->assertSame('cancelled', $order->fresh()->payment_status);
        $this->assertSame(4, $product->fresh()->stock_quantity);
        $this->assertDatabaseMissing('point_ledger_entries', [
            'order_id' => $order->id,
            'type' => PointLedgerType::Refunded->value,
        ]);
    }

    public function test_member_cannot_cancel_another_members_order(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $order = PointMallOrder::factory()->for($otherUser)->create([
            'status' => PointMallOrderStatus::Paid,
        ]);

        $this->actingAs($user)
            ->post("/mypage/point-mall/orders/{$order->id}/cancel")
            ->assertNotFound();
    }
}
