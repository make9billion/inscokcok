<?php

namespace Tests\Feature;

use App\Enums\PointLedgerType;
use App\Enums\PointMallOrderStatus;
use App\Models\PointLedgerEntry;
use App\Models\PointMallOrder;
use App\Models\PointMallOrderItem;
use App\Models\PointMallProduct;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminPointMallOrderManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_cannot_access_point_mall_order_management(): void
    {
        $member = User::factory()->create();

        $this->actingAs($member)->get('/admin/point-mall/orders')->assertForbidden();
    }

    public function test_admin_can_view_point_mall_orders(): void
    {
        $admin = User::factory()->admin()->create();
        $member = User::factory()->create(['name' => 'Order member']);
        $order = PointMallOrder::factory()->for($member)->create([
            'status' => PointMallOrderStatus::Paid,
            'order_number' => 'PMTEST001',
            'used_points' => 1000,
            'delivery_fee' => 3000,
            'cash_payment_amount' => 3000,
            'ordered_at' => now(),
        ]);

        $response = $this->actingAs($admin)->get('/admin/point-mall/orders');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/PointMall/Orders')
            ->where('orders.0.id', $order->id)
            ->where('orders.0.orderNumber', 'PMTEST001')
            ->where('orders.0.memberName', 'Order member')
            ->where('orders.0.status', 'paid')
        );
    }

    public function test_admin_can_update_order_status(): void
    {
        $admin = User::factory()->admin()->create();
        $order = PointMallOrder::factory()->create([
            'status' => PointMallOrderStatus::Paid,
        ]);

        $response = $this->actingAs($admin)->patch("/admin/point-mall/orders/{$order->id}/status", [
            'status' => PointMallOrderStatus::Preparing->value,
        ]);

        $response->assertRedirect('/admin/point-mall/orders');
        $this->assertSame(PointMallOrderStatus::Preparing, $order->fresh()->status);
    }

    public function test_admin_can_cancel_order_and_refund_points(): void
    {
        $admin = User::factory()->admin()->create();
        $member = User::factory()->create();
        $product = PointMallProduct::factory()->create([
            'stock_quantity' => 1,
        ]);
        $order = PointMallOrder::factory()->for($member)->create([
            'status' => PointMallOrderStatus::Preparing,
            'used_points' => 3000,
            'ordered_at' => now(),
        ]);

        PointMallOrderItem::create([
            'point_mall_order_id' => $order->id,
            'point_mall_product_id' => $product->id,
            'product_name' => $product->name,
            'point_price' => 3000,
            'quantity' => 2,
            'line_total_points' => 6000,
        ]);

        PointLedgerEntry::factory()->for($member)->create([
            'type' => PointLedgerType::Spent,
            'points' => -3000,
            'balance_after' => 0,
            'order_id' => $order->id,
            'idempotency_key' => 'point-mall-order-spent:'.$order->id,
        ]);

        $response = $this->actingAs($admin)->post("/admin/point-mall/orders/{$order->id}/cancel");

        $response->assertRedirect('/admin/point-mall/orders');
        $this->assertSame(PointMallOrderStatus::Refunded, $order->fresh()->status);
        $this->assertSame(3, $product->fresh()->stock_quantity);
        $this->assertDatabaseHas('point_ledger_entries', [
            'user_id' => $member->id,
            'order_id' => $order->id,
            'type' => PointLedgerType::Refunded->value,
            'points' => 3000,
            'idempotency_key' => 'point-mall-order-refund:'.$order->id,
        ]);
    }
}
