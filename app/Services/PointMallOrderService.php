<?php

namespace App\Services;

use App\Enums\PointMallOrderStatus;
use App\Models\PointMallOrder;
use Illuminate\Support\Facades\DB;

class PointMallOrderService
{
    public function __construct(private readonly PointLedgerService $pointLedger)
    {
    }

    public function cancelAndRefund(PointMallOrder $order): PointMallOrder
    {
        return DB::transaction(function () use ($order) {
            $order->loadMissing(['items.product', 'user']);

            if (in_array($order->status, [PointMallOrderStatus::Cancelled, PointMallOrderStatus::Refunded], true)) {
                return $order;
            }

            foreach ($order->items as $item) {
                $item->product?->increment('stock_quantity', $item->quantity);
            }

            $this->pointLedger->refundForPointMallOrder($order);

            $order->update([
                'status' => $order->used_points > 0
                    ? PointMallOrderStatus::Refunded
                    : PointMallOrderStatus::Cancelled,
                'cancelled_at' => now(),
            ]);

            return $order->refresh();
        });
    }
}
