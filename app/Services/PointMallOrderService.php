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

            if ($order->status !== PointMallOrderStatus::Pending) {
                $this->pointLedger->refundForPointMallOrder($order);
            }

            $order->update([
                'status' => $order->status === PointMallOrderStatus::Pending
                    ? PointMallOrderStatus::Cancelled
                    : ($order->used_points > 0
                    ? PointMallOrderStatus::Refunded
                    : PointMallOrderStatus::Cancelled),
                'payment_status' => in_array($order->payment_status, ['ready', 'requested'], true)
                    ? 'cancelled'
                    : $order->payment_status,
                'cancelled_at' => now(),
            ]);

            return $order->refresh();
        });
    }

    public function markPaid(PointMallOrder $order, array $paymentData = []): PointMallOrder
    {
        return DB::transaction(function () use ($order, $paymentData) {
            $order->loadMissing('user');

            if ($order->status === PointMallOrderStatus::Paid) {
                $this->pointLedger->spendForPointMallOrder($order);

                return $order->refresh();
            }

            if ($order->status !== PointMallOrderStatus::Pending) {
                return $order;
            }

            $this->pointLedger->spendForPointMallOrder($order);

            $order->update([
                'status' => PointMallOrderStatus::Paid,
                'payment_status' => $order->cash_payment_amount > 0 ? 'paid' : 'not_required',
                'payment_key' => $paymentData['payment_key'] ?? $order->payment_key,
                'payment_method' => $paymentData['payment_method'] ?? $order->payment_method,
                'payment_approved_at' => $paymentData['payment_approved_at'] ?? now(),
            ]);

            return $order->refresh();
        });
    }
}
